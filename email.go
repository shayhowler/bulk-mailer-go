package main

import (
	"bytes"
	"encoding/base64"
	"fmt"
	"mime"
	"net/smtp"
	"os"
	"path/filepath"
	"strings"
	"time"

)

// SendEmails sends HTML emails to selected contacts
func (a *App) SendEmails(email, subject, content string, cc string, attachments []string) {
	// Default to light theme
	a.sendEmailsWithTheme(email, subject, content, cc, attachments, false)
}

// SendEmailsWithTheme sends HTML emails with theme support
func (a *App) SendEmailsWithTheme(email, subject, content string, cc string, attachments []string, isDarkTheme bool) {
	a.sendEmailsWithTheme(email, subject, content, cc, attachments, isDarkTheme)
}

// PauseSending pauses the email sending process
func (a *App) PauseSending() {
	a.pauseSending = true
	a.log("Email sending paused by user")
	safeEventsEmit(a.ctx, "sendPaused", nil)
}

// ResumeSending resumes the paused email sending process
func (a *App) ResumeSending() {
	a.pauseSending = false
	a.log("Email sending resumed by user")
	safeEventsEmit(a.ctx, "sendResumed", nil)
}

// CancelSending cancels the email sending process completely
func (a *App) CancelSending() {
	a.stopSending = true
	a.pauseSending = false
	a.log("Email sending cancelled by user")
	safeEventsEmit(a.ctx, "notification", map[string]string{
		"message": "Email sending cancelled",
		"type":    "warning",
	})
}

// sendEmailsWithTheme internal function
func (a *App) sendEmailsWithTheme(email, subject, content string, cc string, attachments []string, isDarkTheme bool) {
	a.log("Email sending started")
	a.stopSending = false // Reset stop flag at the beginning

	account := Account{}
	for _, acc := range a.accounts {
		if acc.Email == email {
			account = acc
			break
		}
	}
	if account.Email == "" {
		msg := "ERROR: Account not found"
		a.log(msg)
		safeEventsEmit(a.ctx, "notification", map[string]string{
			"message": msg,
			"type":    "error",
		})
		return
	}

	a.log(fmt.Sprintf("Account found: %s - %s:%d", account.Email, account.SMTPServer, account.SMTPPort))

	ccList := []string{}
	if cc != "" {
		cc = strings.ReplaceAll(cc, " ", "")
		ccList = strings.Split(cc, ",")
	}

	total := len(a.selectedRows)
	if total == 0 {
		msg := "ERROR: No selected recipients"
		a.log(msg)
		safeEventsEmit(a.ctx, "notification", map[string]string{
			"message": msg,
			"type":    "error",
		})
		return
	}

	a.log(fmt.Sprintf("Total %d recipients to send", total))
	a.log(fmt.Sprintf("Mapping info: %v", a.mapping))

	successCount := 0
	failCount := 0
	successList := []string{}
	failList := []string{}

	for i, idx := range a.selectedRows {
		if idx >= len(a.filtered) {
			failCount++
			continue
		}
		contact := a.filtered[idx]
		mailto := contact.Fields[a.emailColumn]
		if strings.TrimSpace(mailto) == "" {
			failCount++
			failList = append(failList, "(no email)")
			continue
		}

		// Check BEFORE processing the email
		// Check if user requested to pause sending
		for a.pauseSending && !a.stopSending {
			// Wait while paused
			time.Sleep(100 * time.Millisecond)
		}
		
		// Check if user requested to stop sending
		if a.stopSending {
			a.log("Email sending cancelled by user request")
			break
		}

		// Şablon değişkenlerini uygula
		values := make(map[string]string)
		for ph, col := range a.mapping {
			if val, exists := contact.Fields[col]; exists {
				values[ph] = fmt.Sprintf("%v", val)
			}
		}
		formattedSubject := subject

		// Apply theme styling to HTML content
		formattedContent := applyThemeToHTML(content, isDarkTheme)

		// Placeholder'ları değiştir
		a.log(fmt.Sprintf("Applying placeholders for recipient %d: %v", i+1, values))
		for k, v := range values {
			formattedSubject = strings.ReplaceAll(formattedSubject, "{"+k+"}", v)
			formattedContent = strings.ReplaceAll(formattedContent, "{"+k+"}", v)
		}

		// Create email message with MIME multipart support
		a.log(fmt.Sprintf("Attachments: %v", attachments))
		message, err := a.createEmailMessage(account.Email, mailto, cc, formattedSubject, formattedContent, attachments)
		if err != nil {
			a.log(fmt.Sprintf("ERROR: Email could not be created %s - %v", mailto, err))
			failCount++
			failList = append(failList, mailto)
			continue
		}

		// SMTP Authentication with proper TLS
		auth := smtp.PlainAuth("", account.Email, account.Password, account.SMTPServer)

		allRecipients := append([]string{mailto}, ccList...)

		a.log(fmt.Sprintf("Sending email: %s -> %s (Attachments: %d)", account.Email, mailto, len(attachments)))
		a.log(fmt.Sprintf("MIME message size: %d bytes", len(message)))

		err = smtp.SendMail(
			fmt.Sprintf("%s:%d", account.SMTPServer, account.SMTPPort),
			auth,
			account.Email,
			allRecipients,
			message,
		)

		var resultMsg string
		var notifType string
		if err != nil {
			resultMsg = fmt.Sprintf("✗ %s failed: %v", mailto, err)
			notifType = "error"
			failCount++
			failList = append(failList, mailto)
			a.log(fmt.Sprintf("ERROR: %s - %v", mailto, err))
		} else {
			resultMsg = fmt.Sprintf("✓ %s sent successfully", mailto)
			notifType = "success"
			successCount++
			successList = append(successList, mailto)
			a.log(fmt.Sprintf("SUCCESS: %s", mailto))
		}

		a.logWithLevel("INFO", resultMsg)
		safeEventsEmit(a.ctx, "notification", map[string]string{
			"message": resultMsg,
			"type":    notifType,
		})

		safeEventsEmit(a.ctx, "sendProgress", map[string]interface{}{
			"progress": (i + 1) * 100 / total,
			"status":   fmt.Sprintf("%d/%d - %s", i+1, total, mailto),
		})

		// Kısa bekleme (çok hızlı gönderim engelleme)
		time.Sleep(500 * time.Millisecond)
	}

	finalMsg := fmt.Sprintf(
		"Sending finished!\nSuccess: %d\nFailed: %d\nSucceeded: %s\nFailed List: %s",
		successCount, failCount, strings.Join(successList, ", "), strings.Join(failList, ", "),
	)
	a.log(finalMsg)
	a.logWithLevel("INFO", finalMsg)
	safeEventsEmit(a.ctx, "notification", map[string]string{
		"message": finalMsg,
		"type":    "info",
	})
	safeEventsEmit(a.ctx, "sendDone")
}

