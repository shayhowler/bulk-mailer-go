package main

import (
	"fmt"
	"io"
	"os"
	"path/filepath"
	"time"
)

// ExportUserData exports the entire application data directory to a specified directory
func (a *App) ExportUserData(exportPath string) error {
	appDataDir := getAppDataDir()

	// Create export directory with timestamp
	exportDir := filepath.Join(exportPath, AppExportPrefix+time.Now().Format("20060102_150405"))
	if err := os.MkdirAll(exportDir, 0755); err != nil {
		fmt.Printf("ERROR: Export directory could not be created: %v\n", err)
		return err
	}

	// Copy everything under appDataDir recursively, preserving structure
	if err := copyDir(appDataDir, exportDir); err != nil {
		fmt.Printf("ERROR: Export failed while copying data dir: %v\n", err)
		return err
	}

	// Create export summary
	summary := fmt.Sprintf(`%s Data Export Summary
===============================
Export Date: %s
Export Location: %s

This export is a full copy of your application data directory (%s).
It includes:
- accounts.json
- templates.json
- settings.json
- logs/ (all log files)

You can import or restore by pointing the app to this directory or copying files back to the app data location.
`, AppName,
		time.Now().Format("2006-01-02 15:04:05"),
		exportDir,
		appDataDir,
	)
	_ = os.WriteFile(filepath.Join(exportDir, "README.txt"), []byte(summary), 0644)

	a.safeLog(fmt.Sprintf("Data export completed successfully: %s", exportDir))
	return nil
}

// copyDir copies the contents of src directory to dst directory recursively
func copyDir(src, dst string) error {
	// Ensure destination exists
	if err := os.MkdirAll(dst, 0755); err != nil {
		return err
	}
	return filepath.Walk(src, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		// Determine target path
		rel, err := filepath.Rel(src, path)
		if err != nil {
			return err
		}
		target := filepath.Join(dst, rel)

		if info.IsDir() {
			// Create directory in target
			return os.MkdirAll(target, info.Mode())
		}
		// Copy file
		if err := copyFile(path, target, info.Mode()); err != nil {
			return err
		}
		return nil
	})
}

// copyFile copies a single file from src to dst with the given permissions
func copyFile(src, dst string, perm os.FileMode) error {
	srcFile, err := os.Open(src)
	if err != nil {
		return err
	}
	defer srcFile.Close()

	// Ensure parent directory exists
	if err := os.MkdirAll(filepath.Dir(dst), 0755); err != nil {
		return err
	}

	dstFile, err := os.OpenFile(dst, os.O_CREATE|os.O_WRONLY|os.O_TRUNC, perm)
	if err != nil {
		return err
	}
	defer dstFile.Close()

	_, err = io.Copy(dstFile, srcFile)
	return err
}
