// uninstall_linux.go
//go:build linux

package main

import (
	"fmt"
	"os"
	"os/exec"
	"time"
)

// removeSelfWithOSScript: binary ve config/cache temizliği için script
func (a *App) removeSelfWithOSScript() string {
	execPath, err := os.Executable()
	if err != nil {
		return ""
	}

	scriptContent := fmt.Sprintf(`#!/bin/bash
sleep 2
rm -f "%s"
rm -rf ~/.cache/%s
rm -rf ~/.config/%s
rm -f "$0"
`, execPath, AppLinuxName, AppLinuxName)

	tmpScript := "/tmp/uninstall_" + AppLinuxName + ".sh"
	if err := os.WriteFile(tmpScript, []byte(scriptContent), 0755); err != nil {
		return "Failed to create uninstall script. Please remove the app manually."
	}

	go func() {
		time.Sleep(10 * time.Second)
		cmd := exec.Command("/bin/bash", tmpScript)
		_ = cmd.Start()
		os.Exit(0)
	}()
	return "Application will be completely removed in a few seconds. The app will close automatically in 10 seconds."
}
