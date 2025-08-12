// uninstall_linux.go
//go:build linux

package main

import (
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"time"
)

// According to your constants.go:
// AppName      = "Bulk Mailer Go"   // display name
// AppLinuxName = "bulkmailer"       // binary/config/cache folder name

const (
	DesktopFileName   = AppLinuxName + ".desktop" // e.g., bulkmailer.desktop
	IconFileNamePng   = "appicon.png"             // packaged icon file name
	AutostartFileName = AppLinuxName + ".desktop" // if you add autostart later
	SystemdUnitName   = "bulkmailer.service"      // optional; ignore if unused
)

// removeSelfWithOSScript performs a complete uninstall on Linux.
// It removes the running binary (with a delayed script), user data (config/cache),
// desktop integration (desktop entry, icons), autostart entry, optional systemd user units,
// refreshes caches, and deletes the uninstall script itself.
// If you need to export user data, run that flow BEFORE calling this function.
func (a *App) removeSelfWithOSScript() string {
	execPath, _ := os.Executable()
	homeDir, _ := os.UserHomeDir()

	// User-scoped data (lowercase namespace)
	configDir := filepath.Join(homeDir, ".config", AppLinuxName)
	cacheDir := filepath.Join(homeDir, ".cache", AppLinuxName)

	// Additional locations to remove (Title-cased namespace, as requested)
	shareAppDir := filepath.Join(homeDir, ".local", "share", "BulkMailerGo")
	cacheAppDir := filepath.Join(homeDir, ".cache", "BulkMailerGo")

	// Desktop integration paths
	desktopUser := filepath.Join(homeDir, ".local", "share", "applications", DesktopFileName)
	iconUserBase := filepath.Join(homeDir, ".local", "share", "icons", "hicolor") // search all sizes under this root
	autostartFile := filepath.Join(homeDir, ".config", "autostart", AutostartFileName)

	// Optional systemd user unit
	systemdUserUnit := filepath.Join(homeDir, ".config", "systemd", "user", SystemdUnitName)

	// For AppImage runs, APPIMAGE env may contain the actual AppImage path
	appImagePath := os.Getenv("APPIMAGE")

	// Build uninstall bash script content
	scriptContent := fmt.Sprintf(`#!/usr/bin/env bash
set -euo pipefail

BIN_PATH=%q
APPIMAGE_PATH=%q

# Smart wait for process exit and file unlock (max ~10s)
attempts=20   # 20 x 0.5s = ~10s
while [ $attempts -gt 0 ]; do
  if [ -n "$BIN_PATH" ] && pgrep -f "$BIN_PATH" >/dev/null 2>&1; then
    sleep 0.5
    attempts=$((attempts-1))
    continue
  fi
  # Try to remove binary early if possible
  if [ -n "$BIN_PATH" ] && [ -f "$BIN_PATH" ]; then
    if rm -f "$BIN_PATH" 2>/dev/null; then
      break
    fi
  fi
  sleep 0.5
  attempts=$((attempts-1))
done

# Best-effort remove binary (in case it wasn't removed above)
if [ -n "$BIN_PATH" ] && [ -f "$BIN_PATH" ]; then
  rm -f "$BIN_PATH" || true
fi

# Remove AppImage file if known
if [ -n "$APPIMAGE_PATH" ] && [ -f "$APPIMAGE_PATH" ]; then
  rm -f "$APPIMAGE_PATH" || true
fi

# Remove user data (lowercase namespace)
rm -rf %q || true
rm -rf %q || true

# Remove additional app data (Title-cased namespace)
rm -rf %q || true
rm -rf %q || true

# Remove desktop entry (if present)
rm -f %q || true

# Remove icons from all sizes under hicolor
if [ -d %q ]; then
  find %q -type f -name %q -print0 2>/dev/null | xargs -0 -r rm -f || true
fi

# Remove autostart entry
rm -f %q || true

# Stop/disable systemd user unit if used
if command -v systemctl >/dev/null 2>&1; then
  systemctl --user stop %q 2>/dev/null || true
  systemctl --user disable %q 2>/dev/null || true
  systemctl --user daemon-reload 2>/dev/null || true
fi
rm -f %q || true

# Refresh desktop and icon caches (best effort)
if command -v update-desktop-database >/dev/null 2>&1; then
  update-desktop-database "${XDG_DATA_HOME:-$HOME/.local/share}/applications" 2>/dev/null || true
fi
if command -v gtk-update-icon-cache >/dev/null 2>&1 && [ -d "${XDG_DATA_HOME:-$HOME/.local/share}/icons/hicolor" ]; then
  gtk-update-icon-cache -f -t "${XDG_DATA_HOME:-$HOME/.local/share}/icons/hicolor" 2>/dev/null || true
fi

# Delete this uninstall script
rm -f "$0" || true
`,
		// Top variables
		execPath, appImagePath,
		// User data (lowercase)
		configDir, cacheDir,
		// Additional locations (Title-cased name)
		shareAppDir, cacheAppDir,
		// Desktop entry
		desktopUser,
		// Icons (base dir, base dir again for find root, file name)
		iconUserBase, iconUserBase, IconFileNamePng,
		// Autostart
		autostartFile,
		// systemd unit (stop/disable + unit file removal)
		SystemdUnitName, SystemdUnitName, systemdUserUnit,
	)

	tmpScript := filepath.Join(os.TempDir(), "uninstall_"+AppLinuxName+".sh")
	if err := os.WriteFile(tmpScript, []byte(scriptContent), 0o755); err != nil {
		return "Failed to create uninstall script. Please remove the app manually."
	}

	// Run cleanup in background and exit the app
	go func() {
		time.Sleep(1 * time.Second)
		_ = exec.Command("/bin/bash", tmpScript).Start()
		os.Exit(0)
	}()

	return "The application will now exit and remove all files. If you need a backup, export your data before confirming uninstall."
}
