import { initSendEditor, getEditorHtml, getEditorText, setEditorHtml } from './tinymceSetup.js';
import {
    logToSystem,
    showNotification,
    escapeHtml,
    showConfirmation,
    applyThemeToHTMLPreview
} from './utils.js';
import { state } from './state.js';
import { 
    openSendingModal, 
    updateSendingProgress, 
    completeSending,
    sendingState
} from './progress-modal.js';

export function updateSendAccountCombo() {
    const select = document.getElementById('send-account');
    const placeholderText = window.getText ? window.getText('select-account-option') : 'Hesap Seç';
    select.innerHTML = `<option value="">${placeholderText}</option>`;
    state.accounts.forEach(acc => {
        const option = document.createElement('option');
        option.value = acc.email;
        option.text = `${acc.name} (${acc.email})`;
        select.appendChild(option);
    });
    
    // Event listener'ı bir kez ekle
    if (!select.hasAttribute('data-listener-added')) {
        select.setAttribute('data-listener-added', 'true');
        select.addEventListener('change', function() {
            if (this.value) {
                const selectedAccount = state.accounts.find(acc => acc.email === this.value);
                if (selectedAccount) {
                    logToSystem(`Sender account selected: ${selectedAccount.name} (${selectedAccount.email})`, 'info', {
                        accountName: selectedAccount.name,
                        accountEmail: selectedAccount.email,
                        smtpServer: selectedAccount.smtp_server
                    });
                }
            }
        });
    }
}

export async function loadTemplate() {
    const templateName = document.getElementById('template-select').value;
    if (!templateName) {
        logToSystem('Template selection cleared', 'info');
        // Ensure editor exists even without a template
        if (!window.sendEditor) { await initSendEditor({ html: '' }); }
        updateSendPreview();
        return;
    }
    
    const template = state.templates.find(t => t.name === templateName);
    if (template) {
        document.getElementById('send-subject').value = template.subject || '';
        
        // Set HTML content into editor
        const htmlContent = (typeof template.content === 'string') ? template.content : '';
        if (window.sendEditor) {
            setEditorHtml('send', htmlContent);
        } else {
            await initSendEditor({ html: htmlContent });
        }
        
        // Update content format radios if present
        const formatRadio = document.querySelector(`input[name="content-format"][value="${template.is_html ? 'html' : 'text'}"]`);
        if (formatRadio) {
            formatRadio.checked = true;
        }
        
        updateSendPreview();
        logToSystem(`Template loaded: ${templateName}`, 'success', {
            templateName: template.name,
            templateSubject: template.subject,
            isHTML: template.is_html,
            contentLength: typeof template.content === 'string' ? template.content.length : JSON.stringify(template.content).length
        });
    } else {
        logToSystem(`Template not found: ${templateName}`, 'warning');
        showNotification(`Template not found: ${templateName}`, 'warning');
    }
}



export async function mapPlaceholders() {
    if (!state.currentData || !state.currentData.fields) {
        logToSystem('Placeholder mapping cancelled - no contact data', 'warning');
        const message = window.getText ? 'Önce kişi verilerini yükleyin' : 'Önce kişi verilerini yükleyin';
        showNotification(message, 'warning');
        return;
    }
    
    // Collect content from editor (HTML + plain text) and subject
    let html = '';
    let text = '';
    try { html = getEditorHtml('send') || ''; } catch { html = ''; }
    try { text = getEditorText('send') || ''; } catch { text = ''; }
    const subject = document.getElementById('send-subject').value || '';
    const combined = `${subject} ${html} ${text}`;

    // Extract unique placeholders of form {name}
    const placeholders = Array.from(new Set((combined.match(/\{[^{}]+\}/g) || []).map(p => p.slice(1, -1))));
    
    logToSystem('Placeholder analysis completed', 'info', {
        contentLength: combined.length,
        placeholderCount: placeholders.length,
        placeholders: placeholders
    });
    
    if (placeholders.length === 0) {
        logToSystem('Placeholder mapping cancelled - no placeholders found', 'warning');
        const noPlaceholdersMsg = window.getText ? window.getText('no-placeholders-found') : 'İçerikte yer tutucu bulunamadı';
        const placeholderInfo = window.getText ? window.getText('placeholder-info') : 'Yer tutucular {alan_adı} formatında olmalıdır';
        showNotification(`${noPlaceholdersMsg}. ${placeholderInfo}`, 'warning');
        return;
    }
    
    showMappingModal(placeholders, state.currentData.fields);
}

