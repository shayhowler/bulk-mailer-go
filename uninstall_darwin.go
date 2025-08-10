// uninstall_darwin.go
//go:build darwin

package main

import (
	"fmt"
	"os"
	"os/exec"
	"strings"
	"time"
)

// removeSelfWithOSScript: .app bundle tespiti ve temizlik script’i
func (a *App) removeSelfWithOSScript() string {
	execPath, err := os.Executable()
	if err != nil {
		return ""
	}

	p := execPath
	marker := "/Contents/MacOS/"
	idx := strings.Index(p, marker)
	if idx == -1 {
		// .app içinden çalışmıyorsa, fallback mesajı
		return "Application is not in a .app bundle. If installed, please remove it manually from the Applications folder."
	}

	bundle := p[:idx]
	if !strings.HasSuffix(bundle, ".app") {
		parts := strings.Split(bundle, "/")
		for i := len(parts) - 1; i >= 0; i-- {
			if strings.HasSuffix(parts[i], ".app") {
				bundle = strings.Join(parts[:i+1], "/")
				break
			}
		}
	}

	script := fmt.Sprintf(`#!/bin/bash
sleep 2
rm -rf "%s"
rm -rf ~/Library/Caches/%s.*
rm -rf ~/Library/Preferences/%s.*
rm -f "$0"
`, bundle, AppBundleID, AppBundleID)

	tmp := "/tmp/uninstall_" + AppLinuxName + "_v2.sh"
	if err := os.WriteFile(tmp, []byte(script), 0755); err != nil {
		return "Failed to create uninstall script. Please remove the app manually from Applications."
	}

	go func() {
		time.Sleep(10 * time.Second)
		_ = exec.Command("/bin/bash", tmp).Start()
		os.Exit(0)
	}()
	return "Application will close in 10 seconds and remove itself."
}
