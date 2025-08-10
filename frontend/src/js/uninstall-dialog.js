// Uninstall Dialog Module

import { showNotification } from './notification.js';

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
                
                <div class="form-group" style="margin-top: 20px;">
                    <label>
                        <input type="checkbox" id="simulate-mode">
                        <span style="color: #3498db;">${window.getText ? window.getText('simulate-uninstall-label') : 'SIMULATION: Try without deleting (no files will be deleted, app will not close)'}</span>
                    </label>
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
    const simulateCheckbox = document.getElementById('simulate-mode');
    
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
    
    // Set default export path
    (async () => {
        try {
            if (window.go && window.go.main && window.go.main.App && window.go.main.App.GetDefaultExportPath) {
                const defaultPath = await window.go.main.App.GetDefaultExportPath();
                if (defaultPath) {
                    exportPathInput.value = defaultPath;
                }
            }
        } catch (error) {
            console.error('Failed to get default export path:', error);
        }
        updateConfirmButton();
    })();
    
    // Confirm button handler
    confirmBtn.onclick = async () => {
        const exportPath = exportCheckbox.checked ? exportPathInput.value : '';
        const simulate = simulateCheckbox.checked;
        
        // Show confirmation dialog
        const confirmMsg = simulate ? 
            'This is a SIMULATION. No files will be deleted. Continue?' :
            window.getText ? window.getText('uninstall-confirm-question') : 'Are you absolutely sure you want to uninstall?';
        
        if (!confirm(confirmMsg)) {
            return;
        }
        
        // Show processing state
        confirmBtn.disabled = true;
        confirmBtn.textContent = window.getText ? window.getText('processing-text') : 'Processing...';
        
        try {
            // Call backend uninstall
            const result = await window.go.main.App.UninstallApp(exportPath, simulate);
            
            // Show results
            showUninstallResults(result, simulate);
            
            // Remove the modal
            modal.remove();
            
        } catch (error) {
            console.error('Uninstall failed:', error);
            showNotification('Uninstall failed: ' + error, 'error');
            confirmBtn.disabled = false;
            confirmBtn.textContent = window.getText ? window.getText('confirm-uninstall-btn') : 'Uninstall Application';
        }
    };
    
    // Cancel button handler
    cancelBtn.onclick = () => {
        modal.remove();
    };
}

// Show uninstall results
function showUninstallResults(result, simulate) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'uninstall-results-modal';
    modal.style.display = 'flex';
    
    let content = '';
    let statusColor = '#27ae60';
    
    if (result.success) {
        if (simulate) {
            content = `
                <h4 style="color: #3498db;">Simulation Complete</h4>
                <p>The following would be removed in a real uninstall:</p>
                <div style="max-height: 300px; overflow-y: auto; background: #f8f9fa; padding: 10px; border-radius: 4px;">
                    <strong>Files to be removed:</strong><br>
                    ${result.removedFiles ? result.removedFiles.map(f => `• ${f}`).join('<br>') : 'No files'}
                </div>
            `;
        } else {
            content = `
                <h4 style="color: ${statusColor};">${window.getText ? window.getText('uninstall-success') : 'Uninstall completed successfully!'}</h4>
                ${result.exportedPath ? `<p>${window.getText ? window.getText('data-exported-to') : 'Data exported to:'} ${result.exportedPath}</p>` : ''}
                <p style="margin-top: 20px;">Application will close in <span id="countdown">5</span> seconds...</p>
            `;
        }
    } else {
        statusColor = '#e74c3c';
        content = `
            <h4 style="color: ${statusColor};">${window.getText ? window.getText('uninstall-error') : 'Uninstall completed with errors.'}</h4>
            <p>${window.getText ? window.getText('errors-encountered') : 'Errors encountered:'}</p>
            <div style="max-height: 200px; overflow-y: auto; background: #ffe6e6; padding: 10px; border-radius: 4px;">
                ${result.errors ? result.errors.map(e => `• ${e}`).join('<br>') : 'Unknown error'}
            </div>
        `;
    }
    
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <div class="modal-header">
                <h3>${window.getText ? window.getText('uninstall-results-title') : 'Uninstall Complete'}</h3>
            </div>
            <div class="modal-body">
                ${content}
            </div>
            <div class="modal-footer">
                <button class="btn-primary" id="close-results">
                    ${window.getText ? window.getText('close-results-btn') : 'Close'}
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close button handler
    document.getElementById('close-results').onclick = () => {
        modal.remove();
    };
    
    // Countdown for auto-close (non-simulation only)
    if (result.success && !simulate) {
        let countdown = 5;
        const countdownEl = document.getElementById('countdown');
        const interval = setInterval(() => {
            countdown--;
            if (countdownEl) countdownEl.textContent = countdown;
            if (countdown <= 0) {
                clearInterval(interval);
                // App should close automatically from backend
            }
        }, 1000);
    }
}

// Export for global access
window.showUninstallDialog = showUninstallDialog;
