package main

import (
	"encoding/json"
	"fmt"
	"net/smtp"
	"os"
)

// LoadAccounts loads accounts from file and returns them
func (a *App) LoadAccounts() []Account {
	a.loadAccounts()
	return a.accounts
}

// GetAccounts returns all accounts
func (a *App) GetAccounts() []Account {
	return a.accounts
}

// SaveAccount adds or updates an account
func (a *App) SaveAccount(account Account) string {
	// Check for existing account
	for i, acc := range a.accounts {
		if acc.Name == account.Name {
			// Update existing
			a.accounts[i] = account
			a.SaveAccounts()
			a.log(fmt.Sprintf("Account updated: %s", account.Name))
			return "Account updated successfully"
		}
	}
	// Add new account
	a.accounts = append(a.accounts, account)
	a.SaveAccounts()
	a.log(fmt.Sprintf("New account added: %s", account.Name))
	return "Account added successfully"
}

// DeleteAccount removes an account by name
func (a *App) DeleteAccount(name string) string {
	for i, acc := range a.accounts {
		if acc.Name == name {
			a.accounts = append(a.accounts[:i], a.accounts[i+1:]...)
			a.SaveAccounts()
			a.log(fmt.Sprintf("Account deleted: %s", name))
			return "Account deleted successfully"
		}
	}
	return "Account not found"
}

// TestSMTPConnection tests an SMTP connection
func (a *App) TestSMTPConnection(account Account) string {
	addr := fmt.Sprintf("%s:%d", account.SMTPServer, account.SMTPPort)
	
	// Create authentication
	auth := smtp.PlainAuth("", account.Email, account.Password, account.SMTPServer)
	
	// Try to connect
	client, err := smtp.Dial(addr)
	if err != nil {
		return fmt.Sprintf("Connection failed: %v", err)
	}
	defer client.Close()
	
	// Start TLS if required
	if account.UseTLS {
		if err = client.StartTLS(nil); err != nil {
			return fmt.Sprintf("TLS failed: %v", err)
		}
	}
	
	// Authenticate
	if err = client.Auth(auth); err != nil {
		return fmt.Sprintf("Authentication failed: %v", err)
	}
	
	return "Connection successful"
}

// UpdateSettings updates and saves settings
func (a *App) UpdateSettings(settings Settings) {
	a.settings = settings
	data, _ := json.MarshalIndent(settings, "", "  ")
	os.WriteFile(a.settingsFile, data, 0644)
	safeEventsEmit(a.ctx, "settingsLoaded", settings)
	a.log("Settings updated")
}

// GetSettings returns current settings
func (a *App) GetSettings() Settings {
	return a.settings
}