export async function updateSendPreview() {
    let subject = document.getElementById('send-subject').value || '';
    
    // Get theme from editor wrapper instead of radio buttons
    const editorWrapper = document.getElementById('send-editor-wrapper');
    const isDarkTheme = editorWrapper && editorWrapper.classList.contains('dark-theme');
    
    // Preview container theme class
    const previewContainer = document.getElementById('send-preview');
    if (previewContainer) {
        const isFullscreen = previewContainer.classList.contains('fullscreen');
        previewContainer.className = `preview-container fullscreen-preview ${isDarkTheme ? 'dark-theme' : 'light-theme'}`;
        if (isFullscreen) {
            previewContainer.classList.add('fullscreen');
        }
    }
    
    // Fetch content from editor (HTML only)
    let htmlContent = getEditorHtml('send') || '';
    let previewContent = htmlContent;

    // Apply sample mapping for the first selected contact to both subject and content
    if (state.currentData && state.currentData.valid && state.currentData.valid.length > 0 && state.selectedRows.length > 0) {
        const sampleIndex = state.selectedRows[0];
        if (sampleIndex < state.currentData.valid.length) {
            const sampleContact = state.currentData.valid[sampleIndex];
            for (const [placeholder, fieldName] of Object.entries(state.mapping || {})) {
                const value = (sampleContact.data && (sampleContact.data[fieldName] != null)) ? String(sampleContact.data[fieldName]) : `{${placeholder}}`;
                const safe = placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const re = new RegExp(`\\{${safe}\\}`, 'g');
                previewContent = previewContent.replace(re, value);
                subject = subject.replace(re, value);
            }
        }
    }

    const subjectLabel = window.getText ? window.getText('preview-subject') : 'Konu:';
    
    // Apply theme to HTML content exactly like backend does
    const themedContent = applyThemeToHTMLPreview(previewContent, isDarkTheme);
    
    // Create email preview container
    const bgColor = isDarkTheme ? '#2c3e50' : '#f5f5f5';
    const containerBg = isDarkTheme ? '#2c3e50' : '#ffffff';
    const textColor = isDarkTheme ? '#ecf0f1' : '#2c3e50';
    const borderColor = isDarkTheme ? '#34495e' : '#e0e0e0';

    document.getElementById('send-preview').innerHTML = `
        <div style="border-bottom:2px solid #ddd; padding-bottom:10px; margin-bottom:15px;">
            <strong>${subjectLabel}</strong> ${subject}
        </div>
        <div style="background-color: ${bgColor}; padding: 20px; border-radius: 8px;">
            ${themedContent}
        </div>
    `;

    logToSystem('Send preview updated', 'info');
}

// Expose for global access
if (typeof window !== 'undefined') {
    window.updateSendPreview = updateSendPreview;
    window.setupSendPreviewAutoUpdate = setupSendPreviewAutoUpdate;
}

export async function validateSendForm() {
    logToSystem('Email send form validation started', 'info');
    
    const account = document.getElementById('send-account').value;
    const subject = document.getElementById('send-subject').value.trim();
    
    let content = '';
    if (window.sendEditor) {
        try {
            content = getEditorHtml('send').trim();
        } catch (error) {
            console.error('Editor content fetch error:', error);
            content = '';
        }
    }
    
    logToSystem('Form validation details', 'info', {
        hasAccount: !!account,
        hasSubject: !!subject,
        contentLength: content.length,
        selectedRowsCount: state.selectedRows ? state.selectedRows.length : 0,
        hasEditor: !!window.sendEditor
    });
    
    if (!account) {
        logToSystem('Email account not selected - validation failed', 'warning');
        showNotification('Please select an email account', 'error');
        return false;
    }
    if (!subject) {
        logToSystem('Email subject empty - validation failed', 'warning');
        showNotification('Please enter email subject', 'error');
        return false;
    }
    if (!content || content.replace(/<[^>]*>/g,'').trim().length < 3) {
        logToSystem('Email content empty or too short - validation failed', 'warning', {
            contentLength: content.length
        });
        showNotification('Please enter email content (at least 3 characters)', 'error');
        return false;
    }
    if (!state.selectedRows || state.selectedRows.length === 0) {
        logToSystem('No contacts selected - validation failed', 'warning', {
            selectedRows: state.selectedRows
        });
        showNotification('Please select contacts to send emails', 'error');
        return false;
    }
    
    logToSystem('Email send form validation successful', 'success', {
        account: account,
        subject: subject,
        contentLength: content.length,
        selectedRowsCount: state.selectedRows.length
    });
    return true;
}

