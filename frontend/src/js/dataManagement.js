// Data Management Module
import { ExportUserData, ImportUserData, UninstallApp, GetAppDataLocation, GetAppDataSize } from '../../wailsjs/go/main/App.js';
import { showNotification } from './utils.js';
import { state } from './state.js';

// Initialize data info on load
async function initializeDataInfo() {
    try {
        // Skip initialization if backend not available
        if (!(window.go && window.go.main && window.go.main.App)) {
            const grid = document.getElementById('log-files-grid');
            if (grid) {
                grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #e74c3c;">❌ No backend connection</div>`;
            }
            return;
        }
        await refreshDataInfo();
    } catch (error) {
        console.error('Failed to initialize data info:', error);
    }
}

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
        const location = await GetAppDataLocation();
        const sizeInfo = await GetAppDataSize();
        
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

// Make refreshDataInfo globally accessible
window.refreshDataInfo = refreshDataInfo;


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
            await ExportUserData(result);
            const msg = window.getText ? window.getText('notif-export-success').replace('{path}', result) : ('Data exported successfully to: ' + result);
            showNotification(msg, 'success');
        }
    } catch (error) {
        console.error('Export failed:', error);
        const msg = window.getText ? window.getText('notif-export-failed').replace('{error}', String(error)) : ('Export failed: ' + error);
        showNotification(msg, 'error');
    }
}
// Keep global for existing inline handlers
window.exportData = exportData;

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
// Keep global for existing inline handlers
window.importData = importData;

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
            
            // Check if file is templates.json or has .json extension
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
window.importTemplates = importTemplates;

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
window.importAccounts = importAccounts;

