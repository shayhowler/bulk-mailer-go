import {
    logToSystem,
    showNotification,
    escapeHtml
} from './utils.js';
import { state } from './state.js';

export function onSourceTypeChange() {
    const sourceType = document.getElementById('source-type').value;
    const sourceFile = document.getElementById('source-file');
    const tableSelection = document.getElementById('table-selection');
    const emailSelection = document.getElementById('email-column-selection');
    const backBtn = document.getElementById('back-contacts-btn');
    
    // Reset selected rows when changing source type
    state.selectedRows = [];
    
    if (sourceType) {
        sourceFile.classList.remove('hidden');
        tableSelection.classList.add('hidden');
        emailSelection.classList.add('hidden');
        backBtn.classList.add('hidden');
    } else {
        sourceFile.classList.add('hidden');
        tableSelection.classList.add('hidden');
        emailSelection.classList.add('hidden');
        backBtn.classList.add('hidden');
    }
    
    document.getElementById('source-input').value = '';
            document.getElementById('table-combo').innerHTML = '<option value="" id="select-table-option">Tablo Seç</option>';
    document.getElementById('email-col-combo').innerHTML = '<option value="" data-i18n="contacts.selectEmailColumn">E-posta Sütunu Seç</option>';
    document.getElementById('contacts-tabs').classList.add('hidden');
}

export function selectSourceFile() {
    const sourceType = document.getElementById('source-type').value;
    if (!sourceType) {
        showNotification(window.getText ? window.getText('select-source-type-first') : 'Please select a data source type first', 'warning');
        return;
    }
    
    // Reset selected rows when selecting a new file
    state.selectedRows = [];
    
    logToSystem(`File selection started for ${sourceType} data source`, 'info');
    
    window.go.main.App.SelectSourceFile(sourceType)
        .then(file => {
            if (file !== 'Dosya seçimi iptal edildi') {
                document.getElementById('source-input').value = file;
                logToSystem(`Data source file selected: ${file}`, 'success', { sourceType, fileName: file });
                loadTablesOrFields(sourceType);
            } else {
                logToSystem('File selection cancelled', 'warning');
            }
        })
        .catch(error => {
            console.error('File selection error:', error);
            logToSystem(`Error in file selection: ${error}`, 'error', { sourceType });
            showNotification((window.getText ? window.getText('error-file-selection').replace('{error}', error) : 'Error occurred in file selection: ' + error), 'error');
        });
}

export function loadTablesOrFields(sourceType) {
    const tableCombo = document.getElementById('table-combo');
    const emailCombo = document.getElementById('email-col-combo');

    const tableText = window.getText ? window.getText('select-table-option') : 'Tablo Seç';
    const emailText = window.getText ? window.getText('select-email-column-option') : 'E-posta Sütunu Seç';
    tableCombo.innerHTML = `<option value="" id="select-table-option">${tableText}</option>`;
    emailCombo.innerHTML = `<option value="" id="select-email-column-option">${emailText}</option>`;
    document.getElementById('email-column-selection').classList.add('hidden');
    emailCombo.disabled = true;

    if (sourceType === 'SQLite') {
        window.go.main.App.LoadTablesOrFields('SQLite', "")
            .then(tables => {
                if (tables && tables.length > 0) {
                    tables.forEach(table => {
                        const option = document.createElement('option');
                        option.value = table;
                        option.text = table;
                        tableCombo.appendChild(option);
                    });
                    document.getElementById('table-selection').classList.remove('hidden');
                    document.getElementById('back-contacts-btn').classList.remove('hidden');
                }
            }).catch(error => {
                console.error('Load tables/fields error:', error);
                showNotification((window.getText ? window.getText('error-loading-data').replace('{error}', error) : 'Error occurred while loading data: ' + error), 'error');
            });

        tableCombo.onchange = function () {
            let selectedTable = this.value;
            emailCombo.innerHTML = '<option value="" id="select-email-column-option">' + (window.getText ? window.getText('select-email-column-option') : 'E-posta Sütunu Seç') + '</option>';
            if (selectedTable) {
                window.go.main.App.LoadTablesOrFields('SQLite', selectedTable)
                    .then(columns => {
                        if (columns && columns.length > 0) {
                            columns.forEach(col => {
                                const option = document.createElement('option');
                                option.value = col;
                                option.text = col;
                                emailCombo.appendChild(option);
                            });
                            document.getElementById('email-column-selection').classList.remove('hidden');
                            emailCombo.disabled = false;
                        }
                    }).catch(error => {
                        console.error('Load tables/fields error:', error);
                        showNotification((window.getText ? window.getText('error-loading-data').replace('{error}', error) : 'Error occurred while loading data: ' + error), 'error');
                    });
            } else {
                document.getElementById('email-column-selection').classList.add('hidden');
                emailCombo.disabled = true;
            }
        };
    } else if (sourceType === 'Excel') {
        // For Excel, first get sheet names
        window.go.main.App.LoadTablesOrFields('Excel', "")
            .then(sheets => {
                if (sheets && sheets.length > 0) {
                    sheets.forEach(sheet => {
                        const option = document.createElement('option');
                        option.value = sheet;
                        option.text = sheet;
                        tableCombo.appendChild(option);
                    });
                    document.getElementById('table-selection').classList.remove('hidden');
                    document.getElementById('back-contacts-btn').classList.remove('hidden');
                    
                    // Set up sheet selection handler
                    tableCombo.onchange = function () {
                        let selectedSheet = this.value;
                        emailCombo.innerHTML = '<option value="" id="select-email-column-option">' + (window.getText ? window.getText('select-email-column-option') : 'E-posta Sütunu Seç') + '</option>';
                        if (selectedSheet) {
                            // Get fields from the selected sheet
                            window.go.main.App.LoadTablesOrFields('Excel', selectedSheet)
                                .then(columns => {
                                    if (columns && columns.length > 0) {
                                        columns.forEach(col => {
                                            const option = document.createElement('option');
                                            option.value = col;
                                            option.text = col;
                                            emailCombo.appendChild(option);
                                        });
                                        document.getElementById('email-column-selection').classList.remove('hidden');
                                        emailCombo.disabled = false;
                                    }
                                }).catch(error => {
                                    console.error('Load Excel fields error:', error);
                                    showNotification((window.getText ? window.getText('error-loading-data').replace('{error}', error) : 'Error occurred while loading data: ' + error), 'error');
                                });
                        } else {
                            document.getElementById('email-column-selection').classList.add('hidden');
                            emailCombo.disabled = true;
                        }
                    };
                }
            }).catch(error => {
                console.error('Load Excel sheets error:', error);
                showNotification((window.getText ? window.getText('error-loading-data').replace('{error}', error) : 'Error occurred while loading data: ' + error), 'error');
            });
    } else if (sourceType === 'CSV') {
        // For CSV, directly get fields
        window.go.main.App.LoadTablesOrFields('CSV', "")
            .then(fields => {
                if (fields && fields.length > 0) {
                    fields.forEach(field => {
                        const option = document.createElement('option');
                        option.value = field;
                        option.text = field;
                        emailCombo.appendChild(option);
                    });
                    document.getElementById('email-column-selection').classList.remove('hidden');
                    emailCombo.disabled = false;
                }
                document.getElementById('back-contacts-btn').classList.remove('hidden');
            }).catch(error => {
                console.error('Load tables/fields error:', error);
                showNotification((window.getText ? window.getText('error-loading-data').replace('{error}', error) : 'Error occurred while loading data: ' + error), 'error');
            });
        document.getElementById('table-selection').classList.add('hidden');
    } else {
        document.getElementById('table-selection').classList.add('hidden');
        document.getElementById('email-column-selection').classList.add('hidden');
    }
}