export async function sendEmails() {
    logToSystem('Email sending process initiated', 'info');
    if (!(await validateSendForm())) {
        logToSystem('Form validation failed - sending cancelled', 'warning');
        return;
    }
    
    const account = document.getElementById('send-account').value;
    const subject = document.getElementById('send-subject').value.trim();
    const isHTML = true; // always HTML
    const editorWrapper = document.getElementById('send-editor-wrapper');
    const isDarkTheme = editorWrapper && editorWrapper.classList.contains('dark-theme');
    const cc = document.getElementById('cc-input').value.trim();
    const accountName = state.accounts.find(acc => acc.email === account)?.name || 'Unknown';
    
    logToSystem(`Send details - Account: ${accountName}, Recipients: ${state.selectedRows.length}, Subject: ${subject}`, 'info', {
        senderAccount: accountName,
        senderEmail: account,
        recipientCount: state.selectedRows.length,
        subject: subject,
        isHTML: isHTML,
        isDarkTheme: isDarkTheme,
        attachmentCount: state.attachments.length,
        ccRecipients: cc || 'None'
    });
    
    // Create a better formatted confirmation message
    const formatText = window.getText ? window.getText('send-format') : 'Format';
    const themeText = window.getText ? window.getText('send-theme') : 'Theme';
    const attachmentsText = window.getText ? window.getText('send-attachments') : 'Attachments';
    const fromText = window.getText ? window.getText('send-from') : 'From';
    const toText = window.getText ? window.getText('send-to-count') : 'Recipients';
    const subjectText = window.getText ? window.getText('send-subject') : 'Subject';
    const ccText = window.getText ? window.getText('send-cc') : 'CC';
    const peopleText = window.getText ? window.getText('send-people') : 'people';
    const filesText = window.getText ? window.getText('send-files') : 'files';
    const noneText = window.getText ? window.getText('send-none') : 'None';
    const htmlText = window.getText ? window.getText('send-html') : 'HTML';
    const plainText = window.getText ? window.getText('send-plain') : 'Plain Text';
    const darkText = window.getText ? window.getText('send-dark') : 'Dark';
    const lightText = window.getText ? window.getText('send-light') : 'Light';
    
    const detailedMessage = `
📧 ${fromText}: ${accountName} (${account})
👥 ${toText}: ${state.selectedRows.length} ${peopleText}
📝 ${subjectText}: ${subject}
🔧 ${formatText}: ${isHTML ? htmlText : plainText}
🎨 ${themeText}: ${isDarkTheme ? darkText : lightText}
📎 ${attachmentsText}: ${state.attachments.length > 0 ? state.attachments.length + ' ' + filesText : noneText}
📋 ${ccText}: ${cc || noneText}
`;
    
    showConfirmation(detailedMessage, (confirmed) => {
        if (!confirmed) {
            logToSystem('User cancelled send confirmation', 'warning');
            return;
        }
        logToSystem('User confirmed sending - process starting', 'success');
        executeSendEmails();
    });
}