// Show uninstall dialog with export options
export function showUninstallDialog() {
    // Create modal container
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'uninstall-modal';
    modal.style.display = 'flex';
    
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <div class="modal-header">
                <h3>${window.getText ? window.getText('uninstall-title') : 'Uninstall Application'}</h3>
            </div>
            <div class="modal-body">
                <p class="warning-text" style="color: #e74c3c; font-weight: bold; margin-bottom: 20px;">
                    ⚠️ ${window.getText ? window.getText('uninstall-warning') : 'This will permanently remove all application data!'}
                </p>
                
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="export-before" checked>
                        <span>${window.getText ? window.getText('export-before-label') : 'Export data before uninstalling'}</span>
                    </label>
                </div>
                
                <div class="form-group" id="export-path-group">
                    <label>${window.getText ? window.getText('export-path-label') : 'Export Location:'}</label>
                    <div class="file-input">
                        <input type="text" id="export-path" readonly placeholder="Select export directory...">
                        <button type="button" class="btn-secondary" id="browse-export">Browse</button>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-danger" id="confirm-uninstall">
                    ${window.getText ? window.getText('confirm-uninstall-btn') : 'Uninstall Application'}
                </button>
                <button class="btn-secondary" id="cancel-uninstall">
                    ${window.getText ? window.getText('cancel-uninstall-btn') : 'Cancel'}
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Get elements
    const exportCheckbox = document.getElementById('export-before');
    const exportPathGroup = document.getElementById('export-path-group');
    const exportPathInput = document.getElementById('export-path');
    const browseBtn = document.getElementById('browse-export');
    const confirmBtn = document.getElementById('confirm-uninstall');
    const cancelBtn = document.getElementById('cancel-uninstall');
    
    // Toggle export path visibility
    exportCheckbox.onchange = () => {
        exportPathGroup.style.display = exportCheckbox.checked ? 'block' : 'none';
        updateConfirmButton();
    };
    
    // Update confirm button state
    const updateConfirmButton = () => {
        if (exportCheckbox.checked && !exportPathInput.value) {
            confirmBtn.disabled = true;
        } else {
            confirmBtn.disabled = false;
        }
    };
    
    // Browse button handler
    browseBtn.onclick = async () => {
        try {
            if (window.go && window.go.main && window.go.main.App && window.go.main.App.SelectDirectory) {
                const result = await window.go.main.App.SelectDirectory('Select Export Directory');
                if (result && result !== 'Klasör seçimi iptal edildi') {
                    exportPathInput.value = result;
                    updateConfirmButton();
                }
            }
        } catch (error) {
            console.error('Failed to select directory:', error);
        }
    };
    
    // Set default export path - use Documents folder dynamically
    (async () => {
        try {
            if (window.go && window.go.main && window.go.main.App && window.go.main.App.GetDefaultExportPath) {
                const defaultPath = await window.go.main.App.GetDefaultExportPath();
                if (defaultPath) {
                    exportPathInput.value = defaultPath;
                    console.log('Default export path set to:', defaultPath);
                } else {
                    // Leave empty if no default path
                    exportPathInput.value = '';
                    console.log('No default export path available');
                }
            } else {
                // No backend, leave empty
                exportPathInput.value = '';
                console.log('Backend not available for default path');
            }
        } catch (error) {
            console.error('Failed to get default export path:', error);
            exportPathInput.value = '';
        }
        updateConfirmButton();
    })();
    
    // Confirm button handler
    confirmBtn.onclick = async () => {
        console.log('=== UNINSTALL BUTTON CLICKED ===');
        
        const exportFirst = exportCheckbox.checked;
        const exportPath = exportFirst ? exportPathInput.value : '';
        
        console.log('Export settings:', {
            exportFirst: exportFirst,
            exportPath: exportPath,
            exportPathEmpty: !exportPath
        });
        
        // Check export settings
        if (exportFirst && !exportPath) {
            alert('Please select an export directory or uncheck the export option.');
            confirmBtn.disabled = false;
            confirmBtn.textContent = window.getText ? window.getText('confirm-uninstall-btn') : 'Uninstall Application';
            return;
        }
        
        // Create custom confirmation dialog
        const confirmDialog = document.createElement('div');
        confirmDialog.className = 'modal';
        confirmDialog.style.display = 'flex';
        confirmDialog.style.zIndex = '10000';
        confirmDialog.style.backgroundColor = 'rgba(0,0,0,0.7)';
        
        // Get localized texts
        const getText = window.getText || ((key) => key);
        const confirmTitle = getText('uninstall-confirm-title') || 'Confirm Uninstall';
        const confirmWarning = getText('uninstall-confirm-warning') || 'This will PERMANENTLY DELETE all application data!';
        const exportMessage = getText('uninstall-export-message') || 'Data will be exported to:';
        const confirmQuestion = getText('uninstall-confirm-question') || 'Are you absolutely sure you want to uninstall?';
        const yesButton = getText('uninstall-confirm-yes') || 'YES, UNINSTALL';
        const noButton = getText('uninstall-confirm-no') || 'NO, CANCEL';
        
        let confirmHtml = `
            <div class="modal-content" style="max-width: 500px; text-align: center;">
                <div class="modal-header" style="background: linear-gradient(45deg, #e74c3c, #c0392b); color: white; border-bottom: none;">
                    <h3 style="color: white; margin: 0 auto;">⚠️ ${confirmTitle}</h3>
                </div>
                <div class="modal-body" style="padding: 30px; background: #34495e;">
                    <p style="font-size: 18px; font-weight: bold; color: #e74c3c; margin-bottom: 20px;">
                        ${confirmWarning}
                    </p>`;
        
        if (exportFirst && exportPath) {
            confirmHtml += `
                    <div style="background: #2c3e50; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
                        <p style="font-size: 16px; color: #27ae60; margin: 0;">
                            ✅ ${exportMessage}<br>
                            <strong style="color: #3498db; word-break: break-all;">${exportPath}</strong>
                        </p>
                    </div>`;
        }
        
        confirmHtml += `
                    <p style="font-size: 16px; margin-bottom: 30px; color: #ecf0f1;">
                        ${confirmQuestion}
                    </p>
                </div>
                <div class="modal-footer" style="justify-content: center; gap: 20px; background: #34495e; border-top: 1px solid #7f8c8d;">
                    <button class="btn-danger" id="confirm-yes" style="padding: 12px 30px; font-size: 16px;">
                        ${yesButton}
                    </button>
                    <button class="btn-secondary" id="confirm-no" style="padding: 12px 30px; font-size: 16px;">
                        ${noButton}
                    </button>
                </div>
            </div>
        `;
        
        confirmDialog.innerHTML = confirmHtml;
        document.body.appendChild(confirmDialog);
        
        // Handle confirmation response
        const handleConfirmation = (confirmed) => {
            confirmDialog.remove();
            
            if (!confirmed) {
                console.log('User cancelled uninstall');
                confirmBtn.disabled = false;
                confirmBtn.textContent = window.getText ? window.getText('confirm-uninstall-btn') : 'Uninstall Application';
                return;
            }
            
            console.log('User confirmed uninstall, proceeding...');
            proceedWithUninstall();
        };
        
        // Add event listeners
        document.getElementById('confirm-yes').onclick = () => handleConfirmation(true);
        document.getElementById('confirm-no').onclick = () => handleConfirmation(false);
        
        // Function to proceed with uninstall
        const proceedWithUninstall = async () => {
            try {
                // Disable buttons
                confirmBtn.disabled = true;
                confirmBtn.textContent = window.getText ? window.getText('processing-text') : 'Processing...';
            
            console.log('Checking backend availability...');
            console.log('window.go:', !!window.go);
            console.log('window.go.main:', !!(window.go && window.go.main));
            console.log('window.go.main.App:', !!(window.go && window.go.main && window.go.main.App));
            console.log('UninstallApp function:', !!(window.go && window.go.main && window.go.main.App && window.go.main.App.UninstallApp));
            
            // Call UninstallApp
            if (window.go && window.go.main && window.go.main.App && window.go.main.App.UninstallApp) {
                console.log('>>> CALLING UninstallApp with:', exportFirst, exportPath || '(empty)');
                
                const result = await window.go.main.App.UninstallApp(exportFirst, exportPath || '');
                
                console.log('>>> UninstallApp RESULT:', result);
                
                // Close modal
                modal.remove();
                
                // Show results
                showUninstallResults(result);
                
                if (result.success) {
                    showNotification(
                        window.getText ? window.getText('notif-uninstall-complete') : 'Uninstall completed. The application will close in 5 seconds.',
                        'success'
                    );
                    
                    // If not simulation, app will close
                    if (!result.simulationMode) {
                        console.log('Application will close in 10 seconds...');
                    }
                } else {
                    showNotification('Uninstall completed with errors', 'warning');
                }
            } else {
                console.error('Backend UninstallApp function not available!');
                alert('Backend connection not available!');
                confirmBtn.disabled = false;
                confirmBtn.textContent = window.getText ? window.getText('confirm-uninstall-btn') : 'Uninstall Application';
            }
            } catch (error) {
                console.error('Uninstall error:', error);
                alert('Error: ' + error);
                confirmBtn.disabled = false;
                confirmBtn.textContent = window.getText ? window.getText('confirm-uninstall-btn') : 'Uninstall Application';
            }
        }; // End of proceedWithUninstall
    };
    
    // Cancel button handler
    cancelBtn.onclick = () => {
        modal.remove();
    };
}
// Keep global for existing inline handlers
window.showUninstallDialog = showUninstallDialog;

