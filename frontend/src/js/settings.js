import { state } from './state.js';
import { logToSystem, showNotification } from './utils.js';
import { COUNTRIES, TIMEZONES_BY_COUNTRY, ALL_TIMEZONES } from '../data/timezones.js';
import { changeLanguage, LANG_OPTIONS, getLanguageOptionsForCurrentLang } from './languageManager.js';

function populateCountryDropdown() {
  const countrySel = document.getElementById('settings-country');
  if (!countrySel) return;
  countrySel.innerHTML = '';
  const optEmpty = document.createElement('option');
  optEmpty.value = '';
  optEmpty.textContent = '—';
  countrySel.appendChild(optEmpty);
  COUNTRIES.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.code;
    opt.textContent = c.name;
    countrySel.appendChild(opt);
  });
}

function populateTimezoneDropdown(countryCode = '') {
  const tzSel = document.getElementById('settings-timezone');
  if (!tzSel) return;
  tzSel.innerHTML = '';
  const optEmpty = document.createElement('option');
  optEmpty.value = '';
  optEmpty.textContent = 'UTC';
  tzSel.appendChild(optEmpty);
  let tzList = ALL_TIMEZONES;
  if (countryCode && TIMEZONES_BY_COUNTRY[countryCode]) {
    tzList = TIMEZONES_BY_COUNTRY[countryCode];
  }
  tzList.forEach(tz => {
    const opt = document.createElement('option');
    opt.value = tz;
    opt.textContent = tz;
    tzSel.appendChild(opt);
  });
}

function wireDropdownInteractions() {
  const countrySel = document.getElementById('settings-country');
  if (!countrySel) return;
  countrySel.onchange = () => {
    populateTimezoneDropdown(countrySel.value);
  };
}

export function populateLanguageDropdown() {
  const langSel = document.getElementById('settings-default-language');
  if (!langSel) return;
  langSel.innerHTML = '';
  
  const optEmpty = document.createElement('option');
  optEmpty.value = '';
  optEmpty.textContent = '—';
  langSel.appendChild(optEmpty);

  const langOptions = getLanguageOptionsForCurrentLang();
  const opt1 = document.createElement('option');
  opt1.value = 'tr';
  opt1.textContent = langOptions.tr;
  langSel.appendChild(opt1);
  
  const opt2 = document.createElement('option');
  opt2.value = 'en';
  opt2.textContent = langOptions.en;
  langSel.appendChild(opt2);
}

export async function loadSettings() {
  if (!(window.go && window.go.main && window.go.main.App && window.go.main.App.GetSettings)) return;
  try {
    const s = await window.go.main.App.GetSettings();
    state.settings = Object.assign({ country: '', timezone: '', dateFormat: '24h', defaultLanguage: 'en' }, s || {});
    // Always apply backend default language on startup (override any previous local setting)
    if (state.settings.defaultLanguage) {
      changeLanguage(state.settings.defaultLanguage);
      const langSelect = document.getElementById('language-select');
      if (langSelect) langSelect.value = state.settings.defaultLanguage;
    }
    // Populate dropdowns then apply
    populateCountryDropdown();
    populateTimezoneDropdown(state.settings.country);
    populateLanguageDropdown();
    applySettingsToUI();
    wireDropdownInteractions();
    logToSystem('Settings loaded', 'info');
  } catch (e) {
    showNotification('Failed to load settings: ' + e, 'error');
  }
}

export function applySettingsToUI() {
  const c = document.getElementById('settings-country');
  const tz = document.getElementById('settings-timezone');
  const df = document.getElementById('settings-dateformat');
  const dl = document.getElementById('settings-default-language');
  if (c) c.value = state.settings.country || '';
  if (tz) tz.value = state.settings.timezone || '';
  if (df) df.value = state.settings.dateFormat || '24h';
  if (dl) dl.value = state.settings.defaultLanguage || 'en';
}

export async function saveSettings() {
  const c = document.getElementById('settings-country')?.value || '';
  const tz = document.getElementById('settings-timezone')?.value || '';
  const df = document.getElementById('settings-dateformat')?.value || '24h';
  const dl = document.getElementById('settings-default-language')?.value || (state.settings.defaultLanguage || 'en');
  const payload = { 
    country: c, 
    timezone: tz, 
    dateFormat: df,  // Use camelCase to match backend
    defaultLanguage: dl  // Use camelCase to match backend
  };
  try {
    await window.go.main.App.SaveSettings(payload);
    state.settings = payload;
    showNotification('Settings saved', 'success');
    logToSystem('Settings saved successfully', 'success', payload);
  } catch (e) {
    showNotification('Failed to save settings: ' + e, 'error');
    logToSystem('Settings save failed: ' + e, 'error');
  }
}

export function reloadSettings() {
  loadSettings();
}

// Utility for frontend timestamp formatting based on settings
export function formatTime(date = new Date()) {
  const opts = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: state.settings.dateFormat === '12h' };
  if (state.settings.timezone) opts.timeZone = state.settings.timezone;
  try { return date.toLocaleTimeString('en-US', opts); } catch { return date.toLocaleTimeString('en-US'); }
}
