import { showNotification } from './utils.js';
import { state } from './state.js';


export function initAttachmentSystem() {
    console.log('Attachment system initializing...');
    renderAttachmentList();
    setupDragAndDrop();
    console.log('Attachment system ready');
}

export function setupDragAndDrop() {
    const attachmentContainer = document.querySelector('.attachment-container');
    if (!attachmentContainer) return;
    
    attachmentContainer.addEventListener('dragover', (e) => {
        e.preventDefault();
        attachmentContainer.classList.add('drag-over');
    });
    
    attachmentContainer.addEventListener('dragleave', (e) => {
        e.preventDefault();
        attachmentContainer.classList.remove('drag-over');
    });
    
attachmentContainer.addEventListener('drop', (e) => {
        e.preventDefault();
        attachmentContainer.classList.remove('drag-over');
        // Drag & drop cannot provide absolute paths in webview; instruct user to use the picker
        showNotification('Please use the 📎 Add File button to attach files from your PC', 'info');
    });
}

export async function triggerFileDialog() {
    // Use backend file picker so we get absolute paths and can send directly without saving
    try {
        if (!(window.go && window.go.main && window.go.main.App && typeof window.go.main.App.AddAttachment === 'function')) {
            showNotification('❌ No backend connection', 'warning');
            return;
        }
        const result = await window.go.main.App.AddAttachment();
        
        // Parse JSON response
        try {
            const data = JSON.parse(result);
            if (data.error) {
                showNotification(data.error, 'error');
            } else if (data.cancelled) {
                // File selection was cancelled, do nothing
            } else if (data.path) {
                // File was successfully added
                showNotification(`File added: ${data.name}`, 'success');
            }
        } catch (parseError) {
            // Fallback for non-JSON responses (backwards compatibility)
            if (result && typeof result === 'string' && !/iptal|cancelled/i.test(result)) {
                showNotification(result, 'success');
            }
        }
    } catch (e) {
        console.error('AddAttachment failed:', e);
        showNotification('Attachment selection failed', 'error');
    }
}

export function handleFileSelect(event) {
    // File inputs do not expose absolute paths in webview; redirect users to use backend picker
    showNotification('Please use the 📎 Add File button to attach files from your PC', 'info');
}

export function addFileToAttachments(file) {
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
        const msg = window.getText ? window.getText('file-too-large').replace('{name}', file.name) : `${file.name} too large! Max 50MB`;
        showNotification(msg, 'error');
        return { success: false, reason: 'size' };
    }
    
    const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain',
        'image/jpeg',
        'image/png',
        'image/gif',
        'application/zip',
        'application/x-rar-compressed'
    ];
    
    if (!allowedTypes.includes(file.type) && file.type !== '') {
        const msg = window.getText ? window.getText('unsupported-file-type').replace('{name}', file.name) : `${file.name} may be an unsupported file type`;
        showNotification(msg, 'warning');
    }
    
const duplicate = state.attachments.find(att => 
        att.name === file.name && 
        att.size === file.size && 
        att.lastModified === file.lastModified
    );
    
    if (duplicate) {
        const msg = window.getText ? window.getText('file-already-added').replace('{name}', file.name) : `${file.name} already added`;
        showNotification(msg, 'warning');
        return { success: false, reason: 'duplicate' };
    }
    
state.attachments.push({
        file: file,
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
        id: generateFileId()
    });
    
    return { success: true };
}

export function generateFileId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function renderAttachmentList() {
    const attachmentList = document.getElementById('attachment-list');
    if (!attachmentList) {
        console.error('Attachment list element not found');
        return;
    }
    
attachmentList.innerHTML = state.attachments.length === 0
        ? `<div class="attachment-empty">${window.getText ? window.getText('no-files-added') : 'Henüz dosya eklenmedi...'}</div>`
        : '';
    
state.attachments.forEach((attachment, index) => {
        const item = createAttachmentItem(attachment, index);
        attachmentList.appendChild(item);
    });
}

export function createAttachmentItem(attachment, index) {
    const item = document.createElement('div');
    item.className = 'attachment-item';
    item.dataset.index = index;
    item.dataset.fileId = attachment.id;
    
    const icon = document.createElement('span');
    icon.className = 'attachment-icon';
    icon.textContent = getFileIcon(attachment.type);
    
    const name = document.createElement('span');
    name.className = 'attachment-name';
    name.textContent = attachment.name;
    name.title = attachment.name;
    
    const size = document.createElement('span');
    size.className = 'attachment-size';
    size.textContent = formatFileSize(attachment.size);
    
    const removeBtn = document.createElement('button');
    removeBtn.className = 'attachment-remove';
            removeBtn.textContent = window.getText('remove-btn');
            removeBtn.title = window.getText ? window.getText('remove-file') : 'Dosyayı kaldır';
    removeBtn.onclick = () => removeAttachmentByIndex(index);
    
    item.addEventListener('mouseenter', () => item.classList.add('hover'));
    item.addEventListener('mouseleave', () => item.classList.remove('hover'));
    
    item.appendChild(icon);
    item.appendChild(name);
    item.appendChild(size);
    item.appendChild(removeBtn);
    
    return item;
}

