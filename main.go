package main

import (
	"embed"
	"log"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"github.com/wailsapp/wails/v2/pkg/options/linux"
	"github.com/wailsapp/wails/v2/pkg/options/mac"
	"github.com/wailsapp/wails/v2/pkg/options/windows"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	appInstance := NewApp()

	err := wails.Run(&options.App{
		Title:             AppName,
		Width:             1600,
		Height:            1000,
		MinWidth:          800,
		MinHeight:         600,
		MaxWidth:          0,
		MaxHeight:         0,
		Frameless:         false,
		DisableResize:     false,
		Fullscreen:        false,
		StartHidden:       false,
		HideWindowOnClose: false,
		WindowStartState:  options.Normal,
		AlwaysOnTop:       false,

		AssetServer: &assetserver.Options{
			Assets:     assets,
			Handler:    nil,
			Middleware: nil,
		},

		// ----- MAC OS SPESİFİK -----
		Mac: &mac.Options{
			Appearance:           mac.NSAppearanceNameDarkAqua,
			WebviewIsTransparent: false,
			WindowIsTranslucent:  false,
			About: &mac.AboutInfo{
				Title:   AppName,
				Message: AppCopyright,
				Icon:    nil,
			},
			TitleBar: &mac.TitleBar{
				TitlebarAppearsTransparent: false,
				HideTitle:                  false,
				HideTitleBar:               false,
				FullSizeContent:            false,
				UseToolbar:                 false,
			},
		},
		// ----- WINDOWS SPESİFİK -----
		Windows: &windows.Options{
			WebviewIsTransparent:              false,
			WindowIsTranslucent:               false,
			BackdropType:                      windows.Auto,
			DisablePinchZoom:                  false,
			DisableWindowIcon:                 false,
			DisableFramelessWindowDecorations: false,
			WebviewUserDataPath:               "",
			WebviewBrowserPath:                "",
			Theme:                             windows.SystemDefault,
			CustomTheme:                       nil,
			ZoomFactor:                        1,
			IsZoomControlEnabled:              true,
			Messages:                          nil,
			OnSuspend:                         nil,
			OnResume:                          nil,
			WindowClassName:                   "",
		},
		// ----- LINUX SPESİFİK -----
		Linux: &linux.Options{
			Icon:                nil,
			WindowIsTranslucent: false,
			WebviewGpuPolicy:    linux.WebviewGpuPolicyNever,
			ProgramName:         AppName,
		},

		// ----- GENEL MENÜ -----
		Logger:             nil,
		LogLevel:           0,
		LogLevelProduction: 0,

		OnStartup:     appInstance.Startup,
		OnDomReady:    nil,
		OnShutdown:    nil,
		OnBeforeClose: nil,

		CSSDragProperty:                  "--wails-draggable",
		CSSDragValue:                     "drag",
		EnableDefaultContextMenu:         false,
		EnableFraudulentWebsiteDetection: false,
		Bind:                             []interface{}{appInstance},
		EnumBind:                         nil,
		ErrorFormatter:                   nil,

		SingleInstanceLock: nil,

		DragAndDrop: &options.DragAndDrop{
			EnableFileDrop:     false,
			DisableWebViewDrop: false,
			CSSDropProperty:    "--wails-drop-target",
			CSSDropValue:       "drop",
		},
		Debug: options.Debug{
			OpenInspectorOnStartup: false,
		},
	})
	if err != nil {
		log.Fatal(err)
	}
}
