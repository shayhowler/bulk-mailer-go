// tinymceSetup.js
// Full TinyMCE integration for template and send editors.
// Exposes initTemplateEditor, initSendEditor, reinitEditorsForLanguage
// and helpers: getEditorHtml, getEditorText, setEditorHtml

import { logToSystem, showNotification } from './utils.js';

const editors = { template: null, send: null };
let globalTheme = 'dark'; // Single global theme for all editors - default to dark

function ensureTiny() {
  return new Promise((resolve, reject) => {
    if (window.tinymce) return resolve(window.tinymce);
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/tinymce/8.0.1/tinymce.min.js';
    s.onload = () => resolve(window.tinymce);
    s.onerror = () => reject(new Error('Failed to load TinyMCE from CDN'));
    document.head.appendChild(s);
  });
}

function baseConfig(id, theme, type) {
  const langSel = document.getElementById('language-select');
  const demoLang = (langSel && langSel.value === 'tr') ? 'tr' : 'en';
  
  return {
    selector: `#${id}`,
    license_key: 'gpl',
    promotion: false,
    branding: true,
    plugins: 'preview importcss searchreplace autolink autosave save directionality code visualblocks visualchars fullscreen image link media codesample table charmap pagebreak nonbreaking anchor insertdatetime advlist lists wordcount help charmap quickbars emoticons accordion',
    menubar: 'file edit view insert format tools table help',
    toolbar: 'undo redo | accordion accordionremove | blocks fontfamily fontsize | bold italic underline strikethrough | align numlist bullist | link image | table media | lineheight outdent indent | forecolor backcolor removeformat | charmap emoticons | code fullscreen preview | save print | pagebreak anchor codesample | ltr rtl',
    autosave_ask_before_unload: true,
    autosave_interval: '30s',
    autosave_prefix: '{path}{query}-{id}-',
    autosave_restore_when_empty: false,
    autosave_retention: '2m',
    image_advtab: true,
    importcss_append: true,
    height: 600,
    image_caption: true,
    quickbars_selection_toolbar: 'bold italic | quicklink h2 h3 blockquote quickimage quicktable',
    noneditable_class: 'mceNonEditable',
    toolbar_mode: 'sliding',
    contextmenu: 'link image table',
    // Use TinyMCE's built-in theme system
    skin: theme === 'dark' ? 'oxide-dark' : 'oxide',
    content_css: theme === 'dark' ? 'dark' : 'default',
    base_url: 'https://cdnjs.cloudflare.com/ajax/libs/tinymce/8.0.1',
    suffix: '.min',
    // Try to use language pack if present; otherwise TinyMCE falls back to English
    language: demoLang === 'tr' ? 'tr' : 'en',
    language_url: demoLang === 'tr' ? 'https://cdn.tiny.cloud/1/no-api-key/tinymce/8/langs/tr.js' : undefined,
    file_picker_callback: (callback, value, meta) => {
      if (meta.filetype === 'file') callback('https://www.google.com/logos/google.jpg', { text: 'My text' });
      if (meta.filetype === 'image') callback('https://www.google.com/logos/google.jpg', { alt: 'My alt text' });
      if (meta.filetype === 'media') callback('movie.mp4', { source2: 'alt.ogg', poster: 'https://www.google.com/logos/google.jpg' });
    },
    setup: (editor) => {
      editor.on('init', () => {
        logToSystem(`TinyMCE editor ready (${theme} theme)`, 'success');
      });
    }
  };
}

function holderId(type) { return type === 'template' ? 'template-editor' : 'send-editor'; }
function wrapperId(type) { return type === 'template' ? 'template-editor-wrapper' : 'send-editor-wrapper'; }

function getCurrentTheme() {
  return globalTheme;
}

function setCurrentTheme(theme) {
  globalTheme = theme;
}

async function initEditor(type, content = {}) {
  const wrapper = document.getElementById(wrapperId(type));
  const holder = document.getElementById(holderId(type));
  if (!wrapper || !holder) {
    showNotification('Editor holder not found', 'error');
    return null;
  }
  
  // Set initial theme based on global state
  const initialTheme = getCurrentTheme();
  wrapper.classList.remove('light-theme', 'dark-theme');
  wrapper.classList.add(`${initialTheme}-theme`);

  const tiny = await ensureTiny();

  // Create an inner textarea if not exists
  if (holder.tagName.toLowerCase() !== 'textarea') {
    const ta = document.createElement('textarea');
    ta.id = holder.id;
    holder.replaceWith(ta);
  }

  // Remove existing instance if any
  const prev = tiny.get(holderId(type));
  if (prev) await prev.remove();

  const theme = initialTheme;
  const cfg = baseConfig(holderId(type), theme, type);
  await tiny.init(cfg);

  const inst = tiny.get(holderId(type));
  const html = (content && typeof content.html === 'string') ? content.html : '';
  if (inst) inst.setContent(html);

  // Expose a simple presence flag for legacy checks
  if (type === 'template') {
    window.templateEditor = inst || true;
  } else if (type === 'send') {
    window.sendEditor = inst || true;
  }

  // Live preview hooks
  if (inst) {
    const updateFns = [];
    if (type === 'send' && typeof window.updateSendPreview === 'function') updateFns.push(window.updateSendPreview);
    if (type === 'template' && typeof window.updateTemplatePreview === 'function') updateFns.push(window.updateTemplatePreview);
    const trigger = () => {
      updateFns.forEach(fn => {
        try { fn(); } catch (e) { /* no-op */ }
      });
    };
    inst.on('change input keyup SetContent undo redo', trigger);
  }

  editors[type] = inst;
  setupThemeButton(wrapper, type);
  return inst;
}

