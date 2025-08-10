// uninstall_windows.go
//go:build windows

package main

import (
	"errors"
	"os"
	"os/exec"
	"path/filepath"
	"time"

	"golang.org/x/sys/windows/registry"
)

// removeSelfWithOSScript: export sonrası NSIS Uninstall.exe çağır, self-delete yok
func (a *App) removeSelfWithOSScript() string {
	uninstaller, err := findWindowsUninstaller()
	if err != nil || uninstaller == "" {
		return "Uninstaller not found. Please uninstall via Start Menu > " + AppName + " > Uninstall or Control Panel > Programs and Features."
	}

	cmd := exec.Command(uninstaller) // sessiz istersen "/S" ekle
	if err := cmd.Start(); err != nil {
		return "Failed to launch uninstaller. Please uninstall via Control Panel > Programs and Features."
	}

	go func() {
		time.Sleep(1500 * time.Millisecond)
		os.Exit(0)
	}()
	return "Uninstaller has been launched. The app will close now."
}

// NSIS Uninstall.exe konumunu registry + bilinen yollarla bul
func findWindowsUninstaller() (string, error) {
	// HKLM\Software\Microsoft\Windows\CurrentVersion\Uninstall\<AppNameNoSpace>
	keyPath := `Software\Microsoft\Windows\CurrentVersion\Uninstall\` + AppNameNoSpace
	if s, err := readUninstallStringFromRegistry(keyPath); err == nil && s != "" {
		exe := stripQuotes(s)
		if _, statErr := os.Stat(exe); statErr == nil {
			return exe, nil
		}
	}

	// C:\Program Files\<AppName>\Uninstall.exe
	exe := filepath.Join(`C:\Program Files`, AppName, "Uninstall.exe")
	if _, err := os.Stat(exe); err == nil {
		return exe, nil
	}

	// C:\Program Files (x86)\<AppName>\Uninstall.exe
	if pf86 := os.Getenv("ProgramFiles(x86)"); pf86 != "" {
		exe = filepath.Join(pf86, AppName, "Uninstall.exe")
		if _, err := os.Stat(exe); err == nil {
			return exe, nil
		}
	}

	return "", errors.New("uninstaller not found")
}

func readUninstallStringFromRegistry(keyPath string) (string, error) {
	k, err := registry.OpenKey(registry.LOCAL_MACHINE, keyPath, registry.QUERY_VALUE)
	if err != nil {
		return "", err
	}
	defer k.Close()

	if s, _, err := k.GetStringValue("UninstallString"); err == nil {
		return s, nil
	}
	if s, _, err := k.GetStringValue("QuietUninstallString"); err == nil {
		return s, nil
	}
	return "", errors.New("no uninstall string")
}

// stripQuotes: başta/sonda tek veya çift tırnak varsa kırp (güvenli sürüm)
func stripQuotes(s string) string {
	if len(s) < 2 {
		return s
	}
	first := s[0]
	last := s[len(s)-1]

	// Çift tırnak
	if first == '"' && last == '"' {
		return s[1 : len(s)-1]
	}
	// Tek tırnak
	if first == '\'' && last == '\'' {
		return s[1 : len(s)-1]
	}
	return s
}
