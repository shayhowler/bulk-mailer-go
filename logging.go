package main

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"

)

// Centralized logging: writes once to file, emits one UI event, and uses Wails logger at the correct level
func (a *App) logWithLevel(level string, message string) {
	lvl := strings.ToUpper(strings.TrimSpace(level))
	if lvl == "" {
		lvl = "INFO"
	}
	loc := time.Local
	if a.settings.Timezone != "" {
		if tz, err := time.LoadLocation(a.settings.Timezone); err == nil {
			loc = tz
		}
	}
	ts := time.Now().In(loc)
	line := fmt.Sprintf("[%s] [%s] %s\n", ts.Format("2006-01-02 15:04:05"), lvl, message)

	// Create logs directory using centralized function
	appDataDir := getAppDataDir()
	logsDir := filepath.Join(appDataDir, "logs")
	_ = os.MkdirAll(logsDir, 0755)
	logFile := filepath.Join(logsDir, fmt.Sprintf("logs_%s.txt", ts.Format("2006-01-02_15")))
	if f, err := os.OpenFile(logFile, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644); err == nil {
		_, _ = f.WriteString(line)
		_ = f.Close()
	}

	// Emit to UI once
	safeEventsEmit(a.ctx, "log", line)

	// Wails runtime logger by level
	switch lvl {
	case "ERROR":
		safeLogError(a.ctx, message)
	case "WARN", "WARNING":
		safeLogWarning(a.ctx, message)
	case "DEBUG":
		safeLogDebug(a.ctx, message)
	default:
		safeLogInfo(a.ctx, message)
	}
}

// Backward-compatible info logger
func (a *App) log(message string) { 
	a.logWithLevel("INFO", message) 
}

// LogMessage logs a message from frontend (info level)
func (a *App) LogMessage(message string) {
	a.log(message)
}

// Log provides levelled logging from frontend via Wails runtime
func (a *App) Log(level string, message string) {
	// Map common aliases
	lvl := strings.TrimSpace(strings.ToUpper(level))
	if lvl == "" {
		lvl = "INFO"
	}
	if lvl == "SUCCESS" {
		lvl = "INFO"
	}
	a.logWithLevel(lvl, message)
}

// GetLogFiles returns a list of available log files
func (a *App) GetLogFiles() ([]string, error) {
	// Get logs directory using centralized function
	appDataDir := getAppDataDir()
	logDir := filepath.Join(appDataDir, "logs")
	if _, err := os.Stat(logDir); os.IsNotExist(err) {
		// Create logs directory if it doesn't exist
		if err := os.MkdirAll(logDir, 0755); err != nil {
			a.log(fmt.Sprintf("ERROR: Logs directory could not be created: %v", err))
			return []string{}, err
		}
		return []string{}, nil
	}

	files, err := os.ReadDir(logDir)
	if err != nil {
		a.log(fmt.Sprintf("ERROR: Logs directory could not be read: %v", err))
		return []string{}, err
	}

	var logFiles []string
	for _, file := range files {
		if !file.IsDir() && (strings.HasSuffix(file.Name(), ".txt") || strings.HasSuffix(file.Name(), ".log")) {
			logFiles = append(logFiles, file.Name())
		}
	}

	return logFiles, nil
}

// ReadLogFile reads the content of a specific log file
func (a *App) ReadLogFile(filename string) (string, error) {
	// Security check: prevent directory traversal
	if strings.Contains(filename, "..") || strings.Contains(filename, "/") || strings.Contains(filename, "\\") {
		err := fmt.Errorf("invalid filename: %s", filename)
		a.log(fmt.Sprintf("ERROR: %v", err))
		return "", err
	}

	// Get logs directory using centralized function
	appDataDir := getAppDataDir()
	filePath := filepath.Join(appDataDir, "logs", filename)
	content, err := os.ReadFile(filePath)
	if err != nil {
		a.log(fmt.Sprintf("ERROR: Log file could not be read %s: %v", filename, err))
		return "", err
	}

	return string(content), nil
}

// DeleteLogFile removes a specific log file
func (a *App) DeleteLogFile(filename string) error {
	// Security check
	if strings.Contains(filename, "..") || strings.ContainsAny(filename, "/\\") {
		return fmt.Errorf("invalid filename: %s", filename)
	}
	// Get logs directory using centralized function
	appDataDir := getAppDataDir()
	filePath := filepath.Join(appDataDir, "logs", filename)
	if err := os.Remove(filePath); err != nil {
		a.log(fmt.Sprintf("ERROR: Log file could not be deleted %s: %v", filename, err))
		return err
	}
	a.log(fmt.Sprintf("Log file deleted: %s", filename))
	return nil
}

// DeleteAllLogFiles removes all log files
func (a *App) DeleteAllLogFiles() error {
	// Get logs directory using centralized function
	appDataDir := getAppDataDir()
	logDir := filepath.Join(appDataDir, "logs")
	if _, err := os.Stat(logDir); os.IsNotExist(err) {
		return nil // No logs directory, nothing to delete
	}

	files, err := os.ReadDir(logDir)
	if err != nil {
		a.log(fmt.Sprintf("ERROR: Logs directory could not be read: %v", err))
		return err
	}

	deletedCount := 0
	for _, file := range files {
		if !file.IsDir() && (strings.HasSuffix(file.Name(), ".txt") || strings.HasSuffix(file.Name(), ".log")) {
			filePath := filepath.Join(logDir, file.Name())
			if err := os.Remove(filePath); err != nil {
				a.log(fmt.Sprintf("ERROR: Log file could not be deleted %s: %v", file.Name(), err))
				return err
			}
			deletedCount++
		}
	}

	a.log(fmt.Sprintf("All log files deleted: %d", deletedCount))
	return nil
}

// safeLog safely logs a message without failing if context is invalid
func (a *App) safeLog(message string) {
	defer func() {
		if r := recover(); r != nil {
			// If context is invalid, just print to stdout
			fmt.Println(message)
		}
	}()

	// Check if context is valid before using Wails functions
	if a.ctx != nil {
		// Try to use the normal log function
		a.log(message)
	} else {
		// Fallback to console output
		fmt.Println(message)
	}
}
