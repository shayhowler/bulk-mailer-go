// Confirmation Dialog Module

export function showConfirmation(message, callback) {
    const modal = document.getElementById('confirmation-modal');
    const messageEl = document.getElementById('confirmation-message');
    
    if (!modal || !messageEl) {
        // Fallback to browser confirm
        const result = confirm(message);
        if (callback) callback(result);
        return;
    }
    
    messageEl.innerHTML = message;
    modal.classList.remove('hidden');
    
    // Store callback globally for the onclick handlers
    window.pendingConfirmationCallback = callback;
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

// Global functions for onclick handlers
window.showConfirmation = showConfirmation;
window.confirmAction = confirmAction;
