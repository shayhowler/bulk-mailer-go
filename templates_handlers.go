package main

import (
	"fmt"
	"time"
)

// LoadTemplates loads templates from file and returns them
func (a *App) LoadTemplates() []Template {
	a.loadTemplates()
	return a.templates
}

// GetTemplates returns all templates
func (a *App) GetTemplates() []Template {
	return a.templates
}

// SaveTemplate adds or updates a template
func (a *App) SaveTemplate(template Template) string {
	now := time.Now().Format("2006-01-02 15:04:05")
	
	// Check for existing template
	for i, tmpl := range a.templates {
		if tmpl.Name == template.Name {
			// Update existing
			template.ModifiedAt = now
			if template.CreatedAt == "" {
				template.CreatedAt = tmpl.CreatedAt
			}
			a.templates[i] = template
			a.SaveTemplates()
			a.log(fmt.Sprintf("Template updated: %s", template.Name))
			return "Template updated successfully"
		}
	}
	
	// Add new template
	template.CreatedAt = now
	template.ModifiedAt = now
	a.templates = append(a.templates, template)
	a.SaveTemplates()
	a.log(fmt.Sprintf("New template added: %s", template.Name))
	return "Template added successfully"
}

// DeleteTemplate removes a template by name
func (a *App) DeleteTemplate(name string) string {
	for i, tmpl := range a.templates {
		if tmpl.Name == name {
			a.templates = append(a.templates[:i], a.templates[i+1:]...)
			a.SaveTemplates()
			a.log(fmt.Sprintf("Template deleted: %s", name))
			return "Template deleted successfully"
		}
	}
	return "Template not found"
}

// GetTemplate returns a specific template by name
func (a *App) GetTemplate(name string) *Template {
	for _, tmpl := range a.templates {
		if tmpl.Name == name {
			return &tmpl
		}
	}
	return nil
}
