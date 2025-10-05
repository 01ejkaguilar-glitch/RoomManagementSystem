// Notification Manager
// Provides real-time notifications for schedule changes, conflicts, and important updates

class NotificationManager {
  constructor(options = {}) {
    this.endpoint = options.endpoint || '/notifications';
    this.maxNotifications = options.maxNotifications || 50;
    this.autoDismissDelay = options.autoDismissDelay || 5000;
    this.soundEnabled = localStorage.getItem('notificationSound') !== 'false';
    this.enabled = localStorage.getItem('notificationsEnabled') !== 'false';
    
    this.notifications = [];
    this.notificationId = 0;
    
    this.types = {
      info: { icon: 'ℹ️', class: 'notification-info', sound: 'info' },
      success: { icon: '✅', class: 'notification-success', sound: 'success' },
      warning: { icon: '⚠️', class: 'notification-warning', sound: 'warning' },
      error: { icon: '❌', class: 'notification-error', sound: 'error' },
      conflict: { icon: '⚡', class: 'notification-conflict', sound: 'warning' },
      schedule: { icon: '📅', class: 'notification-schedule', sound: 'info' }
    };
    
    this.init();
  }
  
  init() {
    this.createNotificationContainer();
    this.createNotificationCenter();
    this.addNotificationStyles();
    this.bindEvents();
    this.requestPermissions();
    this.startPolling();
  }
  
  createNotificationContainer() {
    // Create toast notification container
    const container = document.createElement('div');
    container.id = 'notification-container';
    container.className = 'fixed top-4 right-4 z-[9999] space-y-2 max-w-sm';
    container.setAttribute('aria-live', 'polite');
    container.setAttribute('aria-label', 'Notifications');
    document.body.appendChild(container);
  }
  
  createNotificationCenter() {
    // Create notification center toggle
    const bellIcon = document.createElement('div');
    bellIcon.id = 'notification-bell';
    bellIcon.className = 'fixed top-4 left-4 z-[9998] cursor-pointer';
    bellIcon.innerHTML = `
      <button class="relative p-2 bg-brand text-white rounded-lg shadow-lg hover:bg-brand-accent transition-colors" 
              aria-label="Open notification center" 
              title="Notifications">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
        </svg>
        <span id="notification-count" class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 items-center justify-center hidden">0</span>
      </button>
    `;
    
    // Create notification center panel
    const panel = document.createElement('div');
    panel.id = 'notification-panel';
    panel.className = 'fixed top-16 left-4 w-80 max-h-96 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-[9997] hidden overflow-hidden';
    panel.innerHTML = `
      <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 class="font-semibold text-gray-900 dark:text-white">Notifications</h3>
        <div class="flex items-center space-x-2">
          <button id="notification-settings" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" 
                  aria-label="Notification settings" title="Settings">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
          </button>
          <button id="clear-notifications" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" 
                  aria-label="Clear all notifications" title="Clear all">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
          </button>
        </div>
      </div>
      <div id="notification-list" class="max-h-80 overflow-y-auto">
        <div class="p-4 text-center text-gray-500 dark:text-gray-400">
          No notifications yet
        </div>
      </div>
      <div id="notification-settings-panel" class="hidden p-4 border-t border-gray-200 dark:border-gray-700">
        <div class="space-y-3">
          <label class="flex items-center">
            <input type="checkbox" ${this.enabled ? 'checked' : ''} id="enable-notifications" class="mr-2">
            <span class="text-sm">Enable notifications</span>
          </label>
          <label class="flex items-center">
            <input type="checkbox" ${this.soundEnabled ? 'checked' : ''} id="enable-sound" class="mr-2">
            <span class="text-sm">Enable sound</span>
          </label>
          <button id="test-notification" class="w-full px-3 py-1 bg-brand text-white rounded text-sm hover:bg-brand-accent">
            Test Notification
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(bellIcon);
    document.body.appendChild(panel);
  }
  
  addNotificationStyles() {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
      .notification {
        background: var(--bg-primary);
        border: 1px solid var(--border-primary);
        border-radius: 8px;
        padding: 16px;
        box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -1px rgb(0 0 0 / 0.06);
        transform: translateX(100%);
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
      }
      
      .notification.show {
        transform: translateX(0);
      }
      
      .notification.removing {
        transform: translateX(100%);
        opacity: 0;
      }
      
      .notification-info {
        border-left: 4px solid #3b82f6;
      }
      
      .notification-success {
        border-left: 4px solid #10b981;
      }
      
      .notification-warning {
        border-left: 4px solid #f59e0b;
      }
      
      .notification-error {
        border-left: 4px solid #ef4444;
      }
      
      .notification-conflict {
        border-left: 4px solid #8b5cf6;
        background: linear-gradient(90deg, #fef3c7 0%, var(--bg-primary) 20%);
      }
      
      .notification-schedule {
        border-left: 4px solid #06b6d4;
      }
      
      .notification-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 8px;
      }
      
      .notification-title {
        font-weight: 600;
        color: var(--text-primary);
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .notification-close {
        background: none;
        border: none;
        color: var(--text-secondary);
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        transition: background-color 0.2s;
      }
      
      .notification-close:hover {
        background: var(--bg-tertiary);
        color: var(--text-primary);
      }
      
      .notification-body {
        color: var(--text-secondary);
        font-size: 14px;
        line-height: 1.4;
      }
      
      .notification-actions {
        margin-top: 12px;
        display: flex;
        gap: 8px;
      }
      
      .notification-action {
        padding: 4px 12px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
      }
      
      .notification-action.primary {
        background: var(--brand);
        color: white;
      }
      
      .notification-action.secondary {
        background: var(--bg-tertiary);
        color: var(--text-secondary);
      }
      
      .notification-action:hover {
        opacity: 0.8;
      }
      
      .notification-progress {
        position: absolute;
        bottom: 0;
        left: 0;
        height: 3px;
        background: var(--brand);
        transition: width linear;
      }
      
      @media (prefers-reduced-motion: reduce) {
        .notification {
          transition: none;
        }
      }
      
      /* Dark mode adjustments */
      .dark .notification {
        box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.3), 0 2px 4px -1px rgb(0 0 0 / 0.2);
      }
      
      /* Mobile responsive */
      @media (max-width: 480px) {
        #notification-container {
          left: 4px;
          right: 4px;
          max-width: none;
        }
        
        #notification-panel {
          left: 4px;
          right: 4px;
          width: auto;
        }
      }
    `;
    
    document.head.appendChild(style);
  }
  
