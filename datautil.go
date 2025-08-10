package main

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
)

// ImportUserData imports previously exported data by copying the whole directory into app data
func (a *App) ImportUserData(importPath string) error {
	appDataDir := getAppDataDir()
	if importPath == "" {
		return fmt.Errorf("import path is empty")
	}
	// Ensure app data directory exists
	if err := os.MkdirAll(appDataDir, 0755); err != nil {
		return err
	}
	// Copy everything from importPath into appDataDir (merge/overwrite)
	if err := copyDir(importPath, appDataDir); err != nil {
		return err
	}
	// Reload runtime state
	if a.ctx != nil {
		a.loadSettings()
		a.loadAccounts()
		a.loadTemplates()
	} else {
		a.loadSettingsSimple()
		a.loadAccountsSimple()
		a.loadTemplatesSimple()
	}
	a.safeLog("Data import completed: directory merged into app data")
	return nil
}

// ImportAccountsFromDir merges accounts.json from the given directory into existing accounts without duplicates
func (a *App) ImportAccountsFromDir(importPath string) (added int, skipped int, err error) {
	accFile := filepath.Join(importPath, "accounts.json")
	data, readErr := os.ReadFile(accFile)
	if readErr != nil {
		return 0, 0, readErr
	}
	var incoming []Account
	if err := json.Unmarshal(data, &incoming); err != nil {
		return 0, 0, err
	}
	// Build existing set by Email
	existing := make(map[string]bool)
	for _, acc := range a.accounts {
		existing[acc.Email] = true
	}
	for _, inc := range incoming {
		if inc.Email == "" || existing[inc.Email] {
			skipped++
			continue
		}
		a.accounts = append(a.accounts, inc)
		existing[inc.Email] = true
		added++
	}
	// Save and emit
	a.SaveAccounts()
	return added, skipped, nil
}

// ImportTemplatesFromDir merges templates.json from the given directory into existing templates without duplicates (by Name)
func (a *App) ImportTemplatesFromDir(importPath string) (added int, skipped int, err error) {
	tplFile := filepath.Join(importPath, "templates.json")
	data, readErr := os.ReadFile(tplFile)
	if readErr != nil {
		return 0, 0, readErr
	}
	var incoming []Template
	if err := json.Unmarshal(data, &incoming); err != nil {
		return 0, 0, err
	}
	// Build existing set by Name
	existing := make(map[string]bool)
	for _, t := range a.templates {
		existing[t.Name] = true
	}
	for _, inc := range incoming {
		if inc.Name == "" || existing[inc.Name] {
			skipped++
			continue
		}
		a.templates = append(a.templates, inc)
		existing[inc.Name] = true
		added++
	}
	// Save and emit
	a.SaveTemplates()
	return added, skipped, nil
}

// ImportSettingsFromDir replaces settings.json from the given directory
func (a *App) ImportSettingsFromDir(importPath string) error {
	setFile := filepath.Join(importPath, "settings.json")
	data, readErr := os.ReadFile(setFile)
	if readErr != nil {
		return readErr
	}
	var s Settings
	if err := json.Unmarshal(data, &s); err != nil {
		return err
	}
	a.SaveSettings(s)
	return nil
}


// GetAppDataLocation returns the current app data directory path
func (a *App) GetAppDataLocation() string {
	return getAppDataDir()
}

// GetAppDataSize calculates total size of app data
func (a *App) GetAppDataSize() map[string]interface{} {
	appDataDir := getAppDataDir()
	
	var totalSize int64
	fileCount := 0
	files := []map[string]interface{}{}
	
	filepath.Walk(appDataDir, func(path string, info os.FileInfo, err error) error {
		if err == nil && !info.IsDir() {
			totalSize += info.Size()
			fileCount++
			files = append(files, map[string]interface{}{
				"path":     path,
				"size":     info.Size(),
				"modified": info.ModTime().Format("2006-01-02 15:04:05"),
			})
		}
		return nil
	})
	
	return map[string]interface{}{
		"totalSize":          totalSize,
		"totalSizeFormatted": formatBytes(totalSize),
		"fileCount":          fileCount,
		"files":              files,
		"location":           appDataDir,
	}
}

// formatBytes converts bytes to human readable format
func formatBytes(bytes int64) string {
	const unit = 1024
	if bytes < unit {
		return fmt.Sprintf("%d B", bytes)
	}
	div, exp := int64(unit), 0
	for n := bytes / unit; n >= unit; n /= unit {
		div *= unit
		exp++
	}
	return fmt.Sprintf("%.1f %cB", float64(bytes)/float64(div), "KMGTPE"[exp])
}
