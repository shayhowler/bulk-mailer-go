// Progress Modal Module for Email Sending

// Sending state
export const sendingState = {
    total: 0,
    success: 0,
    failed: 0,
    current: 0,
    startTime: null,
    isActive: false,
    isStopped: false,
    isPaused: false
};

// Open sending modal
export function openSendingModal(total) {
    const modal = document.getElementById('sending-progress-modal');
    if (!modal) return;
    
    // Reset state completely
    sendingState.total = total;
    sendingState.success = 0;
    sendingState.failed = 0;
    sendingState.current = 0;
    sendingState.startTime = Date.now();
    sendingState.isActive = true;
    sendingState.isStopped = false;
    sendingState.isPaused = false;
    
    // Clean up any existing dynamic buttons from previous sessions
    const existingResumeBtn = document.getElementById('sending-resume-btn');
    const existingCancelBtn = document.getElementById('sending-cancel-btn');
    if (existingResumeBtn) {
        existingResumeBtn.remove();
    }
    if (existingCancelBtn) {
        existingCancelBtn.remove();
    }
    
    // Reset stop button to visible state
    const stopBtn = document.getElementById('sending-stop-btn');
    if (stopBtn) {
        stopBtn.style.display = 'inline-block';
    }
    
    // Update language-specific texts
    const getText = window.getText || ((key) => key);
    document.getElementById('sending-modal-title').textContent = getText('sending-title');
    document.getElementById('sending-progress-label').textContent = getText('sending-progress');
    document.getElementById('sending-status-text').textContent = getText('sending-in-progress');
    document.getElementById('sending-close-btn').textContent = getText('sending-close-btn');
    document.getElementById('sending-stop-btn').textContent = getText('sending-stop-btn');
    
    // Update initial stats
    document.getElementById('sending-total').textContent = total;
    document.getElementById('sending-success').textContent = '0';
    document.getElementById('sending-failed').textContent = '0';
    document.getElementById('sending-pending').textContent = total;
    
    // Reset progress bar
    document.getElementById('sending-progress-bar').style.width = '0%';
    document.getElementById('sending-progress-percent').textContent = '0%';
    document.getElementById('sending-progress-text').textContent = '';
    
    // Clear log
    document.getElementById('sending-log-content').innerHTML = '';
    
    // Show modal
    modal.classList.remove('hidden');
    document.getElementById('sending-close-btn').disabled = true;
    
    // Start time tracking
    updateSendingTime();
}

// Update sending progress
export function updateSendingProgress(emailIndex, email, status, message) {
    if (!sendingState.isActive) return;
    
    const getText = window.getText || ((key) => key);
    
    if (status === 'success') {
        sendingState.success++;
    } else if (status === 'failed') {
        sendingState.failed++;
    }
    sendingState.current = emailIndex + 1;
    
    // Update stats
    document.getElementById('sending-success').textContent = sendingState.success;
    document.getElementById('sending-failed').textContent = sendingState.failed;
    const pending = sendingState.total - sendingState.current;
    document.getElementById('sending-pending').textContent = Math.max(0, pending);
    
    // Update progress bar
    const percent = Math.round((sendingState.current / sendingState.total) * 100);
    document.getElementById('sending-progress-bar').style.width = percent + '%';
    document.getElementById('sending-progress-percent').textContent = percent + '%';
    document.getElementById('sending-progress-text').textContent = `${sendingState.current} / ${sendingState.total}`;
    
    // Update current email
    document.getElementById('sending-current-email').textContent = email || '-';
    
    // Add to log
    const logContent = document.getElementById('sending-log-content');
    const time = new Date().toLocaleTimeString();
    const statusIcon = status === 'success' ? '✅' : status === 'failed' ? '❌' : '📤';
    const statusColor = status === 'success' ? '#27ae60' : status === 'failed' ? '#e74c3c' : '#3498db';
    
    const logEntry = document.createElement('div');
    logEntry.style.marginBottom = '5px';
    logEntry.innerHTML = `<span style="color: #95a5a6;">[${time}]</span> ${statusIcon} <span style="color: ${statusColor};">${email}</span> - ${message || getText('sending-status-' + status)}`;
    logContent.appendChild(logEntry);
    
    // Auto scroll log
    logContent.scrollTop = logContent.scrollHeight;
    
    // Update speed
    updateSendingSpeed();
}

// Update sending time
function updateSendingTime() {
    if (!sendingState.isActive || !sendingState.startTime) return;
    
    const elapsed = Date.now() - sendingState.startTime;
    const elapsedSeconds = Math.floor(elapsed / 1000);
    const hours = Math.floor(elapsedSeconds / 3600);
    const minutes = Math.floor((elapsedSeconds % 3600) / 60);
    const seconds = elapsedSeconds % 60;
    
    document.getElementById('sending-elapsed').textContent = 
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    
    // Estimate remaining time
    if (sendingState.current > 0) {
        const avgTimePerEmail = elapsed / sendingState.current;
        const remaining = (sendingState.total - sendingState.current) * avgTimePerEmail;
        const remainingSeconds = Math.floor(remaining / 1000);
        const remHours = Math.floor(remainingSeconds / 3600);
        const remMinutes = Math.floor((remainingSeconds % 3600) / 60);
        const remSeconds = remainingSeconds % 60;
        
        document.getElementById('sending-remaining').textContent = 
            `${String(remHours).padStart(2, '0')}:${String(remMinutes).padStart(2, '0')}:${String(remSeconds).padStart(2, '0')}`;
    }
    
    if (sendingState.isActive) {
        setTimeout(updateSendingTime, 1000);
    }
}

