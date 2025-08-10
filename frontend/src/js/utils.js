import { state } from './state.js';

export function initTooltips() {
    // Tooltip sistemi - şimdilik basit console log
    console.log('Tooltips initialized');
}

export function switchTab(tabId) {
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.add('hidden'));
    
    document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
    document.getElementById(tabId).classList.remove('hidden');
    
    if (tabId === 'logs') {
        setTimeout(() => {
            if (window.initializeLogsButtons) window.initializeLogsButtons();
            if (window.refreshLogFiles) window.refreshLogFiles();
        }, 100);
    }
    
    if (tabId === 'send') {
        setTimeout(() => initTooltips(), 100);
    }
}

export function enableTab(tabId) {
    const tab = document.querySelector(`[data-tab="${tabId}"]`);
    tab.disabled = false;
    switchTab(tabId);
}

export function switchSubTab(subtabId) {
    document.querySelectorAll('.subtab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('#valid-table, #invalid-table').forEach(table => table.classList.add('hidden'));
    
    document.querySelector(`[data-subtab="${subtabId}"]`).classList.add('active');
    document.getElementById(`${subtabId}-table`).classList.remove('hidden');
    
    // Call global updateContactCount if available
    if (window.updateContactCount) window.updateContactCount();
}

export function toggleLogSidebar() {
    const sidebar = document.getElementById('log-sidebar');
    const content = document.getElementById('content');
    const hamburger = document.getElementById('hamburger');

    sidebar.classList.toggle('hidden');
    const isOpen = !sidebar.classList.contains('hidden');

    if (content) {
        if (isOpen) {
            content.classList.add('sidebar-open');
        } else {
            content.classList.remove('sidebar-open');
        }
    }

    if (hamburger) {
        hamburger.setAttribute('aria-expanded', String(isOpen));
    }
}

export function clearLogs() {
    const el = document.getElementById('system-log-console');
    if (el) el.textContent = '';
}

export function scrollToBottom() {
    const container = document.getElementById('log-sidebar');
    if (container) {
        container.scrollTop = container.scrollHeight;
    }
}

export function scrollLogToBottom() {
    const logContent = document.getElementById('log-content');
    if (logContent) {
        logContent.scrollTop = logContent.scrollHeight;
    }
}

export function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

export function stripHtml(html) {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
}

// Apply theme to HTML content exactly like backend does
export function applyThemeToHTMLPreview(htmlContent, isDark) {
    // Define theme colors
    const colors = isDark ? {
        bgColor: '#2c3e50',
        textColor: '#ecf0f1',
        headerColor: '#3498db',
        linkColor: '#3498db',
        borderColor: '#34495e',
        tableBg: '#2c3e50',
        tableHeaderBg: '#1a252f',
        blockquoteBg: '#34495e',
        blockquoteText: '#ecf0f1',
        blockquoteCaption: '#bdc3c7'
    } : {
        bgColor: '#ffffff',
        textColor: '#2c3e50',
        headerColor: '#2c3e50',
        linkColor: '#3498db',
        borderColor: '#dee2e6',
        tableBg: '#ffffff',
        tableHeaderBg: '#f8f9fa',
        blockquoteBg: '#f8f9fa',
        blockquoteText: '#2c3e50',
        blockquoteCaption: '#7f8c8d'
    };

    // Process the HTML content to add inline styles
    let processed = htmlContent;
    
    // Replace paragraph styles
    processed = processed.replace(/<p>/g, `<p style="margin-bottom: 1em; line-height: 1.6; font-family: Arial, sans-serif; color: ${colors.textColor};">`);
    processed = processed.replace(/<p style="text-align: center;">/g, `<p style="text-align: center; margin-bottom: 1em; line-height: 1.6; font-family: Arial, sans-serif; color: ${colors.textColor};">`);
    processed = processed.replace(/<p style="text-align: right;">/g, `<p style="text-align: right; margin-bottom: 1em; line-height: 1.6; font-family: Arial, sans-serif; color: ${colors.textColor};">`);
    processed = processed.replace(/<p style="text-align: left;">/g, `<p style="text-align: left; margin-bottom: 1em; line-height: 1.6; font-family: Arial, sans-serif; color: ${colors.textColor};">`);
    
    // Replace header styles
    for (let i = 1; i <= 6; i++) {
        const tag = `h${i}`;
        processed = processed.replace(new RegExp(`<${tag}>`, 'g'), `<${tag} style="margin: 1.5em 0 0.5em 0; font-weight: 600; line-height: 1.3; color: ${colors.headerColor}; font-family: Arial, sans-serif;">`);
        processed = processed.replace(new RegExp(`<${tag} style="text-align: center;">`, 'g'), `<${tag} style="text-align: center; margin: 1.5em 0 0.5em 0; font-weight: 600; line-height: 1.3; color: ${colors.headerColor}; font-family: Arial, sans-serif;">`);
    }
    
    // Replace list styles
    processed = processed.replace(/<ul>/g, `<ul style="margin: 1em 0; font-family: Arial, sans-serif; color: ${colors.textColor};">`);
    processed = processed.replace(/<ol>/g, `<ol style="margin: 1em 0; font-family: Arial, sans-serif; color: ${colors.textColor};">`);
    processed = processed.replace(/<ul style="text-align: center;">/g, `<ul style="text-align: center; list-style-position: inside; padding-left: 0; margin: 1em 0; font-family: Arial, sans-serif; color: ${colors.textColor};">`);
    processed = processed.replace(/<li>/g, `<li style="margin-bottom: 0.5em; color: ${colors.textColor};">`);
    
    // Replace link styles
    processed = processed.replace(/<a /g, `<a style="color: ${colors.linkColor}; text-decoration: underline;" `);
    
    // Replace blockquote styles
    processed = processed.replace(/<blockquote>/g, `<blockquote style="margin: 1.5em 0; padding: 1em 1.5em; border-left: 4px solid #3498db; background: ${colors.blockquoteBg}; font-style: italic; font-family: Arial, sans-serif; border-radius: 8px; color: ${colors.blockquoteText};">`);
    
    // Fix table styles
    processed = processed.replace(/border="1" cellpadding="6"/g, '');
    processed = processed.replace(/style="margin-left: auto; margin-right: auto;"/g, '');
    
    // Replace table tag with proper styling
    processed = processed.replace(/<table/g, `<table cellpadding="0" cellspacing="0" border="0" style="width: 100%; margin: 1em auto; font-family: Arial, sans-serif; font-size: 14px; border-collapse: collapse; border: 1px solid ${colors.borderColor};"`);    
    
    // Replace th and td tags
    if (isDark) {
        processed = processed.replace(/<th>/g, `<th style="padding: 10px 12px; background-color: ${colors.tableHeaderBg}; color: #ffffff; font-weight: bold; text-align: left; border: 1px solid ${colors.borderColor};">`);
        processed = processed.replace(/<td>/g, `<td style="padding: 10px 12px; background-color: ${colors.tableBg}; color: ${colors.textColor}; text-align: left; border: 1px solid ${colors.borderColor};">`);
    } else {
        processed = processed.replace(/<th>/g, `<th style="padding: 10px 12px; background-color: ${colors.tableHeaderBg}; color: ${colors.headerColor}; font-weight: bold; text-align: left; border: 1px solid ${colors.borderColor};">`);
        processed = processed.replace(/<td>/g, `<td style="padding: 10px 12px; background-color: ${colors.tableBg}; color: ${colors.textColor}; text-align: left; border: 1px solid ${colors.borderColor};">`);
    }
    
    // Add row background colors
    processed = processed.replace(/<tr>/g, `<tr style="background-color: ${colors.tableBg};">`);
    
    // Process buttons/CTAs
    processed = processed.replace(/style="background: #4f46e5;/g, 'style="background: #3498db;');
    
    // Wrap in complete HTML document with theme
    let wrappedHTML;
    if (isDark) {
        wrappedHTML = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: ${colors.bgColor};">
<div style="background-color: ${colors.bgColor}; color: ${colors.textColor}; font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
${processed}
</div>
</body>
</html>`;
    } else {
        wrappedHTML = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5;">
<div style="background-color: ${colors.bgColor}; color: ${colors.textColor}; font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px;">
${processed}
</div>
</body>
</html>`;
    }
    
    return wrappedHTML;
}

export function logDetailed(message, type = 'info', context = null) {
    const opts = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: (state.settings?.dateformat === '12h') };
    if (state.settings?.timezone) opts.timeZone = state.settings.timezone;
    let timestamp;
    try { timestamp = new Date().toLocaleTimeString('en-US', opts); } catch { timestamp = new Date().toLocaleTimeString('en-US'); }
    const colorMap = {
        'success': '#27ae60',
        'error': '#e74c3c',
        'warning': '#f39c12',
        'info': '#3498db',
        'debug': '#9b59b6'
    };
    
    const color = colorMap[type] || colorMap['info'];
    const prefix = `[${timestamp}] [${type.toUpperCase()}]`;
    
    if (context) {
        console.log(`%c${prefix} ${message}`, `color: ${color}; font-weight: bold;`, context);
    } else {
        console.log(`%c${prefix} ${message}`, `color: ${color}; font-weight: bold;`);
    }

    const logElement = document.getElementById('system-log-console');
    if (logElement) {
        logElement.textContent += `${prefix} ${message}\n`;
        scrollToBottom();
    }
}

export function logToSystem(message, type = 'info', context = null) {
    // Centralized backend logging only to avoid duplicates
    if (window.go && window.go.main && window.go.main.App && window.go.main.App.Log) {
        const level = (type || 'info').toString().toLowerCase();
        Promise.resolve(window.go.main.App.Log(level, message)).catch(() => {});
    }
    // No direct UI append here; UI listens to backend 'log' events
}

export function showNotification(message, type = 'info', options = {}) {
    const { duration = type === 'error' ? 8000 : 5000, persistent = false, allowClose = true, showProgress = true, context = null } = options;
    
    // Do not write notifications into system log to avoid duplicates
    let nc = document.getElementById('notification-container');
    if (!nc) {
        nc = document.createElement('div');
        nc.id = 'notification-container';
        nc.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1000;
            max-width: 400px;
            width: 100%;
        `;
        document.body.appendChild(nc);
    }
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.style.cssText = `
        background: #34495e;
        color: #ecf0f1;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        margin-bottom: 10px;
        padding: 12px;
        opacity: 0;
        transition: opacity 0.3s ease, transform 0.3s ease;
        transform: translateY(-10px);
        border-left: 4px solid #3498db;
    `;
    
    const icons = {
        'success': '✅',
        'error': '❌',
        'warning': '⚠️',
        'info': 'ℹ️',
        'debug': '🔧'
    };
    
    const content = document.createElement('div');
    content.className = 'notification-content';
    content.style.cssText = `
        display: flex;
        align-items: flex-start;
        gap: 10px;
    `;
    
    const icon = document.createElement('div');
    icon.className = 'notification-icon';
    icon.textContent = icons[type] || icons['info'];
    
    const text = document.createElement('div');
    text.className = 'notification-text';
    text.textContent = message;
    
    content.appendChild(icon);
    content.appendChild(text);
    notification.appendChild(content);
    
    if (allowClose) {
        const closeBtn = document.createElement('button');
        closeBtn.className = 'notification-close';
        closeBtn.innerHTML = '×';
        closeBtn.style.cssText = `
            position: absolute;
            top: 8px;
            right: 8px;
            background: none;
            border: none;
            font-size: 16px;
            cursor: pointer;
            color: #ecf0f1;
        `;
        closeBtn.onclick = (e) => {
            e.stopPropagation();
            removeNotification(notification);
        };
        notification.appendChild(closeBtn);
    }
    
    if (showProgress && !persistent) {
        const progress = document.createElement('div');
        progress.className = 'notification-progress auto';
        progress.style.cssText = `
            height: 3px;
            background: #3498db;
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            animation: progress ${duration}ms linear forwards;
        `;
        notification.appendChild(progress);
    }
    
    nc.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
    }, 10);
    
    if (!persistent) {
        setTimeout(() => removeNotification(notification), duration);
    }
}

export function removeNotification(notification) {
    notification.style.opacity = '0';
    notification.style.transform = 'translateY(-10px)';
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 300);
}

export function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    if (bytes < 1024) return bytes + ' B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const size = (bytes / Math.pow(k, i)).toFixed(i === 0 ? 0 : 1);
    
    return size + ' ' + sizes[i];
}

export function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function showConfirmation(message, callback) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `;
    
    const content = document.createElement('div');
    content.className = 'modal-content';
    content.style.cssText = `
        background: #34495e;
        color: #ecf0f1;
        padding: 20px;
        border-radius: 12px;
        max-width: 500px;
        width: 90%;
        box-shadow: 0 10px 30px rgba(0,0,0,0.4);
        border: 1px solid #7f8c8d;
    `;
    
    const messageElement = document.createElement('div');
    messageElement.style.cssText = 'margin-bottom: 20px; white-space: pre-wrap;';
    messageElement.textContent = message;
    
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = 'display: flex; justify-content: flex-end; gap: 10px;';
    
    const confirmBtn = document.createElement('button');
            confirmBtn.textContent = window.getText('yes-btn');
    confirmBtn.style.cssText = `
        padding: 12px 20px;
        background: #27ae60;
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 500;
        transition: all 0.3s ease;
    `;
    confirmBtn.onmouseover = () => confirmBtn.style.background = '#2ecc71';
    confirmBtn.onmouseout = () => confirmBtn.style.background = '#27ae60';
    confirmBtn.onclick = () => {
        callback(true);
        document.body.removeChild(modal);
    };
    
    const cancelBtn = document.createElement('button');
            cancelBtn.textContent = window.getText('no-btn');
    cancelBtn.style.cssText = `
        padding: 12px 20px;
        background: #e74c3c;
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 500;
        transition: all 0.3s ease;
    `;
    cancelBtn.onmouseover = () => cancelBtn.style.background = '#c0392b';
    cancelBtn.onmouseout = () => cancelBtn.style.background = '#e74c3c';
    cancelBtn.onclick = () => {
        callback(false);
        document.body.removeChild(modal);
    };
    
    buttonContainer.appendChild(cancelBtn);
    buttonContainer.appendChild(confirmBtn);
    content.appendChild(messageElement);
    content.appendChild(buttonContainer);
    modal.appendChild(content);
    document.body.appendChild(modal);
}

// Log search ve filter fonksiyonları
export function searchInLogs() {
    const searchInput = document.getElementById('log-search');
    if (searchInput) {
        if (searchInput.style.display === 'none' || !searchInput.style.display) {
            searchInput.style.display = 'block';
            searchInput.focus();
            logToSystem('Log search enabled', 'info');
        } else {
            searchInput.style.display = 'none';
            searchInput.value = '';
            // Reset log content
            if (window.originalLogContent) {
                const logContent = document.getElementById('log-content');
                if (logContent) logContent.textContent = window.originalLogContent;
            }
            logToSystem('Log search disabled', 'info');
        }
    }
}

export function clearLogContent() {
    const logContent = document.getElementById('log-content');
    if (logContent) {
        logContent.textContent = window.getText('log-content-cleared');
        showNotification('Log content cleared', 'success');
        logToSystem('Log viewer content cleared', 'info');
    }
}

export function filterLogContent() {
    const searchInput = document.getElementById('log-search');
    const logContent = document.getElementById('log-content');
    
    if (!searchInput || !logContent) return;
    
    const searchTerm = searchInput.value.toLowerCase();
    
    // Get original content from global window variable or current content
    const originalContent = window.originalLogContent || logContent.textContent;
    
    if (!searchTerm) {
        logContent.textContent = originalContent;
        return;
    }
    
    const lines = originalContent.split('\n');
    const filteredLines = lines.filter(line => line.toLowerCase().includes(searchTerm));
    
    if (filteredLines.length === 0) {
        logContent.textContent = `"${searchTerm}" ${window.getText('search-no-results')}`;
        return;
    }
    
    const highlightedContent = filteredLines.map(line => {
        const regex = new RegExp(`(${escapeRegex(searchTerm)})`, 'gi');
        return escapeHtml(line).replace(regex, '<span class="log-highlight">$1</span>');
    }).join('\n');
    
    logContent.innerHTML = highlightedContent;
}

export function toggleFullscreenPreview(previewId) {
    const preview = document.getElementById(previewId);
    if (!preview) return;
    
    if (preview.classList.contains('fullscreen')) {
        // Tam ekrandan çık
        preview.classList.remove('fullscreen');
        const closeBtn = preview.querySelector('.close-fullscreen');
        if (closeBtn) {
            closeBtn.remove();
        }
        document.body.style.overflow = '';
    } else {
        // Tam ekran yap
        preview.classList.add('fullscreen');
        document.body.style.overflow = 'hidden';
        
        // Kapatma butonu ekle
        const closeBtn = document.createElement('button');
        closeBtn.className = 'close-fullscreen';
        closeBtn.innerHTML = '×';
        closeBtn.onclick = () => toggleFullscreenPreview(previewId);
        preview.appendChild(closeBtn);
        
        // ESC tuşu ile kapatma
        const handleEsc = (e) => {
            if (e.key === 'Escape') {
                toggleFullscreenPreview(previewId);
                document.removeEventListener('keydown', handleEsc);
            }
        };
        document.addEventListener('keydown', handleEsc);
    }
}