export async function executeSendEmails() {
    const email = document.getElementById('send-account').value;
    const subject = document.getElementById('send-subject').value.trim();
    
    let content = '';
    if (window.sendEditor) {
        try {
            content = getEditorHtml('send');
        } catch (error) {
            console.error('Editor content fetch error:', error);
            content = '';
        }
    }
    
    const isHTML = true;
    const editorWrapper = document.getElementById('send-editor-wrapper');
    const isDarkTheme = editorWrapper && editorWrapper.classList.contains('dark-theme');
    const cc = document.getElementById('cc-input').value.trim();
    let attachmentPaths = [];
    
    try {
        if (window.go && window.go.main && window.go.main.App && window.go.main.App.GetAttachments) {
            const attachmentInfos = await window.go.main.App.GetAttachments();
            // Extract just the paths from the attachment objects
            if (Array.isArray(attachmentInfos)) {
                attachmentPaths = attachmentInfos.map(info => {
                    // Handle both object format and string format for backwards compatibility
                    if (typeof info === 'object' && info.path) {
                        return info.path;
                    } else if (typeof info === 'string') {
                        return info;
                    }
                    return null;
                }).filter(path => path !== null);
            }
        }
    } catch (error) {
        console.error('Failed to get backend attachments:', error);
        showNotification('Could not retrieve attachment information', 'warning');
    }
    
    if (!Array.isArray(attachmentPaths)) {
        attachmentPaths = [];
    }
    
    // Mapping bilgisini log'la
    if (state.mapping && Object.keys(state.mapping).length > 0) {
        logToSystem('Email sending starting - mapping active', 'info', {
            mappingCount: Object.keys(state.mapping).length,
            mapping: state.mapping,
            recipientCount: state.selectedRows.length,
            isHTML: isHTML,
            isDarkTheme: isDarkTheme
        });
    } else {
        logToSystem('Email sending starting - no mapping', 'warning', {
            recipientCount: state.selectedRows.length,
            isHTML: isHTML,
            isDarkTheme: isDarkTheme
        });
    }
    
    // Open progress modal
    openSendingModal(state.selectedRows.length);
    
    // Backend'e gönder - backend zaten mapping'i yapacak
    proceedWithSending(email, subject, content, isHTML, cc, attachmentPaths, isDarkTheme);
}

// Auto-update bindings for send preview
export function setupSendPreviewAutoUpdate() {
    const subjectEl = document.getElementById('send-subject');
    const handler = () => updateSendPreview();
    if (subjectEl) subjectEl.addEventListener('input', handler);
    // Theme changes are now handled through editor wrapper class changes
}

export function showMappingModal(placeholders, fields) {
    const modal = document.getElementById('mapping-modal');
    const fieldsContainer = document.getElementById('mapping-fields');
    
    if (!modal || !fieldsContainer) {
        showNotification('Mapping modal not found', 'error');
        return;
    }
    
    fieldsContainer.innerHTML = '';
    
    placeholders.forEach(placeholder => {
        const fieldGroup = document.createElement('div');
        fieldGroup.className = 'form-group';
        fieldGroup.innerHTML = `
            <label>${placeholder}:</label>
            <select data-placeholder="${placeholder}">
                <option value="">Alan Seç</option>
                ${fields.map(field => `<option value="${field}">${field}</option>`).join('')}
            </select>
        `;
        fieldsContainer.appendChild(fieldGroup);
        
        const select = fieldGroup.querySelector('select');
        if (state.mapping && state.mapping[placeholder]) {
            select.value = state.mapping[placeholder];
        }
    });
    
    modal.classList.remove('hidden');
    logToSystem(`Mapping modal opened - ${placeholders.length} fields to be mapped`, 'info');
}

export function closeMappingModal() {
    const modal = document.getElementById('mapping-modal');
    if (modal) {
        modal.classList.add('hidden');
        logToSystem('Mapping modal closed', 'info');
    }
}

export function saveMapping() {
    const fieldsContainer = document.getElementById('mapping-fields');
    if (!fieldsContainer) return;
    
    const selects = fieldsContainer.querySelectorAll('select');
    const newMapping = {};
    
    selects.forEach(select => {
        const placeholder = select.dataset.placeholder;
        const fieldName = select.value;
        if (placeholder && fieldName) {
            newMapping[placeholder] = fieldName;
        }
    });
    
    state.mapping = newMapping;
    
    // Mapping'i backend'e gönder
    if (window.go && window.go.main && window.go.main.App && window.go.main.App.SetMapping) {
        window.go.main.App.SetMapping(newMapping)
            .then(() => {
                logToSystem(`Mapping sent to backend: ${Object.keys(newMapping).length} fields mapped`, 'success', { mapping: newMapping });
            })
            .catch(error => {
                logToSystem(`Error sending mapping to backend: ${error}`, 'error');
            });
    }
    
    logToSystem(`Mapping saved: ${Object.keys(newMapping).length} fields mapped`, 'success', { mapping: newMapping });
    showNotification(`${Object.keys(newMapping).length} fields successfully mapped`, 'success');
    
    closeMappingModal();
    updateSendPreview();
}

