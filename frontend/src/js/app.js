import {
    logToSystem,
    scrollToBottom,
    toggleLogSidebar,
    toggleFullscreenPreview
} from './utils.js';

import { updateAccountsTable } from './accountManagement.js';
import { updateSendAccountCombo } from './sendManagement.js';
import { 
    updateTemplatesTable,
    updateTemplateSelect,
    setupTemplatePreviewAutoUpdate
} from './templateManagement.js';
import { updateAttachmentsList, initAttachmentSystem } from './attachmentManagement.js';
import { state } from './state.js';
import { initTemplateEditor, initSendEditor, reinitEditorsForLanguage } from './tinymceSetup.js';

// Global functions for HTML onclick handlers
import { switchTab, enableTab, clearLogs, switchSubTab, scrollLogToBottom, searchInLogs, clearLogContent, filterLogContent } from './utils.js';
import { showAccountForm, hideAccountForm, updateProvider, saveAccount, deleteAccount, editAccount, confirmAccountDelete } from './accountManagement.js';
import { showTemplateForm, hideTemplateForm, saveTemplate, deleteTemplate, editTemplate, updateTemplatePreview, confirmTemplateDelete } from './templateManagement.js';
import { onSourceTypeChange, selectSourceFile, onTableChange, onEmailColChange, resetSource, selectAll, filterContacts } from './contactManagement.js';
import { loadTemplate, mapPlaceholders, updateSendPreview, sendEmails, showMappingModal, closeMappingModal, saveMapping, confirmAction } from './sendManagement.js';
import { 
    refreshLogFiles, 
    goBackToLogsList, 
    loadLogFileContent, 
    clearAllLogs, 
    toggleLogSelection, 
    selectAllLogs, 
    deleteSingleLog, 
    deleteSelectedLogs, 
    deleteAllLogs,
    toggleSelectionMode,
    initializeLogsButtons
} from './logManagement.js';
import { triggerFileDialog, handleFileSelect, clearAllAttachments } from './attachmentManagement.js';
import { initLanguage, changeLanguageGlobal, getText, updateAllTexts, getCurrentLanguage } from './languageManager.js';
import { loadSettings, saveSettings, reloadSettings } from './settings.js';
import { openSendingModal, updateSendingProgress, completeSending, sendingState } from './progress-modal.js';

// Utils
window.switchTab = switchTab;
window.enableTab = enableTab;
window.clearLogs = clearLogs;
window.scrollToBottom = scrollToBottom;

// Account Management
window.showAccountForm = showAccountForm;
window.hideAccountForm = hideAccountForm;
window.updateProvider = updateProvider;
window.saveAccount = saveAccount;
window.deleteAccount = deleteAccount;
window.editAccount = editAccount;
window.confirmAccountDelete = confirmAccountDelete;

// Template Management
window.showTemplateForm = showTemplateForm;
window.hideTemplateForm = hideTemplateForm;
window.saveTemplate = saveTemplate;
window.deleteTemplate = deleteTemplate;
window.editTemplate = editTemplate;
window.updateTemplatePreview = updateTemplatePreview;
window.confirmTemplateDelete = confirmTemplateDelete;
window.updateTemplateSelect = updateTemplateSelect;

// Contact Management
window.onSourceTypeChange = onSourceTypeChange;
window.selectSourceFile = selectSourceFile;
window.onTableChange = onTableChange;
window.onEmailColChange = onEmailColChange;
window.resetSource = resetSource;
window.switchSubTab = switchSubTab;
window.selectAll = selectAll;
window.filterContacts = filterContacts;

// Send Management
window.loadTemplate = loadTemplate;
window.mapPlaceholders = mapPlaceholders;
window.updateSendPreview = updateSendPreview;
window.sendEmails = sendEmails;
window.showMappingModal = showMappingModal;
window.closeMappingModal = closeMappingModal;
window.saveMapping = saveMapping;
window.confirmAction = confirmAction;
window.filterTemplates = filterTemplates;
window.filterTemplatesUI = filterTemplatesUI;

// Log Management
window.refreshLogFiles = refreshLogFiles;
window.loadLogFileContent = loadLogFileContent;
window.toggleLogSelection = toggleLogSelection;
window.selectAllLogs = selectAllLogs;
window.deleteSingleLog = deleteSingleLog;
window.deleteSelectedLogs = deleteSelectedLogs;
window.deleteAllLogs = deleteAllLogs;
window.clearAllLogs = clearAllLogs;
window.toggleSelectionMode = toggleSelectionMode;
window.initializeLogsButtons = initializeLogsButtons;

// Reinit editors on language change
window.reinitEditorsForLanguage = reinitEditorsForLanguage;

// Attachment Management
window.triggerFileDialog = triggerFileDialog;
window.handleFileSelect = handleFileSelect;
window.clearAllAttachments = clearAllAttachments;



// Language Management
window.changeLanguage = changeLanguageGlobal;
window.getText = getText;
window.getCurrentLanguage = getCurrentLanguage;


