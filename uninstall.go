package main

import (
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	srt "runtime"
	"strings"
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
		filepath.Walk(appDataDir, func(path string, info os.FileInfo, err error) error {
			if err == nil && !info.IsDir() {
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

	// Step 4: Schedule app self-removal
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

// removeSelfWithOSScript: improved .app bundle detection on macOS and self deletion
func (a *App) removeSelfWithOSScript() string {
	execPath, err := os.Executable()
	if err != nil {
		return ""
	}
	switch srt.GOOS {
	case "darwin":
		// Typically: /path/App.app/Contents/MacOS/<exec>
		p := execPath
		// Find "/Contents/MacOS/"
		marker := "/Contents/MacOS/"
		idx := strings.Index(p, marker)
		if idx == -1 {
			// fallback to original tryRemoveApplication logic
			return a.tryRemoveApplication()
		}
		bundle := p[:idx]
		if !strings.HasSuffix(bundle, ".app") {
			// go up to bundle root if needed
			parts := strings.Split(bundle, "/")
			for i := len(parts) - 1; i >= 0; i-- {
				if strings.HasSuffix(parts[i], ".app") {
					bundle = strings.Join(parts[:i+1], "/")
					break
				}
			}
		}
		// Clean up Wails specific caches and preferences
		script := fmt.Sprintf(`#!/bin/bash
sleep 2
rm -rf "%s"
rm -rf ~/Library/Caches/%s.*
rm -rf ~/Library/Preferences/%s.*
rm -f "$0"
`, bundle, AppBundleID, AppBundleID)
		tmp := fmt.Sprintf("/tmp/uninstall_%s_v2.sh", AppLinuxName)
		if err := os.WriteFile(tmp, []byte(script), 0755); err != nil {
			return "Failed to create uninstall script. Please remove the app manually from Applications."
		}
		go func() {
			time.Sleep(10 * time.Second)
			_ = exec.Command("/bin/bash", tmp).Start()
			os.Exit(0)
		}()
		return "Application will close in 10 seconds and remove itself."
	case "windows":
		return a.tryRemoveApplication()
	case "linux":
		return a.tryRemoveApplication()
	default:
		return "Please remove the application binary manually after closing it."
	}
}

// tryRemoveApplication attempts to remove the running application bundle/binary.
// On macOS, it tries to delete the .app bundle. On other platforms, it deletes the executable file.
// Returns a note to show to the user (success or instructions if removal failed).
func (a *App) tryRemoveApplication() string {
	execPath, err := os.Executable()
	if err != nil {
		return ""
	}

	// Log the executable path for debugging
	a.log(fmt.Sprintf("Executable path: %s", execPath))

	switch srt.GOOS {
	case "darwin":
		// On macOS, the executable is usually inside .app/Contents/MacOS/
		// We need to find the .app bundle root
		p := execPath

		// Try to find .app in the path
		idx := strings.Index(p, ".app/")
		if idx == -1 {
			// Also try with uppercase
			idx = strings.Index(p, ".APP/")
		}

		if idx == -1 {
			// In development mode or if not in a bundle
			a.log("Not running from .app bundle, skipping app removal")
			return "Application is not in a .app bundle. If installed, please remove it manually from the Applications folder."
		}

		// Get the .app bundle path
		bundle := p[:idx+4]
		a.log(fmt.Sprintf("Found .app bundle at: %s", bundle))

		// Create a shell script that will:
		// 1. Wait for the app to close
		// 2. Delete the app bundle
		// 3. Delete itself
		scriptContent := fmt.Sprintf(`#!/bin/bash
# Wait for the app to fully close
sleep 2

# Remove the app bundle
rm -rf "%s"

# Also clean up any related files
rm -rf ~/Library/Caches/%s.*
rm -rf ~/Library/Preferences/%s.*
rm -rf ~/Library/Application\ Support/%s*

# Remove this script
rm -f "$0"
`, bundle, AppBundleID, AppBundleID, AppDataDirName)

		// Write the script to temp directory
		tmpScript := fmt.Sprintf("/tmp/uninstall_%s.sh", AppLinuxName)
		if err := os.WriteFile(tmpScript, []byte(scriptContent), 0755); err != nil {
			a.log(fmt.Sprintf("Failed to create uninstall script: %v", err))
			return "Failed to create uninstall script. Please remove the app manually."
		}

		// Execute the script in background and exit the app after a delay
		// to allow the UI to show the results
		go func() {
			time.Sleep(10 * time.Second) // Give enough time for UI to show results

			// Run the uninstall script
			cmd := exec.Command("/bin/bash", tmpScript)
			cmd.Start() // Start without waiting

			// Exit the application
			os.Exit(0)
		}()

		return "Application will be completely removed in a few seconds. The app will close automatically in 10 seconds."

	case "windows":
		// On Windows, create a batch file to delete after app closes
		batchContent := fmt.Sprintf(`@echo off
timeout /t 2 /nobreak > nul
del /f /q "%s"
rmdir /s /q "%%APPDATA%%\%s"
rmdir /s /q "%%LOCALAPPDATA%%\%s"
del /f /q "%%~f0"
`, execPath, AppDataDirName, AppDataDirName)

		tmpBatch := filepath.Join(os.TempDir(), fmt.Sprintf("uninstall_%s.bat", AppWindowsName))
		if err := os.WriteFile(tmpBatch, []byte(batchContent), 0755); err != nil {
			return "Failed to create uninstall script. Please remove the app manually."
		}

		go func() {
			time.Sleep(10 * time.Second) // Give enough time for UI to show results
			cmd := exec.Command("cmd", "/c", tmpBatch)
			cmd.Start()
			os.Exit(0)
		}()

		return "Application will be completely removed in a few seconds. The app will close automatically in 10 seconds."

	case "linux":
		// Create a shell script for Linux
		scriptContent := fmt.Sprintf(`#!/bin/bash
sleep 2
rm -f "%s"
rm -rf ~/.cache/%s
rm -rf ~/.config/%s
rm -f "$0"
`, execPath, AppLinuxName, AppLinuxName)

		tmpScript := fmt.Sprintf("/tmp/uninstall_%s.sh", AppLinuxName)
		if err := os.WriteFile(tmpScript, []byte(scriptContent), 0755); err != nil {
			return "Failed to create uninstall script. Please remove the app manually."
		}

		go func() {
			time.Sleep(10 * time.Second) // Give enough time for UI to show results
			cmd := exec.Command("/bin/bash", tmpScript)
			cmd.Start()
			os.Exit(0)
		}()

		return "Application will be completely removed in a few seconds. The app will close automatically in 10 seconds."

	default:
		return "Please remove the application binary manually after closing it."
	}
}
