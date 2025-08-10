import { stripHtml, applyThemeToHTMLPreview } from './utils.js';
import { initTemplateEditor, getEditorHtml, getEditorText, setEditorHtml } from './tinymceSetup.js';
import {
    logToSystem,
    showNotification,
    escapeHtml
} from './utils.js';
import { state } from './state.js';
import { getCurrentLanguage } from './languageManager.js';

export function updateTemplatesTable() {
    const tbody = document.querySelector('#templates-table tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    state.templates.forEach(template => {
        const tr = document.createElement('tr');
        
        // Create content preview - check both content and html fields
        let contentPreview = '';
        if (typeof template.content === 'string' && template.content) {
            contentPreview = stripHtml(template.content);
        } else if (typeof template.html === 'string' && template.html) {
            contentPreview = stripHtml(template.html);
        } else {
            contentPreview = 'No content';
        }
        
        // Ensure we have actual text, not just empty string
        if (!contentPreview || contentPreview.trim() === '') {
            contentPreview = 'Empty template';
        }
        
        // Limit preview length
        const fullPreview = contentPreview;
        if (contentPreview.length > 100) {
            contentPreview = contentPreview.substring(0, 100) + '...';
        }
        
        // Language display
        let languageDisplay = '';
        if (template.language === 'tr') languageDisplay = window.getCountryFlag ? window.getCountryFlag('TR') : 'TR';
        else if (template.language === 'en') languageDisplay = window.getCountryFlag ? window.getCountryFlag('US') : 'US';
        
        // No HTML column - only Name, Subject, Content Preview, Language, Actions
        tr.innerHTML = `
            <td>${escapeHtml(template.name)}</td>
            <td>${escapeHtml(template.subject)}</td>
            <td title="${escapeHtml(fullPreview)}">${escapeHtml(contentPreview)}</td>
            <td>${languageDisplay}</td>
            <td><button class="btn-small" onclick="editTemplate('${escapeHtml(template.name)}')">${window.getText ? window.getText('edit-template-btn') : '✏️ Düzenle'}</button></td>
        `;
        tbody.appendChild(tr);
    });
}

export function updateTemplateSelect(filterLanguage = 'all') {
    const select = document.getElementById('template-select');
    const placeholderText = window.getText ? window.getText('template-select-placeholder') : 'Şablon seçin (isteğe bağlı)';
    select.innerHTML = `<option value="">${placeholderText}</option>`;
    
    state.templates.forEach(template => {
        const templateLang = template.language; // may be undefined
        
        // Dil filtreleme: spesifik filtre seçildiyse, sadece eşleşenler gelsin
        if (filterLanguage !== 'all') {
            if (!templateLang || templateLang !== filterLanguage) return;
        }
        
        let languagePrefix = '';
        if (templateLang === 'tr') languagePrefix = (window.getCountryFlag ? window.getCountryFlag('TR') : 'TR') + ' ';
        else if (templateLang === 'en') languagePrefix = (window.getCountryFlag ? window.getCountryFlag('US') : 'US') + ' ';
        
        const option = document.createElement('option');
        option.value = template.name;
        option.text = `${languagePrefix}${template.name}`;
        if (templateLang) option.setAttribute('data-language', templateLang);
        select.appendChild(option);
    });
}

export function showTemplateForm() {
    resetTemplateForm();
    document.getElementById('template-form').classList.remove('hidden');
    document.getElementById('delete-template-btn').style.display = 'none';
    // Default language to current UI language
    const currentLang = getCurrentLanguage();
    document.getElementById('template-language').value = currentLang;
    state.currentTemplate = null;
}

export function hideTemplateForm() {
    document.getElementById('template-form').classList.add('hidden');
    resetTemplateForm();
}

export function resetTemplateForm() {
    document.getElementById('template-name').value = '';
    document.getElementById('template-subject').value = '';
    try {
        setEditorHtml('template', '');
    } catch (e) {
        initTemplateEditor({ html: '' });
    }
    // HTML only mode
    const preview = document.getElementById('template-preview');
    if (preview) preview.innerHTML = '';
}