// Update sending speed
function updateSendingSpeed() {
    if (!sendingState.startTime || sendingState.current === 0) return;
    
    const elapsed = (Date.now() - sendingState.startTime) / 1000 / 60; // in minutes
    const speed = Math.round(sendingState.current / elapsed);
    const getText = window.getText || ((key) => key);
    
    document.getElementById('sending-speed').textContent = `${speed} ${getText('sending-per-minute')}`;
}

// Complete sending
export function completeSending() {
    const getText = window.getText || ((key) => key);
    sendingState.isActive = false;
    
    // Update status
    let statusText;
    let statusColor;
    if (sendingState.failed === 0) {
        statusText = getText('sending-completed');
        statusColor = '#27ae60';
    } else if (sendingState.success === 0) {
        statusText = getText('sending-failed');
        statusColor = '#e74c3c';
    } else {
        statusText = getText('sending-partially');
        statusColor = '#f39c12';
    }
    
    const statusEl = document.getElementById('sending-status-text');
    statusEl.textContent = statusText;
    statusEl.style.color = statusColor;
    
    // Enable close button
    document.getElementById('sending-close-btn').disabled = false;
    
    // Add completion log
    const logContent = document.getElementById('sending-log-content');
    const logEntry = document.createElement('div');
    logEntry.style.marginTop = '10px';
    logEntry.style.paddingTop = '10px';
    logEntry.style.borderTop = '1px solid #34495e';
    logEntry.innerHTML = `<strong style="color: ${statusColor};">${statusText}</strong><br>
        ${getText('sending-successful')}: ${sendingState.success}<br>
        ${getText('sending-failed-count')}: ${sendingState.failed}`;
    logContent.appendChild(logEntry);
    logContent.scrollTop = logContent.scrollHeight;
}

// Close sending modal
window.closeSendingModal = function() {
    const modal = document.getElementById('sending-progress-modal');
    if (modal) {
        modal.classList.add('hidden');
        sendingState.isActive = false;
        sendingState.isPaused = false;
        sendingState.isStopped = false;
        
        // Reset button visibility to default state
        const stopBtn = document.getElementById('sending-stop-btn');
        if (stopBtn) {
            stopBtn.style.display = 'inline-block';
        }
        
        // Remove dynamically created buttons if they exist
        const resumeBtn = document.getElementById('sending-resume-btn');
        const cancelBtn = document.getElementById('sending-cancel-btn');
        if (resumeBtn) {
            resumeBtn.remove();
        }
        if (cancelBtn) {
            cancelBtn.remove();
        }
        
        // Clean up the close button state
        const closeBtn = document.getElementById('sending-close-btn');
        if (closeBtn) {
            closeBtn.disabled = false;
        }
    }
};

// Pause sending
window.pauseSending = function() {
    if (window.go && window.go.main && window.go.main.App && window.go.main.App.PauseSending) {
        window.go.main.App.PauseSending();
        sendingState.isPaused = true;
        
        // Show pause confirmation dialog
        const modal = document.getElementById('sending-progress-modal');
        if (modal) {
            const getText = window.getText || ((key) => key);
            const statusEl = document.getElementById('sending-status-text');
            statusEl.textContent = getText('sending-paused');
            statusEl.style.color = '#f39c12';
            
            // Change button to show resume/cancel options
            const stopBtn = document.getElementById('sending-stop-btn');
            stopBtn.style.display = 'none';
            
            // Create resume and cancel buttons if they don't exist
            if (!document.getElementById('sending-resume-btn')) {
                const footer = modal.querySelector('.modal-footer');
                
                const resumeBtn = document.createElement('button');
                resumeBtn.id = 'sending-resume-btn';
                resumeBtn.className = 'btn-success';
                resumeBtn.textContent = getText('sending-resume-btn');
                resumeBtn.onclick = window.resumeSending;
                
                const cancelBtn = document.createElement('button');
                cancelBtn.id = 'sending-cancel-btn';
                cancelBtn.className = 'btn-danger';
                cancelBtn.textContent = getText('sending-cancel-btn');
                cancelBtn.onclick = window.cancelSending;
                
                footer.insertBefore(resumeBtn, footer.firstChild);
                footer.insertBefore(cancelBtn, resumeBtn.nextSibling);
            } else {
                document.getElementById('sending-resume-btn').style.display = 'inline-block';
                document.getElementById('sending-cancel-btn').style.display = 'inline-block';
            }
        }
    }
};

// Resume sending
window.resumeSending = function() {
    if (window.go && window.go.main && window.go.main.App && window.go.main.App.ResumeSending) {
        window.go.main.App.ResumeSending();
        sendingState.isPaused = false;
        
        const getText = window.getText || ((key) => key);
        const statusEl = document.getElementById('sending-status-text');
        statusEl.textContent = getText('sending-in-progress');
        statusEl.style.color = '#667eea';
        
        // Hide resume/cancel buttons, show stop button
        document.getElementById('sending-stop-btn').style.display = 'inline-block';
        const resumeBtn = document.getElementById('sending-resume-btn');
        const cancelBtn = document.getElementById('sending-cancel-btn');
        if (resumeBtn) resumeBtn.style.display = 'none';
        if (cancelBtn) cancelBtn.style.display = 'none';
    }
};

// Cancel sending
window.cancelSending = function() {
    if (window.go && window.go.main && window.go.main.App && window.go.main.App.CancelSending) {
        window.go.main.App.CancelSending();
        sendingState.isStopped = true;
        completeSending();
        
        // Hide resume/cancel buttons
        const resumeBtn = document.getElementById('sending-resume-btn');
        const cancelBtn = document.getElementById('sending-cancel-btn');
        if (resumeBtn) resumeBtn.style.display = 'none';
        if (cancelBtn) cancelBtn.style.display = 'none';
    }
};

// Legacy stopSending for backward compatibility
window.stopSending = window.pauseSending;
