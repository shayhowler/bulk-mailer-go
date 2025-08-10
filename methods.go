package main

import (
	"context"
	"encoding/json"
	"fmt"
	"os"

	runtime "github.com/wailsapp/wails/v2/pkg/runtime"
)

// Loading methods
func (a *App) loadSettings() {
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
			safeEventsEmit(a.ctx, "settingsLoaded", s)
			return
		}
	}
	// defaults
	a.settings = Settings{Country: "", Timezone: "", DateFormat: "24h", DefaultLanguage: "en"}
	safeEventsEmit(a.ctx, "settingsLoaded", a.settings)
}

func (a *App) loadAccounts() {
	data, err := os.ReadFile(a.accountsFile)
	if err != nil {
		// If file doesn't exist, create default accounts
		if os.IsNotExist(err) {
			a.accounts = []Account{}
			// Save empty accounts file
			a.SaveAccounts()
		}
		return
	}
	json.Unmarshal(data, &a.accounts)
	safeEventsEmit(a.ctx, "accountsLoaded", a.accounts)
}

func (a *App) loadTemplates() {
	data, err := os.ReadFile(a.templatesFile)
	if err != nil {
		// If file doesn't exist, create empty templates
		if os.IsNotExist(err) {
			a.templates = []Template{}
			a.SaveTemplates()
		}
		return
	}
	json.Unmarshal(data, &a.templates)
	safeEventsEmit(a.ctx, "templatesLoaded", a.templates)
}

// SaveAccounts saves accounts to JSON file
func (a *App) SaveAccounts() {
	data, _ := json.MarshalIndent(a.accounts, "", "  ")
	os.WriteFile(a.accountsFile, data, 0644)
	safeEventsEmit(a.ctx, "accountsLoaded", a.accounts)
}

// SaveTemplates saves templates to JSON file
func (a *App) SaveTemplates() {
	data, _ := json.MarshalIndent(a.templates, "", "  ")
	os.WriteFile(a.templatesFile, data, 0644)
	safeEventsEmit(a.ctx, "templatesLoaded", a.templates)
}

// SaveSettings saves settings to JSON file
func (a *App) SaveSettings(settings Settings) {
	a.settings = settings
	data, _ := json.MarshalIndent(a.settings, "", "  ")
	os.WriteFile(a.settingsFile, data, 0644)
	safeEventsEmit(a.ctx, "settingsLoaded", a.settings)
	a.log("Settings saved successfully")
}

// Safe runtime wrapper functions
func safeEventsEmit(ctx context.Context, eventName string, optionalData ...interface{}) {
	defer func() {
		if r := recover(); r != nil {
			fmt.Printf("Recovered from panic in EventsEmit: %v\n", r)
		}
	}()
	if ctx != nil {
		runtime.EventsEmit(ctx, eventName, optionalData...)
	}
}

func safeLogInfo(ctx context.Context, message string) {
	defer func() {
		if r := recover(); r != nil {
			fmt.Println("INFO:", message)
		}
	}()
	if ctx != nil {
		runtime.LogInfo(ctx, message)
	}
}

func safeLogError(ctx context.Context, message string) {
	defer func() {
		if r := recover(); r != nil {
			fmt.Println("ERROR:", message)
		}
	}()
	if ctx != nil {
		runtime.LogError(ctx, message)
	}
}

func safeLogWarning(ctx context.Context, message string) {
	defer func() {
		if r := recover(); r != nil {
			fmt.Println("WARNING:", message)
		}
	}()
	if ctx != nil {
		runtime.LogWarning(ctx, message)
	}
}

func safeLogDebug(ctx context.Context, message string) {
	defer func() {
		if r := recover(); r != nil {
			fmt.Println("DEBUG:", message)
		}
	}()
	if ctx != nil {
		runtime.LogDebug(ctx, message)
	}
}