async function hardReinit(type, html) {
  const tiny = await ensureTiny();
  const id = holderId(type);
  const inst = tiny.get(id);
  if (inst) await inst.remove();
  // Ensure a fresh textarea exists
  const oldEl = document.getElementById(id);
  if (!oldEl || oldEl.tagName.toLowerCase() !== 'textarea') {
    const ta = document.createElement('textarea');
    ta.id = id;
    if (oldEl) oldEl.replaceWith(ta); else {
      const wrapper = document.getElementById(wrapperId(type));
      if (wrapper) wrapper.appendChild(ta);
    }
  }
  const theme = getCurrentTheme();
  await tiny.init(baseConfig(id, theme, type));
  const newInst = tiny.get(id);
  if (newInst) {
    newInst.setContent(html || '');
    
    // Re-attach live preview hooks
    const updateFns = [];
    if (type === 'send' && typeof window.updateSendPreview === 'function') updateFns.push(window.updateSendPreview);
    if (type === 'template' && typeof window.updateTemplatePreview === 'function') updateFns.push(window.updateTemplatePreview);
    const trigger = () => {
      updateFns.forEach(fn => {
        try { fn(); } catch (e) { /* no-op */ }
      });
    };
    newInst.on('change input keyup SetContent undo redo', trigger);
  }
  editors[type] = newInst;
}

function setupThemeButton(wrapper, type) {
  let btn = wrapper.querySelector('.theme-toggle');
  if (!btn) {
    btn = document.createElement('button');
    btn.className = 'theme-toggle';
    wrapper.appendChild(btn);
  }
  if (btn.getAttribute('data-bound') === 'true') return;
  btn.setAttribute('data-bound','true');
  const t = (k, f) => (window.getText ? window.getText(k) : f);
  const update = () => { 
    btn.textContent = getCurrentTheme() === 'dark' ? '☀️ Light' : '🌙 Dark';
  };
  update();
  btn.onclick = async () => {
    const currentTheme = getCurrentTheme();
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    // Update global theme
    setCurrentTheme(newTheme);
    
    // Update all editor wrappers
    const allWrappers = document.querySelectorAll('.editor-wrapper');
    allWrappers.forEach(w => {
      w.classList.remove('dark-theme', 'light-theme');
      w.classList.add(`${newTheme}-theme`);
    });
    
    // Update all theme toggle buttons
    document.querySelectorAll('.theme-toggle').forEach(btn => {
      btn.textContent = newTheme === 'dark' ? '☀️ Light' : '🌙 Dark';
    });
    
    // Update all previews
    if (typeof window.updateTemplatePreview === 'function') {
      window.updateTemplatePreview();
    }
    if (typeof window.updateSendPreview === 'function') {
      window.updateSendPreview();
    }
    
    // Reinitialize all active editors with new theme
    const templateHtml = getEditorHtml('template');
    const sendHtml = getEditorHtml('send');
    
    if (document.getElementById(holderId('template'))) {
      await hardReinit('template', templateHtml);
    }
    if (document.getElementById(holderId('send'))) {
      await hardReinit('send', sendHtml);
    }
    
    logToSystem(`Global editor theme changed to ${newTheme}`, 'info');
  };
}

export async function initTemplateEditor(content = {}) { return initEditor('template', content); }
export async function initSendEditor(content = {}) { return initEditor('send', content); }

export async function reinitEditorsForLanguage() {
  const tplHtml = getEditorHtml('template');
  const sndHtml = getEditorHtml('send');
  if (document.getElementById(holderId('template'))) await hardReinit('template', tplHtml);
  if (document.getElementById(holderId('send'))) await hardReinit('send', sndHtml);
}

export function getEditorHtml(type) {
  const inst = editors[type];
  return inst ? inst.getContent() : '';
}
export function getEditorText(type) {
  const inst = editors[type];
  return inst ? inst.getContent({ format: 'text' }) : '';
}
export function setEditorHtml(type, html) {
  const inst = editors[type];
  if (inst) inst.setContent(html || '');
}