export function onTableChange() {
    const sourceType = document.getElementById('source-type').value;
    const table = document.getElementById('table-combo').value;
    if (table && sourceType === 'SQLite') {
        window.go.main.App.LoadTablesOrFields("SQLite", table)
            .then(fields => {
                const emailCombo = document.getElementById('email-col-combo');
                emailCombo.innerHTML = '<option value="" id="select-email-column-option">' + (window.getText ? window.getText('select-email-column-option') : 'E-posta Sütunu Seç') + '</option>';
                fields.forEach(field => {
                    const option = document.createElement('option');
                    option.value = field;
                    option.text = field;
                    emailCombo.appendChild(option);
                });
                emailCombo.disabled = false;
                document.getElementById('email-column-selection').classList.remove('hidden');
            })
            .catch(error => {
                showNotification((window.getText ? window.getText('error-loading-columns').replace('{error}', error) : 'Error loading columns: ' + error), 'error');
            });
    }
}

export function onEmailColChange() {
    const table = document.getElementById('table-combo').value;
    const emailCol = document.getElementById('email-col-combo').value;
    const sourceType = document.getElementById('source-type').value;
    const filePath = document.getElementById('source-input').value;
    
    if (emailCol && filePath) {
        // For SQLite and Excel, pass the table/sheet name; for CSV, pass empty string
        const tableParam = (sourceType === 'SQLite' || sourceType === 'Excel') ? table : '';
        logToSystem(`Loading contact data - Source: ${sourceType}, Table/Sheet: ${tableParam || 'N/A'}, Email column: ${emailCol}`, 'info');
        
        // Reset selected rows in state when loading new contacts
        state.selectedRows = [];
        
        // LoadContacts expects: filePath, sourceType, tableName, emailColumn
        window.go.main.App.LoadContacts(filePath, sourceType, tableParam, emailCol)
            .then(data => {
                state.currentData = data;
                document.getElementById('contacts-tabs').classList.remove('hidden');
                updateContactsTables(data);
                updateContactCount();
                document.getElementById('continue-contacts-btn').disabled = data.valid.length === 0;
                
                const validCount = data.valid ? data.valid.length : 0;
                const invalidCount = data.invalid ? data.invalid.length : 0;
                logToSystem(`Contact data loaded - Valid: ${validCount}, Invalid: ${invalidCount}`, 'success', {
                    validContacts: validCount,
                    invalidContacts: invalidCount,
                    totalContacts: validCount + invalidCount,
                    sourceType,
                    table,
                    emailColumn: emailCol
                });
            })
            .catch(error => {
                console.error('Load contacts error:', error);
                logToSystem(`Error loading contacts: ${error}`, 'error', { sourceType, table, emailColumn: emailCol });
                showNotification((window.getText ? window.getText('error-loading-data').replace('{error}', error) : 'Error occurred while loading contacts: ' + error), 'error');
            });
    }
}

