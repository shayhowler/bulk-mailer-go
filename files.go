package main

import (
	"database/sql"
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"github.com/wailsapp/wails/v2/pkg/runtime"
	"github.com/xuri/excelize/v2"
)

// SelectSourceFile opens a file dialog
func (a *App) SelectSourceFile(fileType string) string {
	filters := map[string]string{
		"SQLite": "*.db",
		"CSV":    "*.csv",
		"Excel":  "*.xlsx;*.xls",
	}
	file, err := runtime.OpenFileDialog(a.ctx, runtime.OpenDialogOptions{
		Filters: []runtime.FileFilter{{DisplayName: fileType + " Files", Pattern: filters[fileType]}},
	})
	if err != nil || file == "" {
		return "Dosya seçimi iptal edildi"
	}
	a.dbFile = file
	return file
}

// GetDefaultExportPath returns the default export path (user's Documents folder)
func (a *App) GetDefaultExportPath() string {
	userHome, err := os.UserHomeDir()
	if err != nil {
		return ""
	}
	return filepath.Join(userHome, "Documents")
}

// SelectDirectory opens a directory selection dialog and returns the chosen path
func (a *App) SelectDirectory(title string) string {
	dir, err := runtime.OpenDirectoryDialog(a.ctx, runtime.OpenDialogOptions{Title: title})
	if err != nil || dir == "" {
		return "Klasör seçimi iptal edildi"
	}
	return dir
}

// LoadFieldsFromFile loads database tables/columns or CSV/Excel fields
func (a *App) LoadFieldsFromFile(fileType string, table string) []string {
	if fileType == "SQLite" {
		db, err := sql.Open("sqlite3", a.dbFile)
		if err != nil {
			a.log(fmt.Sprintf("ERROR: SQLite database could not be opened: %v", err))
			return []string{}
		}
		a.db = db
		if table == "" {
			// tablo adlarını döndür
			rows, err := db.Query("SELECT name FROM sqlite_master WHERE type='table'")
			if err != nil {
				a.log(fmt.Sprintf("ERROR: Tables could not be fetched: %v", err))
				return []string{}
			}
			defer rows.Close()
			var tables []string
			for rows.Next() {
				var t string
				rows.Scan(&t)
				tables = append(tables, t)
			}
			return tables
		} else {
			// kolonu döndür
			rows, err := db.Query(fmt.Sprintf("PRAGMA table_info(%s)", table))
			if err != nil {
				a.log(fmt.Sprintf("ERROR: Columns could not be fetched: %v", err))
				return []string{}
			}
			defer rows.Close()
			var columns []string
			for rows.Next() {
				var cid int
				var name, ctype string
				var notnull, pk int
				var dflt_value interface{}
				rows.Scan(&cid, &name, &ctype, &notnull, &dflt_value, &pk)
				columns = append(columns, name)
			}
			return columns
		}
	}

	// CSV/Excel için direk alan adları
	var fields []string
	switch fileType {
	case "CSV":
		data, err := os.ReadFile(a.dbFile)
		if err != nil {
			a.log(fmt.Sprintf("ERROR: CSV file could not be read: %v", err))
			return []string{}
		}
		lines := strings.Split(string(data), "\n")
		if len(lines) > 0 && len(strings.TrimSpace(lines[0])) > 0 {
			ff := strings.Split(lines[0], ",")
			for _, field := range ff {
				field = strings.TrimSpace(field)
				if field != "" {
					fields = append(fields, field)
				}
			}
		}
	case "Excel":
		f, err := excelize.OpenFile(a.dbFile)
		if err != nil {
			a.log(fmt.Sprintf("ERROR: Excel file could not be read: %v", err))
			return []string{}
		}
		sheets := f.GetSheetList()
		if len(sheets) > 0 {
			rows, _ := f.GetRows(sheets[0])
			if len(rows) > 0 && len(rows[0]) > 0 {
				for _, val := range rows[0] {
					val = strings.TrimSpace(val)
					if val != "" {
						fields = append(fields, val)
					}
				}
			}
		}
	}
	a.fields = fields
	if fields == nil {
		fields = []string{}
	}
	return fields
}