export async function editTemplate(name) {
    const template = state.templates.find(t => t.name === name);
    if (template) {
        document.getElementById('template-form').classList.remove('hidden');
        document.getElementById('template-name').value = template.name;
        document.getElementById('template-subject').value = template.subject;
        // Set language only if template has a valid language
        if (template.language === 'tr' || template.language === 'en') {
            document.getElementById('template-language').value = template.language;
        }
        
        // Editöre HTML içeriği yükle
        const htmlContent = (typeof template.content === 'string') ? template.content : '';
        if (window.templateEditor) {
            setEditorHtml('template', htmlContent);
        } else {
            await initTemplateEditor({ html: htmlContent });
        }
        
        // HTML only mode - ignore old format radios
        document.getElementById('delete-template-btn').style.display = 'inline-block';
        state.currentTemplate = name;
        updateTemplatePreview();
    }
}



export async function validateTemplateForm() {
    const name = document.getElementById('template-name').value.trim();
    const subject = document.getElementById('template-subject').value.trim();
    const language = document.getElementById('template-language').value;
    
    let content = '';
    try {
        content = getEditorHtml('template') || '';
        content = content.trim();
    } catch (error) {
        console.error('Editor content fetch error:', error);
        content = '';
    }
    
    logToSystem('Template form validation started', 'info', {
        name: name,
        subject: subject,
        language: language,
        contentLength: content.length,
        hasEditor: !!window.templateEditor
    });
    
    if (!name) {
        logToSystem('Template name empty - validation failed', 'warning');
        showNotification(window.getText ? window.getText('template-name-placeholder') : 'Lütfen şablon adını girin', 'error');
        return false;
    }
    if (!subject) {
        logToSystem('Template subject empty - validation failed', 'warning');
        showNotification(window.getText ? window.getText('template-subject-placeholder') : 'Lütfen şablon konusunu girin', 'error');
        return false;
    }
    if (!content || content.length < 3) {
        logToSystem('Template content empty or too short - validation failed', 'warning', {
            contentLength: content.length
        });
        showNotification(window.getText ? window.getText('template-content-missing') : 'Please enter template content (minimum 3 characters)', 'error');
        return false;
    }
    
    logToSystem('Template form validation successful', 'success');
    const isHTML = true; // HTML only mode
    const finalContent = getEditorHtml('template');
    return { 
        name, 
        subject,
        language,
        content: finalContent,
        is_html: isHTML
    };
}

export async function saveTemplate() {
    logToSystem('Template save operation started', 'info');
    
    const validated = await validateTemplateForm();
    if (!validated) {
        logToSystem('Template save cancelled - form validation failed', 'warning');
        return;
    }

    const { name, subject, language, content, is_html } = validated;

    // 1. İsim çakışmasını kontrol et
    const nameExists = state.templates.some(t => t.name === name && t.name !== state.currentTemplate);
    if (nameExists) {
        logToSystem(`Template save cancelled - name conflict: ${name}`, 'warning');
        showNotification(window.getText ? window.getText('template-name-exists') : 'A template with this name already exists. Please choose a different name.', 'error');
        return;
    }

    try {
        // Backend'e kaydet
        const template = { name, subject, language, content, is_html };
        const result = await window.go.main.App.SaveTemplate(template);
        console.log('Save result:', result);
        
        // Backend event'i bekleyerek state'i güncellemek yerine, sadece formu kapat
        // State güncellemesi handleTemplatesLoaded event'inde yapılacak
        
        if (state.currentTemplate) {
            logToSystem(`Template updated: ${state.currentTemplate} -> ${name}`, 'success', {
                oldName: state.currentTemplate,
                newName: name,
                subject: subject,
                isHTML: is_html,
                contentLength: typeof content === 'string' ? content.length : 0
            });
            showNotification(window.getText ? window.getText('template-updated') : 'Template successfully updated', 'success');
        } else {
            logToSystem(`New template added: ${name}`, 'success', {
                templateName: name,
                subject: subject,
                isHTML: is_html,
                contentLength: typeof content === 'string' ? content.length : 0
            });
            showNotification(window.getText ? window.getText('template-added') : 'Template successfully added', 'success');
        }

        // Formu kapat - state güncellemesi backend event'inde yapılacak
        hideTemplateForm();
        
    } catch (error) {
        console.error('Template save error:', error);
        showNotification((window.getText ? window.getText('error-saving-template').replace('{error}', error) : 'Error occurred while saving template: ' + error), 'error');
    }
}


