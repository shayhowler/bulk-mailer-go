package main

import (
	"encoding/base64"
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

// applyThemeToHTML processes TinyMCE HTML content and applies theme styling
func applyThemeToHTML(htmlContent string, isDark bool) string {
	// Define theme colors
	var bgColor, textColor, headerColor, linkColor, borderColor, tableBg, tableHeaderBg string
	if isDark {
		bgColor = "#2c3e50"
		textColor = "#ecf0f1"
		headerColor = "#3498db"
		linkColor = "#3498db"
		borderColor = "#34495e"
		tableBg = "#2c3e50"
		tableHeaderBg = "#1a252f"
	} else {
		bgColor = "#ffffff"
		textColor = "#2c3e50"
		headerColor = "#2c3e50"
		linkColor = "#3498db"
		borderColor = "#dee2e6"
		tableBg = "#ffffff"
		tableHeaderBg = "#f8f9fa"
	}

	// Process the HTML content to add inline styles
	// This is a simplified approach - for production, consider using a proper HTML parser

	// Replace paragraph styles
	htmlContent = strings.ReplaceAll(htmlContent, "<p>", fmt.Sprintf(`<p style="margin-bottom: 1em; line-height: 1.6; font-family: Arial, sans-serif; color: %s;">`, textColor))
	htmlContent = strings.ReplaceAll(htmlContent, `<p style="text-align: center;">`, fmt.Sprintf(`<p style="text-align: center; margin-bottom: 1em; line-height: 1.6; font-family: Arial, sans-serif; color: %s;">`, textColor))
	htmlContent = strings.ReplaceAll(htmlContent, `<p style="text-align: right;">`, fmt.Sprintf(`<p style="text-align: right; margin-bottom: 1em; line-height: 1.6; font-family: Arial, sans-serif; color: %s;">`, textColor))
	htmlContent = strings.ReplaceAll(htmlContent, `<p style="text-align: left;">`, fmt.Sprintf(`<p style="text-align: left; margin-bottom: 1em; line-height: 1.6; font-family: Arial, sans-serif; color: %s;">`, textColor))

	// Replace header styles
	for i := 1; i <= 6; i++ {
		tag := fmt.Sprintf("h%d", i)
		htmlContent = strings.ReplaceAll(htmlContent, fmt.Sprintf("<%s>", tag), fmt.Sprintf(`<%s style="margin: 1.5em 0 0.5em 0; font-weight: 600; line-height: 1.3; color: %s; font-family: Arial, sans-serif;">`, tag, headerColor))
		htmlContent = strings.ReplaceAll(htmlContent, fmt.Sprintf(`<%s style="text-align: center;">`, tag), fmt.Sprintf(`<%s style="text-align: center; margin: 1.5em 0 0.5em 0; font-weight: 600; line-height: 1.3; color: %s; font-family: Arial, sans-serif;">`, tag, headerColor))
	}

	// Replace list styles
	htmlContent = strings.ReplaceAll(htmlContent, "<ul>", fmt.Sprintf(`<ul style="margin: 1em 0; font-family: Arial, sans-serif; color: %s;">`, textColor))
	htmlContent = strings.ReplaceAll(htmlContent, "<ol>", fmt.Sprintf(`<ol style="margin: 1em 0; font-family: Arial, sans-serif; color: %s;">`, textColor))
	htmlContent = strings.ReplaceAll(htmlContent, `<ul style="text-align: center;">`, fmt.Sprintf(`<ul style="text-align: center; list-style-position: inside; padding-left: 0; margin: 1em 0; font-family: Arial, sans-serif; color: %s;">`, textColor))
	htmlContent = strings.ReplaceAll(htmlContent, "<li>", fmt.Sprintf(`<li style="margin-bottom: 0.5em; color: %s;">`, textColor))

	// Replace link styles
	htmlContent = strings.ReplaceAll(htmlContent, "<a ", fmt.Sprintf(`<a style="color: %s; text-decoration: underline;" `, linkColor))

	// Replace blockquote styles
	if isDark {
		htmlContent = strings.ReplaceAll(htmlContent, "<blockquote>", `<blockquote style="margin: 1.5em 0; padding: 1em 1.5em; border-left: 4px solid #3498db; background: #34495e; font-style: italic; font-family: Arial, sans-serif; border-radius: 8px; color: #ecf0f1;">`)
	} else {
		htmlContent = strings.ReplaceAll(htmlContent, "<blockquote>", `<blockquote style="margin: 1.5em 0; padding: 1em 1.5em; border-left: 4px solid #3498db; background: #f8f9fa; font-style: italic; font-family: Arial, sans-serif; border-radius: 8px; color: #2c3e50;">`)
	}

	// Fix table styles - remove bad attributes and add proper inline styles
	htmlContent = strings.ReplaceAll(htmlContent, `border="1" cellpadding="6"`, "")
	htmlContent = strings.ReplaceAll(htmlContent, `style="margin-left: auto; margin-right: auto;"`, "")

	// Replace table tag with proper styling
	htmlContent = strings.ReplaceAll(htmlContent, "<table", fmt.Sprintf(`<table cellpadding="0" cellspacing="0" border="0" style="width: 100%%; margin: 1em auto; font-family: Arial, sans-serif; font-size: 14px; border-collapse: collapse; border: 1px solid %s;"`, borderColor))

	// Replace th and td tags
	if isDark {
		htmlContent = strings.ReplaceAll(htmlContent, "<th>", fmt.Sprintf(`<th style="padding: 10px 12px; background-color: %s; color: #ffffff; font-weight: bold; text-align: left; border: 1px solid %s;">`, tableHeaderBg, borderColor))
		htmlContent = strings.ReplaceAll(htmlContent, "<td>", fmt.Sprintf(`<td style="padding: 10px 12px; background-color: %s; color: %s; text-align: left; border: 1px solid %s;">`, tableBg, textColor, borderColor))
	} else {
		htmlContent = strings.ReplaceAll(htmlContent, "<th>", fmt.Sprintf(`<th style="padding: 10px 12px; background-color: %s; color: %s; font-weight: bold; text-align: left; border: 1px solid %s;">`, tableHeaderBg, headerColor, borderColor))
		htmlContent = strings.ReplaceAll(htmlContent, "<td>", fmt.Sprintf(`<td style="padding: 10px 12px; background-color: %s; color: %s; text-align: left; border: 1px solid %s;">`, tableBg, textColor, borderColor))
	}

	// Add row background colors
	htmlContent = strings.ReplaceAll(htmlContent, "<tr>", fmt.Sprintf(`<tr style="background-color: %s;">`, tableBg))

	// Process buttons/CTAs
	htmlContent = strings.ReplaceAll(htmlContent, `style="background: #4f46e5;`, `style="background: #3498db;`)

	// Wrap in complete HTML document with theme
	var wrappedHTML string
	if isDark {
		wrappedHTML = fmt.Sprintf(`<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: %s;">
<div style="background-color: %s; color: %s; font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
%s
</div>
</body>
</html>`, bgColor, bgColor, textColor, htmlContent)
	} else {
		wrappedHTML = fmt.Sprintf(`<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5;">
<div style="background-color: %s; color: %s; font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px;">
%s
</div>
</body>
</html>`, bgColor, textColor, htmlContent)
	}

	return wrappedHTML
}

// ConvertImageToBase64 - Resim dosyasını base64'e çevir
func (a *App) ConvertImageToBase64(imagePath string) string {
	// Eğer zaten base64 ise direkt döndür
	if strings.HasPrefix(imagePath, "data:image/") {
		return imagePath
	}

	// Dosya yolunu düzelt - use centralized app data directory
	if strings.HasPrefix(imagePath, "attachments/") {
		appDataDir := getAppDataDir()
		imagePath = filepath.Join(appDataDir, imagePath)
	}

	// Dosyayı oku
	data, err := os.ReadFile(imagePath)
	if err != nil {
		a.log(fmt.Sprintf("ERROR: Image file could not be read %s: %v", imagePath, err))
		// Hata durumunda orijinal URL'yi döndür
		return imagePath
	}

	// Base64'e çevir
	base64Data := base64.StdEncoding.EncodeToString(data)

	// MIME type'ı belirle
	mimeType := "image/png"
	if strings.HasSuffix(strings.ToLower(imagePath), ".gif") {
		mimeType = "image/gif"
	} else if strings.HasSuffix(strings.ToLower(imagePath), ".jpg") || strings.HasSuffix(strings.ToLower(imagePath), ".jpeg") {
		mimeType = "image/jpeg"
	} else if strings.HasSuffix(strings.ToLower(imagePath), ".webp") {
		mimeType = "image/webp"
	}

	result := fmt.Sprintf("data:%s;base64,%s", mimeType, base64Data)
	a.log(fmt.Sprintf("Resim base64'e çevrildi: %s -> %d bytes", imagePath, len(data)))
	return result
}
