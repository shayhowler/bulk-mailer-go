package main

import (
	"database/sql"
	"encoding/csv"
	"fmt"
	"os"
	"strings"

	_ "github.com/mattn/go-sqlite3"
	"github.com/xuri/excelize/v2"
)

// LoadTablesOrFields loads tables from SQLite or fields from CSV/Excel
// For SQLite: if sourceType is "SQLite" and tableOrPath is empty string, returns table names
// For SQLite: if sourceType is "SQLite" and tableOrPath is a table name, returns column names
// For CSV: returns field names
// For Excel: if tableOrPath is empty, returns sheet names; otherwise returns field names from that sheet
func (a *App) LoadTablesOrFields(sourceType string, tableOrPath string) []string {
	a.log(fmt.Sprintf("LoadTablesOrFields: type=%s, param=%s", sourceType, tableOrPath))

	switch sourceType {
	case "SQLite":
		if tableOrPath == "" {
			// Return table names
			return a.loadSQLiteTables(a.dbFile)
		} else {
			// Return column names for the specified table
			return a.loadSQLiteColumns(tableOrPath)
		}
	case "CSV":
		if tableOrPath != "" {
			a.dbFile = tableOrPath
		}
		return a.loadCSVFields(a.dbFile)
	case "Excel":
		if tableOrPath == "" {
			// Return sheet names
			return a.loadExcelSheets(a.dbFile)
		} else {
			// Return field names from the specified sheet
			return a.loadExcelFields(tableOrPath)
		}
	default:
		return []string{}
	}
}

func (a *App) loadSQLiteTables(dbPath string) []string {
	db, err := sql.Open("sqlite3", dbPath)
	if err != nil {
		a.log(fmt.Sprintf("ERROR: SQLite connection failed: %v", err))
		return []string{}
	}
	defer db.Close()

	rows, err := db.Query("SELECT name FROM sqlite_master WHERE type='table'")
	if err != nil {
		a.log(fmt.Sprintf("ERROR: Table query failed: %v", err))
		return []string{}
	}
	defer rows.Close()

	var tables []string
	for rows.Next() {
		var name string
		if err := rows.Scan(&name); err == nil {
			tables = append(tables, name)
		}
	}
	return tables
}

func (a *App) loadCSVFields(filePath string) []string {
	file, err := os.Open(filePath)
	if err != nil {
		a.log(fmt.Sprintf("ERROR: CSV file could not be opened: %v", err))
		return []string{}
	}
	defer file.Close()

	reader := csv.NewReader(file)
	headers, err := reader.Read()
	if err != nil {
		a.log(fmt.Sprintf("ERROR: CSV headers could not be read: %v", err))
		return []string{}
	}

	a.fields = headers
	return headers
}

func (a *App) loadExcelSheets(filePath string) []string {
	f, err := excelize.OpenFile(filePath)
	if err != nil {
		a.log(fmt.Sprintf("ERROR: Excel file could not be opened: %v", err))
		return []string{}
	}
	defer f.Close()

	return f.GetSheetList()
}

// loadSQLiteColumns loads column names from a specific SQLite table
func (a *App) loadSQLiteColumns(tableName string) []string {
	db, err := sql.Open("sqlite3", a.dbFile)
	if err != nil {
		a.log(fmt.Sprintf("ERROR: SQLite connection failed: %v", err))
		return []string{}
	}
	defer db.Close()

	// Get column info using PRAGMA
	rows, err := db.Query(fmt.Sprintf("PRAGMA table_info(%s)", tableName))
	if err != nil {
		a.log(fmt.Sprintf("ERROR: Column query failed: %v", err))
		return []string{}
	}
	defer rows.Close()

	var columns []string
	for rows.Next() {
		var cid int
		var name, ctype string
		var notnull, pk int
		var dflt_value interface{}
		if err := rows.Scan(&cid, &name, &ctype, &notnull, &dflt_value, &pk); err == nil {
			columns = append(columns, name)
		}
	}
	a.log(fmt.Sprintf("Found %d columns in table %s", len(columns), tableName))
	return columns
}

// loadExcelFields loads field names (headers) from a specific Excel sheet
func (a *App) loadExcelFields(sheetName string) []string {
	f, err := excelize.OpenFile(a.dbFile)
	if err != nil {
		a.log(fmt.Sprintf("ERROR: Excel file could not be opened: %v", err))
		return []string{}
	}
	defer f.Close()

	rows, err := f.GetRows(sheetName)
	if err != nil {
		a.log(fmt.Sprintf("ERROR: Sheet reading failed: %v", err))
		return []string{}
	}

	if len(rows) == 0 {
		a.log("ERROR: Sheet is empty")
		return []string{}
	}

	// Return the first row as headers
	a.fields = rows[0]
	a.log(fmt.Sprintf("Found %d fields in sheet %s", len(rows[0]), sheetName))
	return rows[0]
}