  bindEvents() {
    // Bell icon click
    document.getElementById('notification-bell').addEventListener('click', () => {
      this.toggleNotificationPanel();
    });
    
    // Settings toggle
    document.getElementById('notification-settings').addEventListener('click', () => {
      this.toggleSettingsPanel();
    });
    
    // Clear all notifications
    document.getElementById('clear-notifications').addEventListener('click', () => {
      this.clearAll();
    });
    
    // Settings checkboxes
    document.getElementById('enable-notifications').addEventListener('change', (e) => {
      this.enabled = e.target.checked;
      localStorage.setItem('notificationsEnabled', this.enabled);
    });
    
    document.getElementById('enable-sound').addEventListener('change', (e) => {
      this.soundEnabled = e.target.checked;
      localStorage.setItem('notificationSound', this.soundEnabled);
    });
    
    // Test notification
    document.getElementById('test-notification').addEventListener('click', () => {
      this.show({
        type: 'info',
        title: 'Test Notification',
        message: 'This is a test notification to verify your settings.',
        actions: [{
          label: 'Got it!',
          action: () => {}
        }]
      });
    });
    
    // Close panel when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#notification-bell') && !e.target.closest('#notification-panel')) {
        document.getElementById('notification-panel').classList.add('hidden');
      }
    });
  }
  
  async requestPermissions() {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  }
  
  show(notification) {
    if (!this.enabled) return;
    
    const id = ++this.notificationId;
    const notificationData = {
      id,
      type: notification.type || 'info',
      title: notification.title || 'Notification',
      message: notification.message || '',
      timestamp: new Date(),
      actions: notification.actions || [],
      persistent: notification.persistent || false,
      ...notification
    };
    
    // Add to notification list
    this.notifications.unshift(notificationData);
    this.updateNotificationCenter();
    this.updateNotificationCount();
    
    // Create toast notification
    this.createToastNotification(notificationData);
    
    // Play sound if enabled
    if (this.soundEnabled && notificationData.type !== 'info') {
      this.playNotificationSound(notificationData.type);
    }
    
    // Show browser notification if permission granted
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notificationData.title, {
        body: notificationData.message,
        icon: '/favicon.ico',
        tag: `rms-${id}`
      });
    }
    
    // Announce to screen readers
    if (window.accessibilityManager) {
      window.accessibilityManager.announce(`${notificationData.title}: ${notificationData.message}`);
    }
    
    return id;
  }
  
  createToastNotification(notification) {
    const container = document.getElementById('notification-container');
    const typeData = this.types[notification.type] || this.types.info;
    
    const toast = document.createElement('div');
    toast.className = `notification ${typeData.class}`;
    toast.dataset.id = notification.id;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'polite');
    
    toast.innerHTML = `
      <div class="notification-header">
        <div class="notification-title">
          <span>${typeData.icon}</span>
          <span>${notification.title}</span>
        </div>
        <button class="notification-close" aria-label="Close notification">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
      <div class="notification-body">${notification.message}</div>
      ${notification.actions.length ? `
        <div class="notification-actions">
          ${notification.actions.map((action, index) => `
            <button class="notification-action ${index === 0 ? 'primary' : 'secondary'}" 
                    data-action="${index}">
              ${action.label}
            </button>
          `).join('')}
        </div>
      ` : ''}
      ${!notification.persistent ? '<div class="notification-progress"></div>' : ''}
    `;
    
    // Bind close button
    toast.querySelector('.notification-close').addEventListener('click', () => {
      this.dismiss(notification.id);
    });
    
    // Bind action buttons
    toast.querySelectorAll('.notification-action').forEach(button => {
      button.addEventListener('click', (e) => {
        const actionIndex = parseInt(e.target.dataset.action);
        if (notification.actions[actionIndex]?.action) {
          notification.actions[actionIndex].action();
        }
        this.dismiss(notification.id);
      });
    });
    
    container.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Auto-dismiss if not persistent
    if (!notification.persistent) {
      const progressBar = toast.querySelector('.notification-progress');
      if (progressBar) {
        progressBar.style.width = '100%';
        progressBar.style.transitionDuration = `${this.autoDismissDelay}ms`;
        setTimeout(() => {
          progressBar.style.width = '0%';
        }, 10);
      }
      
      setTimeout(() => {
        this.dismiss(notification.id);
      }, this.autoDismissDelay);
    }
  }
  
  dismiss(id) {
    const toast = document.querySelector(`[data-id="${id}"]`);
    if (toast) {
      toast.classList.add('removing');
      setTimeout(() => {
        toast.remove();
      }, 300);
    }
  }
  
  toggleNotificationPanel() {
    const panel = document.getElementById('notification-panel');
    panel.classList.toggle('hidden');
  }
  
  toggleSettingsPanel() {
    const settingsPanel = document.getElementById('notification-settings-panel');
    settingsPanel.classList.toggle('hidden');
  }
  
  updateNotificationCenter() {
    const list = document.getElementById('notification-list');
    
    if (this.notifications.length === 0) {
      list.innerHTML = '<div class="p-4 text-center text-gray-500 dark:text-gray-400">No notifications yet</div>';
      return;
    }
    
    list.innerHTML = this.notifications.map(notification => {
      const typeData = this.types[notification.type] || this.types.info;
      return `
        <div class="p-3 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
          <div class="flex items-start space-x-3">
            <span class="text-lg">${typeData.icon}</span>
            <div class="flex-1 min-w-0">
              <div class="font-medium text-gray-900 dark:text-white text-sm">${notification.title}</div>
              <div class="text-gray-500 dark:text-gray-400 text-xs mt-1">${notification.message}</div>
              <div class="text-gray-400 dark:text-gray-500 text-xs mt-1">
                ${this.formatTimestamp(notification.timestamp)}
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }
  
  updateNotificationCount() {
    const count = this.notifications.length;
    const badge = document.getElementById('notification-count');
    
    if (count > 0) {
      badge.textContent = count > 99 ? '99+' : count;
      badge.classList.remove('hidden');
      badge.classList.add('flex');
    } else {
      badge.classList.add('hidden');
      badge.classList.remove('flex');
    }
  }
  
  clearAll() {
    this.notifications = [];
    this.updateNotificationCenter();
    this.updateNotificationCount();
    
    // Remove all toast notifications
    document.querySelectorAll('.notification').forEach(toast => {
      this.dismiss(parseInt(toast.dataset.id));
    });
  }
  
  formatTimestamp(timestamp) {
    const now = new Date();
    const diff = now - timestamp;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return timestamp.toLocaleDateString();
  }
  
  playNotificationSound(type) {
    // Create audio context for notification sounds
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    // Simple beep sound based on type
    const frequency = {
      success: 800,
      warning: 600,
      error: 400,
      info: 700
    }[type] || 700;
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
    
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.2);
  }
  
  startPolling() {
    // Poll for new notifications every 30 seconds
    setInterval(() => {
      this.fetchNotifications();
    }, 30000);
  }
  
  async fetchNotifications() {
    try {
      // Mock API call - replace with real endpoint
      const response = await fetch(this.endpoint);
      if (response.ok) {
        const notifications = await response.json();
        notifications.forEach(notification => {
          if (!this.notifications.find(n => n.id === notification.id)) {
            this.show(notification);
          }
        });
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  }
  
  // Public API methods
  showSuccess(title, message, actions) {
    return this.show({ type: 'success', title, message, actions });
  }
  
  showError(title, message, actions) {
    return this.show({ type: 'error', title, message, actions, persistent: true });
  }
  
  showWarning(title, message, actions) {
    return this.show({ type: 'warning', title, message, actions });
  }
  
  showInfo(title, message, actions) {
    return this.show({ type: 'info', title, message, actions });
  }
  
  showConflict(title, message, actions) {
    return this.show({ type: 'conflict', title, message, actions, persistent: true });
  }
  
  showScheduleUpdate(title, message, actions) {
    return this.show({ type: 'schedule', title, message, actions });
  }
}

// Initialize notification manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.notificationManager = new NotificationManager();
  
  // Example usage for testing
  setTimeout(() => {
    window.notificationManager.showInfo(
      'Welcome!', 
      'Room Management System is ready to use.',
      [{ label: 'Get Started', action: () => console.log('Getting started...') }]
    );
  }, 2000);
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = NotificationManager;
}