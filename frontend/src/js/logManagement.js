import { logToSystem, showNotification, scrollLogToBottom, formatFileSize, escapeHtml, escapeRegex, showConfirmation } from './utils.js';

let currentLogFiles = [];
let currentLogContent = '';
let originalLogContent = '';
let currentSelectedLogFile = '';
let selectedLogFiles = new Set();
let isSelectionMode = false;

// Initialize logs buttons text on page load
export function initializeLogsButtons() {
    const toggleBtn = document.getElementById('toggle-selection-mode');
    const deleteSelectedBtn = document.getElementById('delete-selected-logs');
    const deleteAllBtn = document.getElementById('delete-all-logs-btn');
    const refreshBtn = document.getElementById('refresh-logs-btn');
    
    if (toggleBtn) {
        toggleBtn.textContent = window.getText('selection-mode-btn');
    }
    
    if (deleteSelectedBtn) {
        deleteSelectedBtn.textContent = window.getText('delete-selected-btn');
    }
    
    if (deleteAllBtn) {
        deleteAllBtn.textContent = window.getText('delete-all-logs-btn');
    }
    
    if (refreshBtn) {
        refreshBtn.textContent = window.getText('refresh-logs-btn');
    }
}

export function refreshLogFiles() {
    const grid = document.getElementById('log-files-grid');
    if (grid) {
        grid.classList.add('loading');
        grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #95a5a6;">📄 ${window.getText('loading-text')}</div>`;
    }
    
    if (!window.go || !window.go.main || !window.go.main.App || !window.go.main.App.GetLogFiles) {
        console.error('GetLogFiles method not available');
        showNotification(window.getText('bulk-delete-unavailable'), 'warning');
        if (grid) {
            grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #e74c3c;">${window.getText('backend-no-connection')}</div>`;
            grid.classList.remove('loading');
        }
        return;
    }
    
    window.go.main.App.GetLogFiles()
        .then(files => {
            currentLogFiles = Array.isArray(files) ? files : [];
            renderLogFileCards();
        })
        .catch(error => {
            console.error('Log files error:', error);
            showNotification('Failed to load log files: ' + error, 'error');
            if (grid) {
                grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #e74c3c;">❌ ${error}</div>`;
            }
        })
        .finally(() => {
            if (grid) grid.classList.remove('loading');
        });
}

export function renderLogFileCards() {
    const grid = document.getElementById('log-files-grid');
    if (!grid) return;
    
    grid.innerHTML = currentLogFiles.length === 0
        ? `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #95a5a6;">${window.getText('log-no-files-found')}</div>`
        : '';
    
    currentLogFiles.forEach(fileName => {
        const card = createLogFileCard(fileName);
        grid.appendChild(card);
    });
    
    updateLogSelectionUI();
}

export function createLogFileCard(fileName) {
    const card = document.createElement('div');
    card.className = 'log-file-card';
    card.dataset.filename = fileName;
    
    const fileInfo = parseLogFileName(fileName);
    const isSelected = selectedLogFiles.has(fileName);
    
    card.innerHTML = `
        <div class="log-card-header">
            <span class="log-card-icon">📄</span>
            <h4 class="log-card-title">${fileInfo.displayName}</h4>
            <div class="log-card-actions">
                <button class="log-select-btn ${isSelected ? 'selected' : ''}" onclick="toggleLogSelection('${fileName}')" title="${isSelected ? window.getText('log-deselect-tooltip') : window.getText('log-select-tooltip')}" style="display: none;">
                    ${isSelected ? '✓' : ''}
                </button>
                <button class="log-delete-btn" onclick="deleteSingleLog('${fileName}')" title="${window.getText('log-delete-tooltip')}">🗑️</button>
            </div>
        </div>
        <div class="log-card-info">
            <div class="log-card-date"><span>📅</span><span>${fileInfo.date}</span></div>
            <div class="log-card-size"><span>💾</span><span id="size-${fileName.replace(/[^a-zA-Z0-9]/g, '_')}">${window.getText('loading-text')}</span></div>
            <div class="log-card-lines"><span>📃</span><span id="lines-${fileName.replace(/[^a-zA-Z0-9]/g, '_')}">${window.getText('loading-text')}</span></div>
        </div>
    `;
    
    // Add click event for opening log (but not when clicking buttons)
    card.addEventListener('click', (e) => {
        if (!e.target.classList.contains('log-select-btn') && !e.target.classList.contains('log-delete-btn')) {
            openLogFile(fileName);
        }
    });
    
    getLogFileStats(fileName).then(stats => {
        const sizeElement = document.getElementById(`size-${fileName.replace(/[^a-zA-Z0-9]/g, '_')}`);
        const linesElement = document.getElementById(`lines-${fileName.replace(/[^a-zA-Z0-9]/g, '_')}`);
        if (sizeElement) sizeElement.textContent = stats.size;
        if (linesElement) linesElement.textContent = stats.lines;
    });
    
    return card;
}