// LoadContacts loads contacts from the selected source
// Parameters: filePath, sourceType, tableOrSheet, emailColumn
func (a *App) LoadContacts(filePath string, sourceType string, tableOrSheet string, emailColumn string) map[string]interface{} {
	a.log(fmt.Sprintf("Loading contacts: file=%s, type=%s, table=%s, email=%s", filePath, sourceType, tableOrSheet, emailColumn))

	// Update the file path if provided
	if filePath != "" {
		a.dbFile = filePath
	}

	// Reset all contact-related state
	a.emailColumn = emailColumn
	a.contacts = []Contact{}
	a.filtered = []Contact{}
	a.invalid = []Contact{}
	a.selectedRows = []int{} // Reset selected rows when loading new contacts

	var result ImportResult
	switch sourceType {
	case "SQLite":
		result = a.loadContactsFromSQLite(tableOrSheet, emailColumn)
	case "CSV":
		result = a.loadContactsFromCSV(emailColumn)
	case "Excel":
		result = a.loadContactsFromExcel(tableOrSheet, emailColumn)
	default:
		result = ImportResult{
			Success: false,
			Message: "Invalid source type",
		}
	}

	// Convert to the format expected by frontend
	return map[string]interface{}{
		"success": result.Success,
		"total":   result.Total,
		"valid":   a.filtered, // Return actual valid contacts
		"invalid": a.invalid,  // Return actual invalid contacts
		"fields":  result.Fields,
		"message": result.Message,
	}
}

func (a *App) loadContactsFromSQLite(table string, emailColumn string) ImportResult {
	db, err := sql.Open("sqlite3", a.dbFile)
	if err != nil {
		return ImportResult{
			Success: false,
			Message: fmt.Sprintf("Database connection failed: %v", err),
		}
	}
	defer db.Close()
	a.db = db

	// Get columns
	rows, err := db.Query(fmt.Sprintf("SELECT * FROM %s LIMIT 1", table))
	if err != nil {
		return ImportResult{
			Success: false,
			Message: fmt.Sprintf("Table query failed: %v", err),
		}
	}
	cols, _ := rows.Columns()
	rows.Close()
	a.fields = cols

	// Load all data
	rows, err = db.Query(fmt.Sprintf("SELECT * FROM %s", table))
	if err != nil {
		return ImportResult{
			Success: false,
			Message: fmt.Sprintf("Data query failed: %v", err),
		}
	}
	defer rows.Close()

	// Simple email validation: must have @ with text before and after, not empty
	// This accepts emails like k.dogan@kronospan.com.tr

	for rows.Next() {
		values := make([]interface{}, len(cols))
		valuePtrs := make([]interface{}, len(cols))
		for i := range values {
			valuePtrs[i] = &values[i]
		}

		if err := rows.Scan(valuePtrs...); err != nil {
			continue
		}

		contact := Contact{
			Fields: make(map[string]string),
			Data:   make(map[string]interface{}),
		}

		for i, col := range cols {
			if values[i] != nil {
				strVal := fmt.Sprintf("%v", values[i])
				contact.Fields[col] = strVal
				contact.Data[col] = values[i]

				if col == emailColumn {
					contact.Email = strings.TrimSpace(strVal)
					// Simple validation: not empty and contains @ with text on both sides
					if contact.Email == "" {
						contact.Valid = false
					} else if !strings.Contains(contact.Email, "@") {
						contact.Valid = false
					} else {
						parts := strings.Split(contact.Email, "@")
						contact.Valid = len(parts) == 2 && len(parts[0]) > 0 && len(parts[1]) > 0 && strings.Contains(parts[1], ".")
					}
				}
			}
		}

		a.contacts = append(a.contacts, contact)
		if contact.Valid {
			a.filtered = append(a.filtered, contact)
		} else {
			a.invalid = append(a.invalid, contact)
		}
	}

	result := ImportResult{
		Success:  true,
		Total:    len(a.contacts),
		Valid:    len(a.filtered),
		Invalid:  len(a.invalid),
		Fields:   a.fields,
		Message:  fmt.Sprintf("Loaded %d contacts (%d valid, %d invalid)", len(a.contacts), len(a.filtered), len(a.invalid)),
		Contacts: a.filtered,
	}

	safeEventsEmit(a.ctx, "contactsLoaded", result)
	return result
}

