// uninstall_common.go
package main

import (
	"fmt"
	"os"
	"path/filepath"
	"time"
)

// UninstallApp performs complete uninstall with optional export
// - exportFirst: export data before removal
// - exportPath: target directory for export
func (a *App) UninstallApp(exportFirst bool, exportPath string) (map[string]interface{}, error) {
	appDataDir := getAppDataDir()

	result := map[string]interface{}{
		"success":      false,
		"exported":     false,
		"exportPath":   "",
		"removedFiles": []string{},
		"instructions": "",
		"errors":       []string{},
	}

	// Step 1: Export if requested
	if exportFirst && exportPath != "" {
		if err := a.ExportUserData(exportPath); err != nil {
			result["errors"] = append(result["errors"].([]string), fmt.Sprintf("Export failed: %v", err))
		} else {
			result["exported"] = true
			exportDir := filepath.Join(exportPath, AppExportPrefix+time.Now().Format("20060102_150405"))
			result["exportPath"] = exportDir
		}
	}

	// Step 2: Collect files to be removed
	removedFiles := []string{}
	if _, err := os.Stat(appDataDir); err == nil {
		_ = filepath.Walk(appDataDir, func(path string, info os.FileInfo, err error) error {
			if err == nil && info != nil && !info.IsDir() {
				removedFiles = append(removedFiles, path)
			}
			return nil
		})
	}
	result["removedFiles"] = removedFiles

	// Step 3: Remove app data directory
	if _, err := os.Stat(appDataDir); err == nil {
		if err := os.RemoveAll(appDataDir); err != nil {
			result["errors"] = append(result["errors"].([]string), fmt.Sprintf("Could not remove app data: %v", err))
		}
	}

	// Step 4: OS-specific removal (platform dosyalarında implement)
	note := a.removeSelfWithOSScript()
	if note != "" {
		result["instructions"] = note
	}

	// Success flag
	if errs := result["errors"].([]string); len(errs) == 0 {
		result["success"] = true
	}

	return result, nil
}