export function parseLogFileName(fileName) {
    const fileNameOnly = fileName.split('/').pop() || fileName;
    const dateMatch = fileNameOnly.match(/(\d{4}-\d{2}-\d{2})/);
    const timeMatch = fileNameOnly.match(/(\d{2})(?:_|\.)txt/);
    
    let displayName = fileNameOnly.replace('.txt', '');
    let date = 'Bilinmeyen tarih';
    
    if (dateMatch) {
        const dateStr = dateMatch[1];
        const dateObj = new Date(dateStr);
        date = dateObj.toLocaleDateString('tr-TR');
        if (timeMatch) date += ` ${timeMatch[1]}:00`;
    }
    
    return { fileName, displayName, date };
}

export async function getLogFileStats(fileName) {
    try {
        if (window.go && window.go.main && window.go.main.App.ReadLogFile) {
            const content = await window.go.main.App.ReadLogFile(fileName);
            if (content) {
                const lines = content.split('\n').length;
                const size = formatFileSize(content.length);
                return { size, lines: `${lines} ${window.getText('lines-label')}` };
            }
        }
    } catch (error) {
        console.warn('Could not get stats for', fileName, error);
    }
    
    return { size: 'Bilinmiyor', lines: 'Bilinmiyor' };
}

export function openLogFile(fileName) {
    currentSelectedLogFile = fileName;
    const container = document.getElementById('log-files-container');
    const viewer = document.getElementById('log-viewer');
    const title = document.getElementById('current-log-title');
    
    if (container) container.classList.add('hidden');
    if (viewer) {
        viewer.classList.remove('hidden');
        viewer.classList.add('loading');
    }
    if (title) title.textContent = `📄 ${parseLogFileName(fileName).displayName}`;
    
    loadLogFileContent(fileName);
}

export function loadLogFileContent(fileName) {
    
    if (!window.go || !window.go.main || !window.go.main.App.ReadLogFile) {
        console.error('ReadLogFile method not available');
        showNotification('Log read feature is not available', 'warning');
        return;
    }
    
    window.go.main.App.ReadLogFile(fileName)
        .then(content => {
            currentLogContent = content || 'Log file is empty';
            originalLogContent = currentLogContent;
            // Global erişim için window'a kaydet
            window.originalLogContent = originalLogContent;
            const logContentElement = document.getElementById('log-content');
            if (logContentElement) logContentElement.textContent = currentLogContent;
            scrollLogToBottom();
        })
        .catch(error => {
            console.error('Read log file error:', error);
            showNotification('Failed to read log file: ' + error, 'error');
            const logContentElement = document.getElementById('log-content');
            if (logContentElement) logContentElement.textContent = window.getText('log-load-error') + error;
        })
        .finally(() => {
            const viewer = document.getElementById('log-viewer');
            if (viewer) viewer.classList.remove('loading');
        });
}

export function goBackToLogsList() {
    const container = document.getElementById('log-files-container');
    const viewer = document.getElementById('log-viewer');
    const searchInput = document.getElementById('log-search');
    
    if (container) container.classList.remove('hidden');
    if (viewer) viewer.classList.add('hidden');
    if (searchInput) {
        searchInput.style.display = 'none';
        searchInput.value = '';
    }
    
    const logContentElement = document.getElementById('log-content');
    if (logContentElement) logContentElement.textContent = originalLogContent;
    
    currentSelectedLogFile = '';
}