export async function deleteTemplate() {
    console.log('deleteTemplate called, currentTemplate:', state.currentTemplate);
    
    if (!state.currentTemplate) {
        console.log('No current template');
        showNotification(window.getText ? window.getText('no-template-selected') : 'No template selected for deletion', 'error');
        return;
    }
    
    // Modal'ı göster
    const modal = document.getElementById('template-delete-modal');
    const message = document.getElementById('template-delete-message');
            message.textContent = `"${state.currentTemplate}" ${window.getText('template-delete-message')}`;
    modal.classList.remove('hidden');
}

export async function confirmTemplateDelete(confirmed) {
    const modal = document.getElementById('template-delete-modal');
    modal.classList.add('hidden');
    
    if (!confirmed) {
        console.log('User cancelled template deletion');
        return;
    }
    
    console.log('Deleting template:', state.currentTemplate);
    
    try {
        // Backend'e silme isteği gönder
        const result = await window.go.main.App.DeleteTemplate(state.currentTemplate);
        console.log('Delete result:', result);
        
        // State güncellemesi backend event'inde yapılacak
        // Sadece formu kapat
        hideTemplateForm();
        
        showNotification(result, 'success');
        logToSystem(`Template deleted: ${state.currentTemplate}`, 'success');
    } catch (error) {
        console.error('Template delete error:', error);
        showNotification((window.getText ? window.getText('error-deleting-template').replace('{error}', error) : 'Error occurred while deleting template: ' + error), 'error');
    }
}

export async function updateTemplatePreview() {
    const subject = document.getElementById('template-subject').value;
    
    // Get theme from editor wrapper instead of radio buttons
    const editorWrapper = document.getElementById('template-editor-wrapper');
    const isDarkTheme = editorWrapper && editorWrapper.classList.contains('dark-theme');
    
    // Preview container'ın tema sınıfını güncelle (fullscreen durumunu koru)
    const previewContainer = document.getElementById('template-preview');
    if (previewContainer) {
        const isFullscreen = previewContainer.classList.contains('fullscreen');
        previewContainer.className = `preview-container fullscreen-preview ${isDarkTheme ? 'dark-theme' : 'light-theme'}`;
        if (isFullscreen) {
            previewContainer.classList.add('fullscreen');
        }
    }
    
    // İçeriği editörden al (HTML only)
    const htmlContent = getEditorHtml('template') || '';
    const subjectLabel = window.getText ? window.getText('preview-subject') : 'Konu:';

    // Apply theme to HTML content exactly like backend does
    const themedContent = applyThemeToHTMLPreview(htmlContent, isDarkTheme);

    // Create email preview container
    const bgColor = isDarkTheme ? '#2c3e50' : '#f5f5f5';
    const containerBg = isDarkTheme ? '#2c3e50' : '#ffffff';
    const textColor = isDarkTheme ? '#ecf0f1' : '#2c3e50';
    const borderColor = isDarkTheme ? '#34495e' : '#e0e0e0';

    document.getElementById('template-preview').innerHTML = `
        <div style="border-bottom:2px solid #ddd; padding-bottom:10px; margin-bottom:15px;">
            <strong>${subjectLabel}</strong> ${subject}
        </div>
        <div style="background-color: ${bgColor}; padding: 20px; border-radius: 8px;">
            ${themedContent}
        </div>
    `;

    logToSystem('Template preview updated', 'info');
}

// Auto-update bindings for template preview
export function setupTemplatePreviewAutoUpdate() {
    const subjectEl = document.getElementById('template-subject');
    const handler = () => updateTemplatePreview();
    if (subjectEl) subjectEl.addEventListener('input', handler);
    // Theme changes are now handled through editor wrapper class changes
}

// Expose for cross-module usage
if (typeof window !== 'undefined') {
    window.updateTemplatePreview = updateTemplatePreview;
    window.setupTemplatePreviewAutoUpdate = setupTemplatePreviewAutoUpdate;
}