func (a *App) loadContactsFromCSV(emailColumn string) ImportResult {
	file, err := os.Open(a.dbFile)
	if err != nil {
		return ImportResult{
			Success: false,
			Message: fmt.Sprintf("CSV file could not be opened: %v", err),
		}
	}
	defer file.Close()

	reader := csv.NewReader(file)
	records, err := reader.ReadAll()
	if err != nil {
		return ImportResult{
			Success: false,
			Message: fmt.Sprintf("CSV reading failed: %v", err),
		}
	}

	if len(records) == 0 {
		return ImportResult{
			Success: false,
			Message: "CSV file is empty",
		}
	}

	headers := records[0]
	a.fields = headers

	emailColIndex := -1
	for i, h := range headers {
		if h == emailColumn {
			emailColIndex = i
			break
		}
	}

	for i := 1; i < len(records); i++ {
		record := records[i]
		contact := Contact{
			Fields: make(map[string]string),
			Data:   make(map[string]interface{}),
		}

		for j, value := range record {
			if j < len(headers) {
				contact.Fields[headers[j]] = value
				contact.Data[headers[j]] = value

				if j == emailColIndex {
					contact.Email = strings.TrimSpace(value)
					// Simple validation: not empty and contains @ with text on both sides
					if contact.Email == "" {
						contact.Valid = false
					} else if !strings.Contains(contact.Email, "@") {
						contact.Valid = false
					} else {
						parts := strings.Split(contact.Email, "@")
						contact.Valid = len(parts) == 2 && len(parts[0]) > 0 && len(parts[1]) > 0 && strings.Contains(parts[1], ".")
					}
				}
			}
		}

		a.contacts = append(a.contacts, contact)
		if contact.Valid {
			a.filtered = append(a.filtered, contact)
		} else {
			a.invalid = append(a.invalid, contact)
		}
	}

	result := ImportResult{
		Success:  true,
		Total:    len(a.contacts),
		Valid:    len(a.filtered),
		Invalid:  len(a.invalid),
		Fields:   a.fields,
		Message:  fmt.Sprintf("Loaded %d contacts (%d valid, %d invalid)", len(a.contacts), len(a.filtered), len(a.invalid)),
		Contacts: a.filtered,
	}

	safeEventsEmit(a.ctx, "contactsLoaded", result)
	return result
}

func (a *App) loadContactsFromExcel(sheetName string, emailColumn string) ImportResult {
	f, err := excelize.OpenFile(a.dbFile)
	if err != nil {
		return ImportResult{
			Success: false,
			Message: fmt.Sprintf("Excel file could not be opened: %v", err),
		}
	}
	defer f.Close()

	rows, err := f.GetRows(sheetName)
	if err != nil {
		return ImportResult{
			Success: false,
			Message: fmt.Sprintf("Sheet reading failed: %v", err),
		}
	}

	if len(rows) == 0 {
		return ImportResult{
			Success: false,
			Message: "Sheet is empty",
		}
	}

	headers := rows[0]
	a.fields = headers

	emailColIndex := -1
	for i, h := range headers {
		if h == emailColumn {
			emailColIndex = i
			break
		}
	}

	for i := 1; i < len(rows); i++ {
		row := rows[i]
		contact := Contact{
			Fields: make(map[string]string),
			Data:   make(map[string]interface{}),
		}

		for j, value := range row {
			if j < len(headers) {
				contact.Fields[headers[j]] = value
				contact.Data[headers[j]] = value

				if j == emailColIndex {
					contact.Email = strings.TrimSpace(value)
					// Simple validation: not empty and contains @ with text on both sides
					if contact.Email == "" {
						contact.Valid = false
					} else if !strings.Contains(contact.Email, "@") {
						contact.Valid = false
					} else {
						parts := strings.Split(contact.Email, "@")
						contact.Valid = len(parts) == 2 && len(parts[0]) > 0 && len(parts[1]) > 0 && strings.Contains(parts[1], ".")
					}
				}
			}
		}

		a.contacts = append(a.contacts, contact)
		if contact.Valid {
			a.filtered = append(a.filtered, contact)
		} else {
			a.invalid = append(a.invalid, contact)
		}
	}

	result := ImportResult{
		Success:  true,
		Total:    len(a.contacts),
		Valid:    len(a.filtered),
		Invalid:  len(a.invalid),
		Fields:   a.fields,
		Message:  fmt.Sprintf("Loaded %d contacts (%d valid, %d invalid)", len(a.contacts), len(a.filtered), len(a.invalid)),
		Contacts: a.filtered,
	}

	safeEventsEmit(a.ctx, "contactsLoaded", result)
	return result
}

// FilterContacts filters contacts based on search text
func (a *App) FilterContacts(searchText string) {
	if searchText == "" {
		a.filtered = make([]Contact, len(a.contacts))
		copy(a.filtered, a.contacts)
		return
	}

	a.filtered = []Contact{}
	searchLower := strings.ToLower(searchText)

	for _, contact := range a.contacts {
		if contact.Valid {
			// Search in all fields
			found := false
			for _, value := range contact.Fields {
				if strings.Contains(strings.ToLower(value), searchLower) {
					found = true
					break
				}
			}
			if found {
				a.filtered = append(a.filtered, contact)
			}
		}
	}
}

// GetSelectedRows returns currently selected row indices
func (a *App) GetSelectedRows() []int {
	return a.selectedRows
}

// SetSelectedRows sets the selected row indices
func (a *App) SetSelectedRows(rows []int) {
	a.selectedRows = rows
	a.log(fmt.Sprintf("Selected %d rows", len(rows)))
}

// GetFields returns the field names from loaded data
func (a *App) GetFields() []string {
	return a.fields
}

// GetFilteredContacts returns the filtered contacts
func (a *App) GetFilteredContacts() []Contact {
	return a.filtered
}

// GetInvalidContacts returns the invalid contacts
func (a *App) GetInvalidContacts() []Contact {
	return a.invalid
}

// GetAllContacts returns all loaded contacts
func (a *App) GetAllContacts() []Contact {
	return a.contacts
}