export function toggleLogSearch() {
    const searchInput = document.getElementById('log-search');
    if (searchInput) {
        if (searchInput.style.display === 'none' || !searchInput.style.display) {
            searchInput.style.display = 'block';
            searchInput.focus();
        showNotification(window.getText('notif-search-activated'), 'info');
        } else {
            searchInput.style.display = 'none';
            searchInput.value = '';
            const logContent = document.getElementById('log-content');
            if (logContent && originalLogContent) logContent.textContent = originalLogContent;
            showNotification(window.getText('notif-search-deactivated'), 'info');
        }
    }
}

export function filterLogContent() {
    const searchInput = document.getElementById('log-search');
    const logContent = document.getElementById('log-content');
    
    if (!searchInput || !logContent || !originalLogContent) return;
    
    const searchTerm = searchInput.value.toLowerCase();
    
    if (!searchTerm) {
        logContent.textContent = originalLogContent;
        return;
    }
    
    const lines = originalLogContent.split('\n');
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
            showNotification(`${filteredLines.length} ${window.getText('lines-found')}`, 'success');
}

export function toggleSelectionMode() {
    isSelectionMode = !isSelectionMode;
    const toggleBtn = document.getElementById('toggle-selection-mode');
    const deleteSelectedBtn = document.getElementById('delete-selected-logs');
    const refreshBtn = document.getElementById('refresh-logs-btn');
    const deleteAllBtn = document.getElementById('delete-all-logs-btn');
    
    if (toggleBtn) {
        // Toggle button remains visible but changes text and style
        toggleBtn.textContent = isSelectionMode ? window.getText('selection-mode-close-btn') : window.getText('selection-mode-btn');
        toggleBtn.className = isSelectionMode ? 'btn-warning' : 'btn-info';
    }
    
    if (deleteSelectedBtn) {
        deleteSelectedBtn.style.display = isSelectionMode ? 'inline-block' : 'none';
        deleteSelectedBtn.disabled = selectedLogFiles.size === 0;
    }
    
    // Hide/show other buttons when selection mode is active
    if (refreshBtn) {
        refreshBtn.style.display = isSelectionMode ? 'none' : 'inline-block';
    }
    
    if (deleteAllBtn) {
        deleteAllBtn.style.display = isSelectionMode ? 'none' : 'inline-block';
    }
    
    // Update all log cards to show/hide selection buttons
    currentLogFiles.forEach(fileName => {
        const card = document.querySelector(`[data-filename="${fileName}"]`);
        if (card) {
            const selectBtn = card.querySelector('.log-select-btn');
            if (selectBtn) {
                selectBtn.style.display = isSelectionMode ? 'inline-block' : 'none';
            }
        }
    });
    
    if (!isSelectionMode) {
        // Clear selection when exiting selection mode
        selectedLogFiles.clear();
        updateLogSelectionUI();
    }
    
    showNotification(isSelectionMode ? window.getText('selection-mode-activated') : window.getText('selection-mode-deactivated'), 'info');
}

export function toggleLogSelection(fileName) {
    if (!isSelectionMode) {
        showNotification(window.getText('notif-selection-required'), 'warning');
        return;
    }
    
    if (selectedLogFiles.has(fileName)) {
        selectedLogFiles.delete(fileName);
    } else {
        selectedLogFiles.add(fileName);
    }
    
    updateLogSelectionUI();
    updateLogCardSelection(fileName);
}

export function updateLogCardSelection(fileName) {
    const card = document.querySelector(`[data-filename="${fileName}"]`);
    if (card) {
        const selectBtn = card.querySelector('.log-select-btn');
        const isSelected = selectedLogFiles.has(fileName);
        
        if (selectBtn) {
            selectBtn.className = `log-select-btn ${isSelected ? 'selected' : ''}`;
            selectBtn.innerHTML = isSelected ? '✓' : '';
            selectBtn.title = isSelected ? window.getText('log-deselect-tooltip') : window.getText('log-select-tooltip');
        }
        
        // Update card visual state
        if (isSelected) {
            card.classList.add('selected');
        } else {
            card.classList.remove('selected');
        }
    }
}

