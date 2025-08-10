// Data Import/Export Module

import { showNotification } from './notification.js';
import { state } from './state.js';

// Refresh data info display
export async function refreshDataInfo() {
    try {
        if (!(window.go && window.go.main && window.go.main.App)) {
            const locEl = document.getElementById('data-location');
            const sizeEl = document.getElementById('data-size');
            if (locEl) locEl.value = '';
            if (sizeEl) sizeEl.value = '';
            console.warn('Backend not available: skipping data info refresh');
            return;
        }
        
        const location = await window.go.main.App.GetAppDataLocation();
        const sizeInfo = await window.go.main.App.GetAppDataSize();
        
        document.getElementById('data-location').value = location;
        document.getElementById('data-size').value = sizeInfo.totalSizeFormatted + ` (${sizeInfo.fileCount} files)`;
        
        console.log('Data info refreshed');
        if (window.getText) {
            showNotification(window.getText('notif-data-refreshed'), 'info', { duration: 2500, showProgress: false });
        }
    } catch (error) {
        console.error('Failed to refresh data info:', error);
        alert('Failed to refresh data information: ' + error);
    }
}

// Export data function
export async function exportData() {
    try {
        if (!(window.go && window.go.main && window.go.main.App && typeof window.go.main.App.SelectDirectory === 'function')) {
            showNotification('❌ No backend connection', 'warning');
            return;
        }
        // Use Wails runtime to open directory dialog
        const result = await window.go.main.App.SelectDirectory('Select Export Directory');
        
        if (result && result !== 'Klasör seçimi iptal edildi') {
            console.log('Exporting data to:', result);
            await window.go.main.App.ExportUserData(result);
            const msg = window.getText ? window.getText('notif-export-success').replace('{path}', result) : ('Data exported successfully to: ' + result);
            showNotification(msg, 'success');
        }
    } catch (error) {
        console.error('Export failed:', error);
        const msg = window.getText ? window.getText('notif-export-failed').replace('{error}', String(error)) : ('Export failed: ' + error);
        showNotification(msg, 'error');
    }
}

// Import data function
export async function importData() {
    try {
        if (!(window.go && window.go.main && window.go.main.App && typeof window.go.main.App.SelectDirectory === 'function')) {
            showNotification('❌ No backend connection', 'warning');
            return;
        }
        // Use Wails runtime to open directory dialog
        const result = await window.go.main.App.SelectDirectory('Select Import Directory');
        
        if (result && result !== 'Klasör seçimi iptal edildi') {
            console.log('Importing data from:', result);
            // Import entire directory into app data
            await window.go.main.App.ImportUserData(result);
            const msg = window.getText ? window.getText('notif-import-success').replace('{path}', result) : ('Data imported successfully from: ' + result);
            showNotification(msg, 'success');
            
            // Refresh the UI after import
            await refreshDataInfo();
            
            // Reload other data that might have changed
            if (typeof window.loadSettings === 'function') {
                await window.loadSettings();
            }
            if (typeof window.loadAccounts === 'function') {
                await window.loadAccounts();
            }
            if (typeof window.loadTemplates === 'function') {
                await window.loadTemplates();
            }
        }
    } catch (error) {
        console.error('Import failed:', error);
        const msg = window.getText ? window.getText('notif-import-failed').replace('{error}', String(error)) : ('Import failed: ' + error);
        showNotification(msg, 'error');
    }
}