// Select export path for uninstall
window.selectExportPath = async function() {
    try {
        if (!(window.go && window.go.main && window.go.main.App && typeof window.go.main.App.SelectDirectory === 'function')) {
            showNotification('❌ No backend connection', 'warning');
            return;
        }
        const result = await window.go.main.App.SelectDirectory('Select Export Directory');
        
        if (result && result !== 'Klasör seçimi iptal edildi') {
            document.getElementById('export-path').value = result;
        }
    } catch (error) {
        console.error('Failed to select export path:', error);
    }
};

// Confirm uninstall
window.confirmUninstall = async function() {
    console.log('confirmUninstall called!');

    // Check if backend is available
    const hasUninstallApp = window.go && window.go.main && window.go.main.App && typeof window.go.main.App.UninstallApp === 'function';
    
    if (!hasUninstallApp) {
        console.error('Backend not available:', {
            'window.go': !!window.go,
            'window.go.main': !!(window.go && window.go.main),
            'window.go.main.App': !!(window.go && window.go.main && window.go.main.App),
            'UninstallApp': hasUninstallApp
        });
        alert('Backend connection not available. Please restart the application.');
        return;
    }

    const exportFirst = !!document.querySelector('#export-before-uninstall:checked');
    const exportPathEl = document.getElementById('export-path');
    const exportPath = exportPathEl ? exportPathEl.value : '';

    console.log('Export settings:', { exportFirst, exportPath });

    if (exportFirst && !exportPath) {
        try {
            // Try to prompt for a directory immediately so user flow continues
            if (window.go && window.go.main && window.go.main.App && typeof window.go.main.App.SelectDirectory === 'function') {
                const picked = await window.go.main.App.SelectDirectory('Select Export Directory');
                if (picked && picked !== 'Klasör seçimi iptal edildi') {
                    const exportPathInput = document.getElementById('export-path');
                    if (exportPathInput) exportPathInput.value = picked;
                } else {
                    alert('Please select an export directory or uncheck the export option.');
                    return;
                }
            } else {
                alert('Please select an export directory or uncheck the export option.');
                return;
            }
        } catch (_) {
            alert('Please select an export directory or uncheck the export option.');
            return;
        }
    }

    // i18n-aware confirmation message
    const confirmMsg = window.getText ? (window.getText('confirmation-title') + '\n' + (window.getText('uninstall-warning') || 'This will permanently remove all application data.')) : 'This will permanently remove all application data. Are you sure you want to continue?';
    if (!confirm(confirmMsg)) {
        return;
    }

    try {
        console.log('==========================================');
        console.log('Starting uninstall process...');
        console.log('Export First:', exportFirst);
        console.log('Export Path:', exportPath || '(empty)');
        console.log('Simulate checkbox checked:', !!document.querySelector('#simulate-uninstall:checked'));
        
        // Detailed backend check
        console.log('Backend availability check:');
        console.log('- window.go exists:', !!window.go);
        console.log('- window.go.main exists:', !!(window.go && window.go.main));
        console.log('- window.go.main.App exists:', !!(window.go && window.go.main && window.go.main.App));
        
        if (window.go && window.go.main && window.go.main.App) {
            console.log('Available App methods:', Object.keys(window.go.main.App));
            console.log('UninstallApp type:', typeof window.go.main.App.UninstallApp);
        }
        
        console.log('Calling backend uninstall function...');

        // Disable the uninstall button to prevent multiple clicks
        const uninstallBtn = document.getElementById('confirm-uninstall-btn');
        if (uninstallBtn) {
            uninstallBtn.disabled = true;
            uninstallBtn.textContent = (window.getText && window.getText('processing-text')) || 'Processing...';
        }

        // Call UninstallApp
        let result;
        
        try {
            console.log('>>> Calling UninstallApp with params:', exportFirst, exportPath);
            result = await window.go.main.App.UninstallApp(exportFirst, exportPath);
            console.log('>>> UninstallApp returned:', result);
        } catch (error) {
            console.error('UninstallApp error:', error);
            throw error;
        }

        console.log('Uninstall result received:', result);

        // Close the uninstall modal (V2)
        const uninstallModalV2 = document.getElementById('uninstall-modal-v2');
        if (uninstallModalV2) {
            uninstallModalV2.classList.add('hidden');
            uninstallModalV2.remove();
        }

        // Show results modal and start countdown
        showUninstallResults(result);
        const m = window.getText ? window.getText('notif-uninstall-complete') : 'Uninstall completed. The application will close in 10 seconds.';
        showNotification(m, result.success ? 'success' : 'warning');

    } catch (error) {
        console.error('Uninstall failed:', error);

        // Re-enable the button if there's an error
        const uninstallBtn = document.getElementById('confirm-uninstall-btn');
        if (uninstallBtn) {
            uninstallBtn.disabled = false;
            uninstallBtn.textContent = window.getText ? (window.getText('confirm-uninstall-btn') || 'Uninstall Application') : 'Uninstall Application';
        }

        // Close the modal if still open (V2)
        const uninstallModalV2 = document.getElementById('uninstall-modal-v2');
        if (uninstallModalV2) {
            uninstallModalV2.classList.add('hidden');
            uninstallModalV2.remove();
        }

        const msg = window.getText ? window.getText('notif-uninstall-failed').replace('{error}', String(error)) : ('Uninstall failed: ' + error);
        showNotification(msg, 'error');
    }
};