// Log Management Extra
window.goBackToLogsList = goBackToLogsList;
window.scrollLogToBottom = scrollLogToBottom;
window.searchInLogs = searchInLogs;
window.clearLogContent = clearLogContent;
window.filterLogContent = filterLogContent;

// Settings
window.saveSettings = saveSettings;
window.reloadSettings = reloadSettings;

// Progress Modal Management (from progress-modal.js)
// Note: closeSendingModal, pauseSending, resumeSending, cancelSending, stopSending
// are already defined as window functions in progress-modal.js

// Preview Management
window.toggleFullscreenPreview = toggleFullscreenPreview;

// Contact Management Extra
window.updateContactCount = () => {
    if (!state.currentData) return;
    const countElement = document.getElementById('contact-count');
    if (!countElement) return;
    
    const activeTab = document.querySelector('.subtab.active');
    if (!activeTab) return;
    
    const tabType = activeTab.dataset.subtab;
    
    if (tabType === 'valid') {
        const total = state.currentData.valid ? state.currentData.valid.length : 0;
        const selected = state.selectedRows.length;
        countElement.textContent = `${selected}/${total} ${window.getText('selected-count')}`;
    } else {
        const total = state.currentData.invalid ? state.currentData.invalid.length : 0;
        countElement.textContent = `${total} ${window.getText('invalid-records-count')}`;
    }
};
window.updateSelectedRows = () => {
    state.selectedRows = Array.from(document.querySelectorAll('.select-row:checked'))
        .map(cb => parseInt(cb.dataset.index));
    
    if (window.go && window.go.main && window.go.main.App && typeof window.go.main.App.SetSelectedRows === 'function') {
        window.go.main.App.SetSelectedRows(state.selectedRows)
            .catch(console.error);
    }
    
    const continueBtn = document.getElementById('continue-contacts-btn');
    if (continueBtn) continueBtn.disabled = state.selectedRows.length === 0;
    window.updateContactCount();
    
    logToSystem(`${state.selectedRows.length} recipient(s) selected`, 'info', { selectedRowCount: state.selectedRows.length });
};

window.templateEditor = null;
window.sendEditor = null;

// Filter templates function
function filterTemplates() {
    const filterValue = document.getElementById('template-filter').value;
    if (window.updateTemplateSelect) {
        window.updateTemplateSelect(filterValue);
    }
}