// Import templates only
export async function importTemplates() {
    try {
        if (!(window.go && window.go.main && window.go.main.App)) {
            showNotification('❌ No backend connection', 'warning');
            return;
        }
        
        // Create file input to select JSON file
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            // Check if file has .json extension
            if (!file.name.endsWith('.json')) {
                showNotification('Please select a JSON file', 'error');
                return;
            }
            
            console.log('Importing templates from file:', file.name);
            
            try {
                // Read file content
                const reader = new FileReader();
                reader.onload = async (event) => {
                    try {
                        // Parse JSON to validate it
                        const templates = JSON.parse(event.target.result);
                        
                        if (!Array.isArray(templates)) {
                            showNotification('Invalid templates file format. Expected an array of templates.', 'error');
                            return;
                        }
                        
                        // Save templates using backend
                        let added = 0;
                        let skipped = 0;
                        
                        for (const template of templates) {
                            if (!template.name || !template.subject || !template.content) {
                                console.warn('Skipping invalid template:', template);
                                continue;
                            }
                            
                            // Check if template already exists
                            const exists = state?.templates?.some(t => t.name === template.name);
                            if (exists) {
                                skipped++;
                                continue;
                            }
                            
                            // Save template
                            try {
                                await window.go.main.App.SaveTemplate({
                                    name: template.name,
                                    subject: template.subject,
                                    content: template.content || template.html || '',
                                    language: template.language || 'en',
                                    is_html: template.is_html !== false
                                });
                                added++;
                            } catch (err) {
                                console.error('Failed to save template:', template.name, err);
                                skipped++;
                            }
                        }
                        
                        const msg = window.getText ? 
                            window.getText('notif-templates-imported').replace('{added}', added).replace('{skipped}', skipped) :
                            `Templates imported: ${added} added, ${skipped} skipped`;
                            
                        showNotification(msg, added > 0 ? 'success' : 'warning');
                        
                        // Reload templates
                        if (window.go && window.go.main && window.go.main.App) {
                            await window.go.main.App.LoadTemplates();
                        }
                    } catch (error) {
                        console.error('Template import failed:', error);
                        const msg = window.getText ? 
                            window.getText('notif-templates-import-failed').replace('{error}', String(error)) :
                            'Failed to import templates: ' + error;
                        showNotification(msg, 'error');
                    }
                };
                
                reader.onerror = () => {
                    showNotification('Failed to read file', 'error');
                };
                
                reader.readAsText(file);
            } catch (error) {
                console.error('File reading failed:', error);
                showNotification('Failed to read templates file: ' + error, 'error');
            }
        };
        
        // Trigger file selection
        input.click();
    } catch (error) {
        console.error('Template import failed:', error);
        showNotification('Failed to import templates: ' + error, 'error');
    }
}

// Import accounts only
export async function importAccounts() {
    try {
        if (!(window.go && window.go.main && window.go.main.App)) {
            showNotification('❌ No backend connection', 'warning');
            return;
        }
        
        // Create file input to select JSON file
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            // Check if file has .json extension
            if (!file.name.endsWith('.json')) {
                showNotification('Please select a JSON file', 'error');
                return;
            }
            
            console.log('Importing accounts from file:', file.name);
            
            try {
                // Read file content
                const reader = new FileReader();
                reader.onload = async (event) => {
                    try {
                        // Parse JSON to validate it
                        const accounts = JSON.parse(event.target.result);
                        
                        if (!Array.isArray(accounts)) {
                            showNotification('Invalid accounts file format. Expected an array of accounts.', 'error');
                            return;
                        }
                        
                        // Save accounts using backend
                        let added = 0;
                        let skipped = 0;
                        
                        for (const account of accounts) {
                            if (!account.email || !account.smtp_server) {
                                console.warn('Skipping invalid account:', account);
                                continue;
                            }
                            
                            // Check if account already exists
                            const exists = state?.accounts?.some(a => a.email === account.email);
                            if (exists) {
                                skipped++;
                                continue;
                            }
                            
                            // Save account
                            try {
                                await window.go.main.App.SaveAccount({
                                    name: account.name || account.email,
                                    email: account.email,
                                    password: account.password || '',
                                    smtp_server: account.smtp_server,
                                    smtp_port: account.smtp_port || 587,
                                    use_tls: account.use_tls !== false
                                });
                                added++;
                            } catch (err) {
                                console.error('Failed to save account:', account.email, err);
                                skipped++;
                            }
                        }
                        
                        const msg = window.getText ? 
                            window.getText('notif-accounts-imported').replace('{added}', added).replace('{skipped}', skipped) :
                            `Accounts imported: ${added} added, ${skipped} skipped`;
                            
                        showNotification(msg, added > 0 ? 'success' : 'warning');
                        
                        // Reload accounts
                        if (window.go && window.go.main && window.go.main.App) {
                            await window.go.main.App.LoadAccounts();
                        }
                    } catch (error) {
                        console.error('Account import failed:', error);
                        const msg = window.getText ? 
                            window.getText('notif-accounts-import-failed').replace('{error}', String(error)) :
                            'Failed to import accounts: ' + error;
                        showNotification(msg, 'error');
                    }
                };
                
                reader.onerror = () => {
                    showNotification('Failed to read file', 'error');
                };
                
                reader.readAsText(file);
            } catch (error) {
                console.error('File reading failed:', error);
                showNotification('Failed to read accounts file: ' + error, 'error');
            }
        };
        
        // Trigger file selection
        input.click();
    } catch (error) {
        console.error('Account import failed:', error);
        showNotification('Failed to import accounts: ' + error, 'error');
    }
}

// Global exports for backward compatibility
window.refreshDataInfo = refreshDataInfo;
window.exportData = exportData;
window.importData = importData;
window.importTemplates = importTemplates;
window.importAccounts = importAccounts;