// Close uninstall modal (Cancel button)
window.closeUninstallModal = function() {
    const modal = document.getElementById('uninstall-modal');
    if (modal) modal.classList.add('hidden');
};

// Close uninstall results modal (Close button)
window.closeUninstallResultsModal = function() {
    const modal = document.getElementById('uninstall-results-modal');
    if (modal) modal.classList.add('hidden');
};

// Show uninstall results
function showUninstallResults(result) {
    const modal = document.getElementById('uninstall-results-modal');
    const content = document.getElementById('uninstall-results-content');
    
    let html = '<div class="uninstall-results">';
    
    // Add countdown timer display at the top if not in simulation mode
    if (!result.simulationMode) {
        html += `<div id="countdown-display" style="background: linear-gradient(45deg, #e74c3c, #c0392b); color: white; padding: 15px; border-radius: 8px; margin-bottom: 15px; text-align: center; font-size: 18px; font-weight: bold;">
            ${window.getText ? window.getText('app-closing-in') || 'Application will close in' : 'Application will close in'} <span id="countdown-number" style="font-size: 24px;">10</span> ${window.getText ? window.getText('seconds') || 'seconds' : 'seconds'}
        </div>`;
    }
    
    // Success/failure status
    if (result.success) {
        const successText = window.getText ? window.getText('uninstall-success') : '✅ Uninstall completed successfully!';
        html += `<div class="alert alert-success">${successText}</div>`;
    } else {
        const errorText = window.getText ? window.getText('uninstall-error') : '❌ Uninstall completed with errors.';
        html += `<div class="alert alert-error">${errorText}</div>`;
    }
    
    // Export status
    if (result.exported) {
        const exportText = window.getText ? window.getText('data-exported-to') : '📦 Data exported to:';
        html += `<div class="alert alert-info">${exportText} ${result.exportPath}</div>`;
    }
    
// Removed files
    if (result.removedFiles && result.removedFiles.length > 0) {
        const removedFilesTitle = (window.getText ? window.getText('removed-files-heading') : 'Removed Files');
        const fileCount = result.removedFiles.length;
        
        html += '<div style="background: #34495e; border-radius: 8px; padding: 15px; margin: 15px 0;">';
        html += `<h4 style="color: #3498db; margin: 0 0 10px 0; font-size: 16px;">${removedFilesTitle} (${fileCount})</h4>`;
        html += '<div style="max-height: 200px; overflow-y: auto; background: #2c3e50; border-radius: 6px; padding: 10px;">';
        html += '<ul style="list-style: none; margin: 0; padding: 0;">';
        result.removedFiles.forEach(file => {
            html += `<li style="color: #ecf0f1; font-family: monospace; font-size: 13px; padding: 3px 0; border-bottom: 1px solid #34495e; word-break: break-all;">📄 ${file}</li>`;
        });
        html += '</ul>';
        html += '</div>';
        html += '</div>';
    }
    
    // Errors
    if (result.errors && result.errors.length > 0) {
        html += '<div style="background: #e74c3c; border-radius: 8px; padding: 15px; margin: 15px 0;">';
        const errorsText = window.getText ? window.getText('errors-encountered') : '⚠️ Errors encountered:';
        html += `<h4 style="color: white; margin: 0 0 10px 0;">${errorsText}</h4>`;
        html += '<ul style="margin: 0; padding: 0 0 0 20px;">';
        result.errors.forEach(error => {
            html += `<li style="color: white; margin: 5px 0;">${error}</li>`;
        });
        html += '</ul></div>';
    }
    
    // Platform-specific instructions
    if (result.instructions) {
        const instructionsTitle = window.getText ? window.getText('complete-uninstall-title') || 'Complete Uninstall Instructions' : 'Complete Uninstall Instructions';
        html += '<div style="background: #34495e; border-radius: 8px; padding: 15px; margin: 15px 0;">';
        html += `<h4 style="color: #3498db; margin: 0 0 10px 0; font-size: 16px;">📋 ${instructionsTitle}:</h4>`;
        html += `<pre style="background: #2c3e50; color: #ecf0f1; border-radius: 6px; padding: 15px; margin: 0; font-family: monospace; font-size: 13px; line-height: 1.4; overflow-x: auto; white-space: pre-wrap; word-wrap: break-word;">${result.instructions}</pre>`;
        html += '</div>';
    }
    
    html += '</div>';
    
    content.innerHTML = html;
    modal.classList.remove('hidden');
    
    // Start countdown timer if not in simulation mode
    if (!result.simulationMode) {
        let countdown = 10;
        const countdownInterval = setInterval(() => {
            countdown--;
            
            // Update the countdown number display
            const countdownNumber = document.getElementById('countdown-number');
            if (countdownNumber) {
                countdownNumber.textContent = countdown;
                
                // Add animation effect
                countdownNumber.style.animation = 'none';
                setTimeout(() => {
                    countdownNumber.style.animation = 'pulse 0.5s';
                }, 10);
            }
            
            // Update close button text
            const closeBtn = document.getElementById('close-results-btn');
            if (closeBtn) {
                closeBtn.textContent = window.getText ? `${window.getText('close-results-btn') || 'Close'} (${countdown})` : `Close (${countdown})`;
            }
            
            if (countdown <= 0) {
                clearInterval(countdownInterval);
                // App will close automatically
            }
        }, 1000);
    }
}

// Close uninstall modal
window.closeUninstallModal = function() {
    document.getElementById('uninstall-modal').classList.add('hidden');
};

// Close uninstall results modal
window.closeUninstallResultsModal = function() {
    document.getElementById('uninstall-results-modal').classList.add('hidden');
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeDataInfo);
} else {
    initializeDataInfo();
}