function filterTemplatesUI() {
    const filterValue = document.getElementById('templates-filter').value;
    // Re-render table by temporarily filtering state.templates
    const original = [...state.templates];
    let filtered = original;
    if (filterValue !== 'all') {
        filtered = original.filter(t => t.language === filterValue);
    }
    
    // Use the proper updateTemplatesTable function to maintain consistency
    // Temporarily set state.templates to filtered list
    const backup = state.templates;
    state.templates = filtered;
    
    // Import the stripHtml function if not available
    const stripHtml = (html) => {
        const tmp = document.createElement('DIV');
        tmp.innerHTML = html || '';
        return tmp.textContent || tmp.innerText || '';
    };
    
    const escapeHtml = (text) => {
        const div = document.createElement('div');
        div.textContent = text || '';
        return div.innerHTML;
    };
    
    // Render filtered list
    const tbody = document.querySelector('#templates-table tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    
    filtered.forEach(template => {
        const tr = document.createElement('tr');
        
        // Create proper content preview
        let contentPreview = '';
        if (typeof template.content === 'string') {
            contentPreview = stripHtml(template.content);
        } else if (typeof template.html === 'string') {
            contentPreview = stripHtml(template.html);
        }
        contentPreview = contentPreview.substring(0, 100);
        
        // Language display
        let languageDisplay = '';
        if (template.language === 'tr') languageDisplay = '🇹🇷';
        else if (template.language === 'en') languageDisplay = '🇺🇸';
        
        tr.innerHTML = `
            <td>${escapeHtml(template.name)}</td>
            <td>${escapeHtml(template.subject)}</td>
            <td title="${escapeHtml(contentPreview)}">${escapeHtml(contentPreview)}${contentPreview.length >= 100 ? '...' : ''}</td>
            <td>${languageDisplay}</td>
            <td><button class="btn-small" onclick="editTemplate('${escapeHtml(template.name)}')">${window.getText ? window.getText('edit-template-btn') : '✏️ Düzenle'}</button></td>
        `;
        tbody.appendChild(tr);
    });
    
    // Restore original templates
    state.templates = backup;
}

document.addEventListener('DOMContentLoaded', () => {
    logToSystem('Application starting...', 'info');
    console.log('DOM fully loaded, starting initialization...');

    // Initialize language system first
    initLanguage();

    // Load settings
    loadSettings();

    // Set default language filters to current UI language
    const currentLang = getCurrentLanguage();
    const sendFilter = document.getElementById('template-filter');
    if (sendFilter && (currentLang === 'tr' || currentLang === 'en')) sendFilter.value = currentLang;
    const templatesFilter = document.getElementById('templates-filter');
    if (templatesFilter && (currentLang === 'tr' || currentLang === 'en')) templatesFilter.value = currentLang;
    
    setupEventListeners();
    loadInitialData();

    setTimeout(() => {
        initAttachmentSystem();
        logToSystem('Attachment system is ready', 'success');
        
        initTemplateEditor();
        initSendEditor();
        // hook template and send preview auto-update listeners and do initial previews
        try { setupTemplatePreviewAutoUpdate(); } catch {}
        try { window.setupSendPreviewAutoUpdate && window.setupSendPreviewAutoUpdate(); } catch {}
        try { window.updateTemplatePreview && window.updateTemplatePreview(); } catch {}
        try { window.updateSendPreview && window.updateSendPreview(); } catch {}
        logToSystem('Editors are ready', 'success');
    }, 500);

    logToSystem('All systems initialized successfully', 'success');
    // console message optional
});

export function setupEventListeners() {
    document.getElementById('hamburger').addEventListener('click', toggleLogSidebar);

    const logFilesSelect = document.getElementById('log-files');
    if (logFilesSelect) {
        logFilesSelect.addEventListener('change', loadLogFileContent);
        console.log('Log files dropdown event listener added');
    }

    // Content format radio buttons removed (HTML only) - no listeners needed
    // Send theme radio buttons removed - theme is now controlled by editor wrapper
    // Live preview on subject typing is now handled in setupSendPreviewAutoUpdate
    // Template preview theme radio buttons removed - theme is now controlled by editor wrapper

    if (window.runtime && typeof window.runtime.EventsOn === 'function') {
        window.runtime.EventsOn('log', handleLog);
        window.runtime.EventsOn('accountsLoaded', handleAccountsLoaded);
        window.runtime.EventsOn('templatesLoaded', handleTemplatesLoaded);
        window.runtime.EventsOn('attachmentsUpdated', handleAttachmentsUpdated);
        window.runtime.EventsOn('sendProgress', handleSendProgress);
        window.runtime.EventsOn('sendDone', handleSendDone);
    } else {
        console.error('Wails runtime not available');
        const grid = document.getElementById('log-files-grid');
        if (grid) {
            grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #e74c3c;">❌ No backend connection</div>`;
        }
    }
}

export function loadInitialData() {
    if (window.go && window.go.main && window.go.main.App) {
        window.go.main.App.LoadAccounts().catch(console.error);
        window.go.main.App.LoadTemplates().catch(console.error);
    } else {
        console.warn('Backend not available for initial data load');
    }
}

export function handleLog(log) {
    const logsElement = document.getElementById('system-log-console');
    if (logsElement) {
        logsElement.textContent += log;
        scrollToBottom();
    }
}

export function handleAccountsLoaded(loadedAccounts) {
    state.accounts.length = 0;
    if (Array.isArray(loadedAccounts)) state.accounts.push(...loadedAccounts);
    updateAccountsTable();
    updateSendAccountCombo();
    document.getElementById('continue-accounts-btn').disabled = state.accounts.length === 0;
    
    // Eğer selectedAccount varsa ve artık mevcut değilse, temizle
    if (state.selectedAccount && !state.accounts.some(acc => acc.email === state.selectedAccount)) {
        state.selectedAccount = null;
    }
    
    logToSystem(`${state.accounts.length} email account(s) loaded`, 'success', { accountCount: state.accounts.length });
}

export function handleTemplatesLoaded(loadedTemplates) {
    state.templates.length = 0;
    if (Array.isArray(loadedTemplates)) state.templates.push(...loadedTemplates);
    updateTemplatesTable();
    // Apply default filter values after load
    const currentLang = getCurrentLanguage();
    if (document.getElementById('template-filter')) {
        if (currentLang === 'tr' || currentLang === 'en') document.getElementById('template-filter').value = currentLang;
        filterTemplates();
    }
    if (document.getElementById('templates-filter')) {
        if (currentLang === 'tr' || currentLang === 'en') document.getElementById('templates-filter').value = currentLang;
        filterTemplatesUI();
    }
    document.getElementById('continue-templates-btn').disabled = false;
    
    // Eğer currentTemplate varsa ve artık mevcut değilse, temizle
    if (state.currentTemplate && !state.templates.some(t => t.name === state.currentTemplate)) {
        state.currentTemplate = null;
    }
    
    logToSystem(`${state.templates.length} email template(s) loaded`, 'success', { templateCount: state.templates.length });
}

export function handleAttachmentsUpdated(attachmentList) {
    updateAttachmentsList(attachmentList);
}

export function handleSendProgress(data) {
    // Progress modal is now handled in sendManagement.js via email:progress events
    // This legacy handler can just log for backwards compatibility
    logToSystem(`Send progress: %${data.progress} - ${data.status}`, 'info', { progress: data.progress, status: data.status });
}

export function handleSendDone() {
    // Completion is now handled in sendManagement.js via email:complete events
    // This legacy handler can just log and cleanup for backwards compatibility
    const sendBtn = document.getElementById('send-btn');
    if (sendBtn) {
        sendBtn.disabled = false;
        sendBtn.classList.remove('loading');
    }
    logToSystem('Email sending completed successfully', 'success', {
        totalRecipients: state.selectedRows ? state.selectedRows.length : 0,
        completionTime: new Date().toLocaleTimeString('en-US')
    });
}