// createEmailMessage builds a MIME email with optional attachments
func (a *App) createEmailMessage(from, to, cc, subject, body string, attachments []string) ([]byte, error) {
	boundary := "my-boundary-779"
	var msg bytes.Buffer

	msg.WriteString(fmt.Sprintf("From: %s\r\n", from))
	msg.WriteString(fmt.Sprintf("To: %s\r\n", to))
	if cc != "" {
		msg.WriteString(fmt.Sprintf("Cc: %s\r\n", cc))
	}
	msg.WriteString(fmt.Sprintf("Subject: %s\r\n", subject))
	msg.WriteString("MIME-Version: 1.0\r\n")
	msg.WriteString(fmt.Sprintf("Content-Type: multipart/mixed; boundary=\"%s\"\r\n", boundary))
	msg.WriteString("\r\n")

	// Attach message body as HTML
	msg.WriteString(fmt.Sprintf("--%s\r\n", boundary))
	msg.WriteString("Content-Type: text/html; charset=utf-8\r\n")
	msg.WriteString("Content-Transfer-Encoding: 7bit\r\n\r\n")
	msg.WriteString(body + "\r\n")

	// Attach files
	for _, file := range attachments {
		msg.WriteString(fmt.Sprintf("--%s\r\n", boundary))
		content, err := os.ReadFile(file)
		if err != nil {
			return nil, err
		}
		msg.WriteString(fmt.Sprintf("Content-Type: %s; name=\"%s\"\r\n", mime.TypeByExtension(filepath.Ext(file)), filepath.Base(file)))
		msg.WriteString("Content-Transfer-Encoding: base64\r\n")
		msg.WriteString(fmt.Sprintf("Content-Disposition: attachment; filename=\"%s\"\r\n\r\n", filepath.Base(file)))
		encoded := base64.StdEncoding.EncodeToString(content)
		// Split base64 into lines of 76 characters
		for i := 0; i < len(encoded); i += 76 {
			end := i + 76
			if end > len(encoded) {
				end = len(encoded)
			}
			msg.WriteString(encoded[i:end] + "\r\n")
		}
	}

	// End MIME message
	msg.WriteString(fmt.Sprintf("--%s--\r\n", boundary))

	return msg.Bytes(), nil
}

// SetMapping stores placeholder mappings
func (a *App) SetMapping(mapping map[string]string) {
	a.mapping = mapping
	a.log(fmt.Sprintf("Mapping updated: %v", mapping))
}