export function updateLogSelectionUI() {
    const toggleBtn = document.getElementById('toggle-selection-mode');
    const deleteSelectedBtn = document.getElementById('delete-selected-logs');
    
    if (deleteSelectedBtn) {
        deleteSelectedBtn.disabled = selectedLogFiles.size === 0;
        deleteSelectedBtn.textContent = selectedLogFiles.size > 0 ? `${window.getText('delete-selected-btn')} (${selectedLogFiles.size})` : window.getText('delete-selected-btn');
    }
    
    // Update all cards
    currentLogFiles.forEach(fileName => {
        updateLogCardSelection(fileName);
    });
}

export function selectAllLogs() {
    if (!isSelectionMode) {
        showNotification(window.getText('notif-selection-required'), 'warning');
        return;
    }
    
    if (selectedLogFiles.size === currentLogFiles.length) {
        selectedLogFiles.clear();
        showNotification(window.getText ? window.getText('selections-cleared') : 'Selections cleared', 'info');
    } else {
        selectedLogFiles = new Set(currentLogFiles);
        showNotification(window.getText('notif-selected-count').replace('{count}', currentLogFiles.length), 'success');
    }
    
    updateLogSelectionUI();
}

export function deleteSingleLog(fileName) {
    if (event) event.stopPropagation();
    
    const fileInfo = parseLogFileName(fileName);
    showConfirmation(
        window.getText('confirm-delete-single-log').replace('{name}', fileInfo.displayName),
        (confirmed) => {
            if (confirmed) {
                deleteLogFiles([fileName]);
            }
        }
    );
}

export function deleteSelectedLogs() {
    if (selectedLogFiles.size === 0) {
        showNotification(window.getText('notif-no-selection'), 'warning');
        return;
    }
    
    const fileNames = Array.from(selectedLogFiles);
    const confirmMessage = fileNames.length === 1 
        ? window.getText('confirm-delete-single-log').replace('{name}', parseLogFileName(fileNames[0]).displayName)
        : window.getText('confirm-delete-multiple-logs').replace('{count}', fileNames.length);
    
    showConfirmation(confirmMessage, (confirmed) => {
        if (confirmed) {
            deleteLogFiles(fileNames);
        }
    });
}

export function deleteAllLogs() {
    if (currentLogFiles.length === 0) {
        showNotification(window.getText('notif-no-log-files'), 'warning');
        return;
    }
    
    showConfirmation(
        `${currentLogFiles.length} log files? This action cannot be undone!`,
        (confirmed) => {
            if (confirmed) {
                deleteAllLogFilesBackend();
            }
        }
    );
}