export function getFileIcon(fileType) {
    const iconMap = {
        'application/pdf': '📄',
        'application/msword': '📝',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '📝',
        'application/vnd.ms-excel': '📊',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '📊',
        'text/plain': '📃',
        'image/jpeg': '🖼️',
        'image/jpg': '🖼️',
        'image/png': '🖼️',
        'image/gif': '🖼️',
        'application/zip': '🗜️',
        'application/x-rar-compressed': '🗜️'
    };
    
    return iconMap[fileType] || '📎';
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

export function removeAttachmentByIndex(index) {
if (index < 0 || index >= state.attachments.length) {
        console.error('Invalid attachment index:', index);
        return;
    }
    
const attachment = state.attachments[index];
state.attachments.splice(index, 1);
    
    renderAttachmentList();
            showNotification(`${attachment.name} ${window.getText ? window.getText('removed') : 'kaldırıldı'}`, 'info');
}

export function clearAllAttachments() {
if (state.attachments.length === 0) {
        showNotification(window.getText ? window.getText('no-files-to-clear') : 'Zaten hiç dosya yok', 'info');
        return;
    }
    
const count = state.attachments.length;
state.attachments.length = 0;
    renderAttachmentList();
    showNotification(window.getText ? window.getText('files-cleared').replace('{count}', count) : `${count} files cleared`, 'success');
}

export function syncAttachmentsToBackend() {
    if (!window.go || !window.go.main || !window.go.main.App) {
        console.error('Backend not available for sync');
        return;
    }
    
    if (!window.go.main.App.SaveAttachmentFile) {
        console.warn('SaveAttachmentFile method not available, using basic sync');
        basicSyncAttachments();
        return;
    }
    
const savePromises = state.attachments.map(async (attachment, index) => {
        try {
            const base64 = await fileToBase64(attachment.file);
            const savedPath = await window.go.main.App.SaveAttachmentFile(attachment.name, base64);
            return savedPath;
        } catch (error) {
            console.error(`Failed to save attachment ${attachment.name}:`, error);
            showNotification(window.getText ? window.getText('file-save-failed').replace('{name}', attachment.name) : `File could not be saved: ${attachment.name}`, 'warning');
            return null;
        }
    });
    
    Promise.all(savePromises)
        .then(savedPaths => {
            const validPaths = savedPaths.filter(path => path !== null);
            return window.go.main.App.SyncAttachments(validPaths);
        })
        .then(result => {
            showNotification(window.getText ? window.getText('files-synced') : 'Files successfully synchronized', 'success');
        })
        .catch(error => {
            console.error('Failed to sync attachments:', error);
            const msg = window.getText ? window.getText('attachments-sync-error').replace('{error}', error) : 'Attachments could not be synchronized: ' + error;
            showNotification(msg, 'error');
        });
}

export function updateAttachmentsList(newList) {
    if (!Array.isArray(newList)) return;
    
    state.attachments.length = 0;
    
    // newList from backend can be either strings (legacy) or objects with file info
    const normalized = newList.map(item => {
        if (typeof item === 'object' && item.path) {
            // New format with full file info
            return {
                file: null,
                name: item.name || item.path.split('/').pop(),
                path: item.path,
                size: item.size || 0,
                type: item.type || '',
                lastModified: item.lastModified || 0,
                id: generateFileId()
            };
        } else if (typeof item === 'string') {
            // Legacy format - just paths
            return {
                file: null,
                name: item.split('/').pop(),
                path: item,
                size: 0,
                type: '',
                lastModified: 0,
                id: generateFileId()
            };
        } else {
            // Fallback
            return {
                file: null,
                name: String(item),
                path: String(item),
                size: 0,
                type: '',
                lastModified: 0,
                id: generateFileId()
            };
        }
    });
    
    state.attachments.push(...normalized);
    renderAttachmentList();
}

export function basicSyncAttachments() {
const attachmentNames = state.attachments.map(attachment => attachment.file.name);
    window.go.main.App.SyncAttachments(attachmentNames)
        .then(result => {
            console.log('Basic sync successful:', result);
        })
        .catch(error => {
            console.error('Basic sync failed:', error);
            const msg = window.getText ? window.getText('attachments-sync-error').replace('{error}', error) : 'Attachments could not be synchronized: ' + error;
            showNotification(msg, 'error');
        });
}

export function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}