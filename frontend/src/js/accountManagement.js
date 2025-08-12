import { escapeHtml } from './utils.js';
import { showNotification } from './utils.js';
import { state } from './state.js';
import { updateSendAccountCombo } from './sendManagement.js';


export function updateAccountsTable() {
    const tbody = document.querySelector('#accounts-table tbody');
    tbody.innerHTML = '';
    state.accounts.forEach(acc => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${escapeHtml(acc.name)}</td>
            <td>${escapeHtml(acc.email)}</td>
            <td>${escapeHtml(acc.smtp_server)}</td>
            <td>${acc.smtp_port}</td>
            <td><button class="btn-small" onclick="editAccount('${escapeHtml(acc.email)}')">${window.getText ? window.getText('edit-account-btn') : '✏️ Düzenle'}</button></td>
        `;
        tbody.appendChild(tr);
    });
    
    // Devam butonunun durumunu güncelle
    updateContinueButton();
}

// Devam butonunun durumunu güncelle
function updateContinueButton() {
    const continueBtn = document.getElementById('continue-accounts-btn');
    if (continueBtn) {
        // Hesap varsa butonu aktif et
        continueBtn.disabled = state.accounts.length === 0;
    }
}

export function updateProvider() {
    const provider = document.getElementById('provider').value;
    const smtpServer = document.getElementById('account-smtp-server');
    const smtpPort = document.getElementById('account-smtp-port');
    const tls = document.getElementById('account-tls');
    
    const providers = {
        'Gmail': { server: 'smtp.gmail.com', port: '587', tls: true },
        'Yandex': { server: 'smtp.yandex.com', port: '587', tls: true },
        'Yahoo': { server: 'smtp.mail.yahoo.com', port: '587', tls: true },
        'Özel': { server: '', port: '', tls: false }
    };
    
    const config = providers[provider];
    if (config) {
        smtpServer.value = config.server;
        smtpPort.value = config.port;
        tls.checked = config.tls;
    }
}

export function showAccountForm() {
    resetAccountForm();
    document.getElementById('account-form').classList.remove('hidden');
    document.getElementById('delete-account-btn').style.display = 'none';
}

export function hideAccountForm() {
    document.getElementById('account-form').classList.add('hidden');
    resetAccountForm();
}

export function resetAccountForm() {
    document.getElementById('provider').value = '';
    document.getElementById('account-name').value = '';
    document.getElementById('account-email').value = '';
    document.getElementById('account-password').value = '';
    document.getElementById('account-smtp-server').value = '';
    document.getElementById('account-smtp-port').value = '';
    document.getElementById('account-tls').checked = true;
    state.selectedAccount = null;
}

export function editAccount(email) {
    console.log('editAccount called with email:', email);
    const account = state.accounts.find(acc => acc.email === email);
    if (account) {
        console.log('Account found:', account);
        document.getElementById('account-form').classList.remove('hidden');
        document.getElementById('account-name').value = account.name;
        document.getElementById('account-email').value = account.email;
        document.getElementById('account-password').value = account.password;
        document.getElementById('account-smtp-server').value = account.smtp_server;
        document.getElementById('account-smtp-port').value = account.smtp_port;
        document.getElementById('account-tls').checked = account.use_tls;
        document.getElementById('delete-account-btn').style.display = 'inline-block';
        // Store the account name for deletion, not the email
        state.selectedAccount = account.name;
        console.log('selectedAccount set to:', state.selectedAccount);
    } else {
        console.log('Account not found for email:', email);
    }
}

export function validateAccountForm() {
    const name = document.getElementById('account-name').value.trim();
    const email = document.getElementById('account-email').value.trim();
    const password = document.getElementById('account-password').value.trim();
    const server = document.getElementById('account-smtp-server').value.trim();
    const port = document.getElementById('account-smtp-port').value.trim();
    
    if (!name || !email || !password || !server || !port) {
        showNotification(window.getText ? window.getText('fill-all-fields') : 'Please fill in all fields', 'error');
        return false;
    }
    
    // Check for duplicate account name (only if not editing the same account)
    const existingAccount = state.accounts.find(acc => acc.name === name);
    if (existingAccount && state.selectedAccount !== name) {
        showNotification(window.getText ? window.getText('duplicate-account-name') : 'An account with this name already exists. Please use a different name.', 'error');
        return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showNotification(window.getText ? window.getText('enter-valid-email') : 'Please enter a valid email address', 'error');
        return false;
    }
    
    const portNum = parseInt(port);
    if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
        showNotification(window.getText ? window.getText('enter-valid-port') : 'Please enter a valid port number (1-65535)', 'error');
        return false;
    }
    
    return true;
}

export function saveAccount() {
    if (!validateAccountForm()) return;
    
    const account = {
        name: document.getElementById('account-name').value.trim(),
        email: document.getElementById('account-email').value.trim(),
        password: document.getElementById('account-password').value.trim(),
        smtp_server: document.getElementById('account-smtp-server').value.trim(),
        smtp_port: parseInt(document.getElementById('account-smtp-port').value.trim(), 10),
        use_tls: document.getElementById('account-tls').checked,
    };
    
    window.go.main.App.SaveAccount(account)
        .then(result => {
            showNotification(result, 'success');
            // State güncellemesi backend event'inde yapılacak
            // Sadece formu kapat
            hideAccountForm();
            // Devam butonunu güncelle
            updateContinueButton();
        })
        .catch(error => {
            console.error('Account save error:', error);
            showNotification((window.getText ? window.getText('account-save-error').replace('{error}', error) : 'Error while saving account: ' + error), 'error');
        });
}

export function deleteAccount() {
    console.log('deleteAccount called, selectedAccount:', state.selectedAccount);
    
    if (!state.selectedAccount) {
        console.log('No selected account');
        showNotification(window.getText ? window.getText('no-account-selected') : 'No account selected for deletion', 'error');
        return;
    }
    
    // Get the account details for display
    const account = state.accounts.find(acc => acc.name === state.selectedAccount);
    const displayText = account ? `${account.name} (${account.email})` : state.selectedAccount;
    
    // Modal'ı göster
    const modal = document.getElementById('account-delete-modal');
    const message = document.getElementById('account-delete-message');
    message.textContent = `"${displayText}" ${window.getText ? window.getText('account-delete-message') : 'hesabını silmek istediğinizden emin misiniz?'}`;
    modal.classList.remove('hidden');
}

export function confirmAccountDelete(confirmed) {
    const modal = document.getElementById('account-delete-modal');
    modal.classList.add('hidden');
    
    if (!confirmed) {
        console.log('User cancelled deletion');
        return;
    }
    
    console.log('Deleting account:', state.selectedAccount);
    console.log('Backend call starting...');
    
    window.go.main.App.DeleteAccount(state.selectedAccount)
        .then(result => {
            console.log('Delete result:', result);
            showNotification(result, 'success');
            // State güncellemesi backend event'inde yapılacak
            // Sadece formu kapat
            hideAccountForm();
            // Devam butonunu güncelle
            updateContinueButton();
        })
        .catch(error => {
            console.error('Account delete error:', error);
            showNotification((window.getText ? window.getText('account-delete-error').replace('{error}', error) : 'Error while deleting account: ' + error), 'error');
        });
}