export function deleteLogFiles(fileNames) {
    if (!window.go || !window.go.main || !window.go.main.App) {
        showNotification(window.getText('backend-no-connection'), 'error');
        return;
    }
    
    const promises = fileNames.map(fileName => {
        if (window.go.main.App.DeleteLogFile) {
            return window.go.main.App.DeleteLogFile(fileName)
                .then(() => ({ success: true, fileName }))
                .catch(error => ({ success: false, fileName, error }));
        } else {
            return Promise.resolve({ success: false, fileName, error: 'DeleteLogFile method not available' });
        }
    });
    
    Promise.all(promises)
        .then(results => {
            const successCount = results.filter(r => r.success).length;
            const errorCount = results.length - successCount;
            
            if (successCount > 0) {
                showNotification(window.getText('notif-deleted-count').replace('{count}', successCount), 'success');
                logToSystem(window.getText('notif-deleted-count').replace('{count}', successCount), 'info');
            }
            
            if (errorCount > 0) {
                showNotification(window.getText('notif-delete-failed-count').replace('{count}', errorCount), 'error');
                logToSystem(window.getText('notif-delete-failed-count').replace('{count}', errorCount), 'error');
            }
            
            // Refresh the log files list and reset selection mode
            refreshLogFiles();
            selectedLogFiles.clear();
            
            // Always close selection mode after deletion
            isSelectionMode = false;
            const toggleBtn = document.getElementById('toggle-selection-mode');
            const deleteSelectedBtn = document.getElementById('delete-selected-logs');
            const refreshBtn = document.getElementById('refresh-logs-btn');
            const deleteAllBtn = document.getElementById('delete-all-logs-btn');
            
            if (toggleBtn) {
                toggleBtn.textContent = window.getText('selection-mode-btn');
                toggleBtn.className = 'btn-info';
            }
            
            if (deleteSelectedBtn) {
                deleteSelectedBtn.style.display = 'none';
            }
            
            // Show other buttons back
            if (refreshBtn) {
                refreshBtn.style.display = 'inline-block';
            }
            
            if (deleteAllBtn) {
                deleteAllBtn.style.display = 'inline-block';
            }
            
            updateLogSelectionUI();
        })
        .catch(error => {
            console.error('Delete log files error:', error);
            showNotification(window.getText('notif-delete-failed-count').replace('{count}', fileNames.length), 'error');
        });
}

export function deleteAllLogFilesBackend() {
    if (currentLogFiles.length === 0) {
        showNotification(window.getText('notif-no-log-files'), 'warning');
        return;
    }
    
    if (!window.go || !window.go.main || !window.go.main.App || !window.go.main.App.DeleteAllLogFiles) {
        showNotification(window.getText('bulk-delete-unavailable'), 'error');
        return;
    }
    
    window.go.main.App.DeleteAllLogFiles()
        .then(() => {
            showNotification(window.getText('all-logs-deleted'), 'success');
            logToSystem(window.getText('all-logs-deleted'), 'info');
            refreshLogFiles();
            selectedLogFiles.clear();
            
            // Reset selection mode since all files are deleted
            isSelectionMode = false;
            const toggleBtn = document.getElementById('toggle-selection-mode');
            const deleteSelectedBtn = document.getElementById('delete-selected-logs');
            const refreshBtn = document.getElementById('refresh-logs-btn');
            const deleteAllBtn = document.getElementById('delete-all-logs-btn');
            
            if (toggleBtn) {
                toggleBtn.textContent = window.getText('selection-mode-btn');
                toggleBtn.className = 'btn-info';
            }
            
            if (deleteSelectedBtn) {
                deleteSelectedBtn.style.display = 'none';
            }
            
            // Show other buttons back
            if (refreshBtn) {
                refreshBtn.style.display = 'inline-block';
            }
            
            if (deleteAllBtn) {
                deleteAllBtn.style.display = 'inline-block';
            }
            
            updateLogSelectionUI();
        })
        .catch(error => {
            console.error('Delete all log files error:', error);
            showNotification('Error deleting log files: ' + error, 'error');
        });
}

export function clearAllLogs() {
    if (currentLogFiles.length === 0) {
        showNotification(window.getText('notif-no-log-files'), 'warning');
        return;
    }
    
    showConfirmation(
        window.getText('confirm-delete-multiple-logs').replace('{count}', currentLogFiles.length),
        (confirmed) => {
            if (confirmed) {
                deleteAllLogFilesBackend();
            }
        }
    );
}

// Search in logs functionality
export function searchInLogs() {
    toggleLogSearch();
}

// Make functions globally accessible
window.refreshLogFiles = refreshLogFiles;
window.openLogFile = openLogFile;
window.goBackToLogsList = goBackToLogsList;
window.scrollLogToBottom = scrollLogToBottom;
window.searchInLogs = searchInLogs;
window.filterLogContent = filterLogContent;
window.toggleSelectionMode = toggleSelectionMode;
window.toggleLogSelection = toggleLogSelection;
window.deleteSingleLog = deleteSingleLog;
window.deleteSelectedLogs = deleteSelectedLogs;
window.clearAllLogs = clearAllLogs;