export function confirmAction(confirmed) {
    const modal = document.getElementById('confirmation-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
    
    if (window.pendingConfirmationCallback) {
        window.pendingConfirmationCallback(confirmed);
        window.pendingConfirmationCallback = null;
    }
}

// All progress modal functions are now imported from progress-modal.js module

export function proceedWithSending(email, subject, content, isHTML, cc, attachmentPaths, isDarkTheme = false) {
    logToSystem(`Email sending starting - will send to ${state.selectedRows.length} recipients`, 'info', {
        recipientCount: state.selectedRows.length,
        attachmentCount: attachmentPaths.length,
        subject: subject.substring(0, 50) + (subject.length > 50 ? '...' : ''),
        format: isHTML ? 'HTML' : 'Text',
        mappingActive: state.mapping && Object.keys(state.mapping).length > 0,
        mappingCount: state.mapping ? Object.keys(state.mapping).length : 0
    });
    
    const sendBtn = document.getElementById('send-btn');
    sendBtn.disabled = true;
    sendBtn.classList.add('loading');
    
    if (!window.go || !window.go.main || !window.go.main.App) {
        console.error('Backend not available');
        logToSystem('Backend connection not available - sending cancelled', 'error');
        showNotification('No backend connection!', 'error');
        sendBtn.disabled = false;
        sendBtn.classList.remove('loading');
        return;
    }
    
    // Set up event listeners for progress updates - using backend's actual event names
    // First remove any existing listeners to avoid duplicates
    window.runtime.EventsOff('sendProgress');
    window.runtime.EventsOff('sendDone');
    window.runtime.EventsOff('notification');
    
    // Track which emails succeeded/failed via notification events
    window.runtime.EventsOn('notification', (data) => {
        if (data.message && sendingState.isActive) {
            const message = data.message;
            // Check if this is a success or failure notification for an email
            if (message.includes('✓') && message.includes('sent successfully')) {
                // Extract email from success message
                const emailMatch = message.match(/✓\s+([^\s]+)\s+sent successfully/);
                if (emailMatch && emailMatch[1]) {
                    const email = emailMatch[1];
                    const index = sendingState.current;
                    updateSendingProgress(index, email, 'success', message);
                }
            } else if (message.includes('✗') && message.includes('failed:')) {
                // Extract email from failure message  
                const emailMatch = message.match(/✗\s+([^\s]+)\s+failed:/);
                if (emailMatch && emailMatch[1]) {
                    const email = emailMatch[1];
                    const index = sendingState.current;
                    updateSendingProgress(index, email, 'failed', message);
                }
            }
        }
    });
    
    window.runtime.EventsOn('sendProgress', (data) => {
        // Backend sends: {progress: number, status: string}
        // This is just for tracking overall progress now
        const statusParts = data.status ? data.status.split(' - ') : [];
        const email = statusParts.length > 1 ? statusParts[1] : '';
        const indexMatch = statusParts[0] ? statusParts[0].match(/(\d+)\/(\d+)/) : null;
        const index = indexMatch ? parseInt(indexMatch[1]) - 1 : 0;
        
        // Update the current index in state
        sendingState.current = index + 1;
        
        // Update current email being processed
        if (email) {
            document.getElementById('sending-current-email').textContent = email;
        }
    });
    
    window.runtime.EventsOn('sendDone', () => {
        // Backend just sends a signal that sending is done
        completeSending();
        
        // Re-enable send button
        sendBtn.disabled = false;
        sendBtn.classList.remove('loading');
        
        logToSystem(`Email sending completed`, 'info');
    });
    
    window.go.main.App.SendEmailsWithTheme(email, subject, content, cc, attachmentPaths, isDarkTheme)
        .then(result => {
            logToSystem(`Email send command sent to backend: ${result}`, 'success', {
                mappingUsed: state.mapping && Object.keys(state.mapping).length > 0
            });
        })
        .catch(error => {
            console.error('Send emails error:', error);
            logToSystem(`Error in email sending: ${error}`, 'error');
            showNotification('An error occurred in email sending: ' + error, 'error');
            sendBtn.disabled = false;
            sendBtn.classList.remove('loading');
            completeSending();
        });
}