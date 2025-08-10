package main

import (
	"context"
	"database/sql"
	"encoding/json"
	"os"
	"path/filepath"

	_ "github.com/mattn/go-sqlite3"
)

// App struct
type App struct {
	ctx           context.Context
	accounts      []Account
	templates     []Template
	contacts      []Contact // All loaded contacts
	filtered      []Contact // Valid/filtered contacts
	invalid       []Contact // Invalid contacts
	fields        []string
	mapping       map[string]string
	attachments   []string
	selectedRows  []int
	dbFile        string
	db            *sql.DB
	emailColumn   string
	accountsFile  string
	templatesFile string
	settingsFile  string
	settings      Settings
	pauseSending  bool // Flag to pause email sending
	stopSending   bool // Flag to stop email sending completely
}

// NewApp creates a new App application struct
func NewApp() *App {
	// Get cross-platform app data directory
	appDataDir := getAppDataDir()

	return &App{
		accountsFile:  filepath.Join(appDataDir, "accounts.json"),
		templatesFile: filepath.Join(appDataDir, "templates.json"),
		settingsFile:  filepath.Join(appDataDir, "settings.json"),
		mapping:       make(map[string]string),
	}
}

// getAppDataDir returns cross-platform app data directory
func getAppDataDir() string {
	// Get user's home directory for cross-platform compatibility
	homeDir, err := os.UserHomeDir()
	if err != nil {
		// Fallback strategies for different platforms
		if homeEnv := os.Getenv("HOME"); homeEnv != "" {
			homeDir = homeEnv // Unix-like systems
		} else if userProfile := os.Getenv("USERPROFILE"); userProfile != "" {
			homeDir = userProfile // Windows
		} else {
			// Last resort: current directory
			homeDir = "."
		}
	}

	// Create app data directory in user's home
	appDataDir := filepath.Join(homeDir, ".bulkmailergo")
	err = os.MkdirAll(appDataDir, 0755)
	if err != nil {
		// If we can't create in home dir, fallback to current directory
		fallbackDir := filepath.Join(".", ".bulkmailergo")
		if fallbackErr := os.MkdirAll(fallbackDir, 0755); fallbackErr == nil {
			return fallbackDir
		}
		// Ultimate fallback: current directory
		return "."
	}

	return appDataDir
}

// Startup is called when the app starts
func (a *App) Startup(ctx context.Context) {
	a.ctx = ctx
	// Yeni oturum başlangıcı
	a.log("---- Session Started ----")
	// Load settings
	a.loadSettings()
	// Load initial data
	a.loadAccounts()
	a.loadTemplates()
}

// Shutdown is called when the app is about to quit
func (a *App) Shutdown(ctx context.Context) {
	a.log("---- Session Ended ----")
}

// Simple loading functions for testing (without runtime events)
func (a *App) loadSettingsSimple() {
	data, err := os.ReadFile(a.settingsFile)
	if err == nil {
		var s Settings
		if json.Unmarshal(data, &s) == nil {
			if s.DateFormat == "" {
				s.DateFormat = "24h"
			}
			if s.DefaultLanguage == "" {
				s.DefaultLanguage = "en"
			}
			a.settings = s
			return
		}
	}
	// defaults
	a.settings = Settings{Country: "", Timezone: "", DateFormat: "24h", DefaultLanguage: "en"}
}

func (a *App) loadAccountsSimple() {
	data, err := os.ReadFile(a.accountsFile)
	if err != nil {
		return
	}
	json.Unmarshal(data, &a.accounts)
}

func (a *App) loadTemplatesSimple() {
	data, err := os.ReadFile(a.templatesFile)
	if err != nil {
		return
	}
	json.Unmarshal(data, &a.templates)
}
