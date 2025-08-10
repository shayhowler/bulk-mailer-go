// Notification System Module

let notificationCount = 0;

export function showNotification(message, type = 'info', options = {}) {
    const {
        duration = 3000,
        showProgress = true,
        position = 'top-right'
    } = options;
    
    notificationCount++;
    const id = `notification-${notificationCount}`;
    
    const container = getNotificationContainer(position);
    
    const notification = document.createElement('div');
    notification.id = id;
    notification.className = `notification notification-${type} notification-enter`;
    
    const icon = getNotificationIcon(type);
    
    let progressBar = '';
    if (showProgress && duration > 0) {
        progressBar = `<div class="notification-progress">
            <div class="notification-progress-bar" style="animation-duration: ${duration}ms;"></div>
        </div>`;
    }
    
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${icon}</span>
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="closeNotification('${id}')">×</button>
        </div>
        ${progressBar}
    `;
    
    container.appendChild(notification);
    
    // Remove entrance animation class after animation completes
    setTimeout(() => {
        notification.classList.remove('notification-enter');
    }, 300);
    
    // Auto-remove notification after duration
    if (duration > 0) {
        setTimeout(() => {
            removeNotification(id);
        }, duration);
    }
    
    return id;
}

function getNotificationContainer(position) {
    let container = document.getElementById('notification-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notification-container';
        container.className = `notification-container notification-${position}`;
        document.body.appendChild(container);
    }
    return container;
}

function getNotificationIcon(type) {
    const icons = {
        'success': '✓',
        'error': '✗',
        'warning': '⚠',
        'info': 'ℹ'
    };
    return icons[type] || icons['info'];
}

function removeNotification(id) {
    const notification = document.getElementById(id);
    if (notification) {
        notification.classList.add('notification-exit');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }
}

// Global function for onclick handlers
window.closeNotification = function(id) {
    removeNotification(id);
};

// Export showNotification as global for backward compatibility
window.showNotification = showNotification;