export function updateContactsTables(data) {
    if (!data) return;
    
    const validTable = document.querySelector('#valid-table tbody');
    const invalidTable = document.querySelector('#invalid-table tbody');
    const validThead = document.querySelector('#valid-table thead tr');
    const invalidThead = document.querySelector('#invalid-table thead tr');
    
    // Clear tables and reset select-all checkbox
    validTable.innerHTML = '';
    invalidTable.innerHTML = '';
    validThead.innerHTML = '<th><input type="checkbox" id="select-all" onclick="selectAll()"></th>';
    invalidThead.innerHTML = '<th></th>';
    
    // Ensure select-all is unchecked
    const selectAllCheckbox = document.getElementById('select-all');
    if (selectAllCheckbox) {
        selectAllCheckbox.checked = false;
    }
    
    if (data.fields) {
        data.fields.forEach(field => {
            validThead.innerHTML += `<th>${escapeHtml(field)}</th>`;
            invalidThead.innerHTML += `<th>${escapeHtml(field)}</th>`;
        });
    }
    
    if (data.valid) {
        data.valid.forEach((contact, i) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td><input type="checkbox" class="select-row" data-index="${i}" onclick="updateSelectedRows()"></td>`;
            
            data.fields.forEach(field => {
                const value = contact.data[field] || '';
                tr.innerHTML += `<td title="${escapeHtml(String(value))}">${escapeHtml(String(value).substring(0, 50))}${String(value).length > 50 ? '...' : ''}</td>`;
            });
            
            // Add click event to toggle checkbox when clicking on the row
            tr.addEventListener('click', (e) => {
                if (!e.target.classList.contains('select-row')) {
                    const checkbox = tr.querySelector('.select-row');
                    if (checkbox) {
                        checkbox.checked = !checkbox.checked;
                        updateSelectedRows();
                    }
                }
            });
            
            validTable.appendChild(tr);
        });
    }
    
    if (data.invalid) {
        data.invalid.forEach(contact => {
            const tr = document.createElement('tr');
            tr.innerHTML = '<td></td>';
            
            data.fields.forEach(field => {
                const value = contact.data[field] || '';
                tr.innerHTML += `<td title="${escapeHtml(String(value))}">${escapeHtml(String(value).substring(0, 50))}${String(value).length > 50 ? '...' : ''}</td>`;
            });
            
            invalidTable.appendChild(tr);
        });
    }
}

export function selectAll() {
    const selectAll = document.getElementById('select-all');
    const checkboxes = document.querySelectorAll('.select-row');
    
    checkboxes.forEach(cb => {
        cb.checked = selectAll.checked;
    });
    
    updateSelectedRows();
}

export function updateSelectedRows() {
    state.selectedRows = Array.from(document.querySelectorAll('.select-row:checked'))
        .map(cb => parseInt(cb.dataset.index));
    
    // Update select-all checkbox state
    const selectAllCheckbox = document.getElementById('select-all');
    const allCheckboxes = document.querySelectorAll('.select-row');
    selectAllCheckbox.checked = allCheckboxes.length > 0 && state.selectedRows.length === allCheckboxes.length;
    
    window.go.main.App.SetSelectedRows(state.selectedRows)
        .catch(console.error);
    
    document.getElementById('continue-contacts-btn').disabled = state.selectedRows.length === 0;
    updateContactCount();
    
    logToSystem(`${state.selectedRows.length} contacts selected`, 'info', { selectedRowCount: state.selectedRows.length });
}

export function updateContactCount() {
    const countElement = document.getElementById('contact-count');
    if (!countElement || !state.currentData) return;
    
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
}

export function filterContacts() {
    const search = document.getElementById('search').value;
    
    window.go.main.App.FilterContacts(search)
        .then(data => {
            updateContactsTables(data);
            state.selectedRows = [];
            updateSelectedRows();
        })
        .catch(error => {
            console.error('Filter contacts error:', error);
        });
}

export function resetSource() {
    document.getElementById('source-type').value = '';
    document.getElementById('source-file').classList.add('hidden');
    document.getElementById('table-selection').classList.add('hidden');
    document.getElementById('email-column-selection').classList.add('hidden');
            document.getElementById('back-contacts-btn').classList.add('hidden');
    document.getElementById('contacts-tabs').classList.add('hidden');
            document.getElementById('continue-contacts-btn').disabled = true;
    
    document.getElementById('source-input').value = '';
    document.getElementById('table-combo').innerHTML = '<option value="">Tablo Seç</option>';
    document.getElementById('email-col-combo').innerHTML = '<option value="" data-i18n="contacts.selectEmailColumn">E-posta Sütunu Seç</option>';
    document.getElementById('search').value = '';
    
    state.currentData = null;
    state.selectedRows = [];
}