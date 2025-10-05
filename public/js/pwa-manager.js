// Progressive Web App Manager
// Handles service worker registration, offline functionality, and PWA features

class PWAManager {
  constructor() {
    this.isOnline = navigator.onLine;
    this.serviceWorker = null;
    this.deferredInstallPrompt = null;
    this.isInstalled = false;
    
    this.init();
  }
  
  init() {
    this.checkPWASupport();
    this.registerServiceWorker();
    this.setupOnlineOfflineHandlers();
    this.setupInstallPrompt();
    this.setupOfflineStorage();
    this.addPWAStyles();
    this.createOfflineIndicator();
  }
  
  // Check if PWA features are supported
  checkPWASupport() {
    this.support = {
      serviceWorker: 'serviceWorker' in navigator,
      notification: 'Notification' in window,
      pushManager: 'PushManager' in window,
      backgroundSync: 'sync' in window.ServiceWorkerRegistration.prototype,
      indexedDB: 'indexedDB' in window,
      webShare: 'share' in navigator
    };
    
    console.log('PWA Support:', this.support);
  }
  
  // Register service worker
  async registerServiceWorker() {
    if (!this.support.serviceWorker) {
      console.log('Service Worker not supported');
      return;
    }
    
    try {
      const registration = await navigator.serviceWorker.register('/public/sw.js', {
        scope: '/'
      });
      
      this.serviceWorker = registration;
      console.log('Service Worker registered successfully');
      
      // Handle updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            this.showUpdateAvailable();
          }
        });
      });
      
      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        this.handleServiceWorkerMessage(event.data);
      });
      
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }
  
  // Setup online/offline event handlers
  setupOnlineOfflineHandlers() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.handleOnlineStatus();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.handleOfflineStatus();
    });
    
    // Initial status
    if (this.isOnline) {
      this.handleOnlineStatus();
    } else {
      this.handleOfflineStatus();
    }
  }
  
  // Setup install prompt
  setupInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredInstallPrompt = e;
      this.showInstallBanner();
    });
    
    window.addEventListener('appinstalled', () => {
      this.isInstalled = true;
      this.hideInstallBanner();
      this.showInstallSuccess();
    });
  }
  
  // Setup offline storage
  setupOfflineStorage() {
    if (!this.support.indexedDB) {
      console.log('IndexedDB not supported');
      return;
    }
    
    this.initOfflineDatabase();
  }
  
  // Initialize offline database
  async initOfflineDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('RMSOfflineDB', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.offlineDB = request.result;
        resolve(this.offlineDB);
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Store for offline form submissions
        if (!db.objectStoreNames.contains('pendingRequests')) {
          const store = db.createObjectStore('pendingRequests', { 
            keyPath: 'id', 
            autoIncrement: true 
          });
          store.createIndex('timestamp', 'timestamp');
        }
        
        // Store for cached data
        if (!db.objectStoreNames.contains('offlineData')) {
          const store = db.createObjectStore('offlineData', { 
            keyPath: 'key' 
          });
          store.createIndex('timestamp', 'timestamp');
        }
      };
    });
  }
  
  // Add PWA-specific styles
  addPWAStyles() {
    const style = document.createElement('style');
    style.textContent = `
      /* PWA styles */
      .pwa-install-banner {
        position: fixed;
        bottom: 1rem;
        left: 1rem;
        right: 1rem;
        background: #2C5D2B;
        color: white;
        padding: 1rem;
        border-radius: 0.5rem;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        z-index: 1000;
        display: none;
        animation: slideUp 0.3s ease-out;
      }
      
      .pwa-install-banner.visible {
        display: block;
      }
      
      .pwa-banner-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
      }
      
      .pwa-banner-text {
        flex: 1;
      }
      
      .pwa-banner-title {
        font-weight: 600;
        margin-bottom: 0.25rem;
      }
      
      .pwa-banner-subtitle {
        font-size: 0.875rem;
        opacity: 0.9;
      }
      
      .pwa-banner-actions {
        display: flex;
        gap: 0.5rem;
      }
      
      .pwa-btn {
        padding: 0.5rem 1rem;
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: 0.25rem;
        background: transparent;
        color: white;
        font-size: 0.875rem;
        cursor: pointer;
        transition: background-color 0.2s;
      }
      
      .pwa-btn:hover {
        background: rgba(255, 255, 255, 0.1);
      }
      
      .pwa-btn.primary {
        background: white;
        color: #2C5D2B;
        border-color: white;
      }
      
      .pwa-btn.primary:hover {
        background: #f9fafb;
      }
      
      /* Offline indicator */
      .offline-indicator {
        position: fixed;
        top: 1rem;
        right: 1rem;
        background: #ef4444;
        color: white;
        padding: 0.5rem 1rem;
        border-radius: 0.25rem;
        font-size: 0.875rem;
        font-weight: 500;
        z-index: 1001;
        display: none;
        animation: slideDown 0.3s ease-out;
      }
      
      .offline-indicator.visible {
        display: block;
      }
      
      .offline-indicator.online {
        background: #10b981;
      }
      
      /* Update notification */
      .update-notification {
        position: fixed;
        top: 1rem;
        left: 50%;
        transform: translateX(-50%);
        background: #3b82f6;
        color: white;
        padding: 1rem;
        border-radius: 0.5rem;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        z-index: 1002;
        display: none;
        max-width: 400px;
      }
      
      .update-notification.visible {
        display: block;
        animation: slideDown 0.3s ease-out;
      }
      
      .update-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
      }
      
      /* PWA loading states */
      .pwa-loading {
        position: relative;
        overflow: hidden;
      }
      
      .pwa-loading::after {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 2px;
        background: linear-gradient(90deg, transparent, #3b82f6, transparent);
        animation: loading-progress 1.5s infinite;
      }
      
      @keyframes slideUp {
        from {
          transform: translateY(100%);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }
      
      @keyframes slideDown {
        from {
          transform: translateY(-100%);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }
      
      @keyframes loading-progress {
        to {
          left: 100%;
        }
      }
      
      /* Mobile PWA styles */
      @media (max-width: 768px) {
        .pwa-install-banner {
          left: 0.5rem;
          right: 0.5rem;
          bottom: 0.5rem;
        }
        
        .pwa-banner-content {
          flex-direction: column;
          text-align: center;
        }
        
        .pwa-banner-actions {
          width: 100%;
          justify-content: center;
        }
      }
      
      /* Hide on installed PWA */
      @media (display-mode: standalone) {
        .pwa-install-banner {
          display: none !important;
        }
      }
    `;
    
    document.head.appendChild(style);
  }
  
  // Create offline indicator
  createOfflineIndicator() {
    const indicator = document.createElement('div');
    indicator.id = 'offline-indicator';
    indicator.className = 'offline-indicator';
    document.body.appendChild(indicator);
  }
  
  // Handle online status
  handleOnlineStatus() {
    console.log('App is online');
    
    const indicator = document.getElementById('offline-indicator');
    if (indicator) {
      indicator.textContent = 'Back Online';
      indicator.classList.add('online', 'visible');
      
      setTimeout(() => {
        indicator.classList.remove('visible');
      }, 3000);
    }
    
    // Sync pending requests
    this.syncPendingRequests();
    
    // Update notification manager
    if (window.notificationManager) {
      window.notificationManager.show('Connection restored', 'success');
    }
  }
  
  // Handle offline status
  handleOfflineStatus() {
    console.log('App is offline');
    
    const indicator = document.getElementById('offline-indicator');
    if (indicator) {
      indicator.textContent = 'Offline Mode';
      indicator.classList.remove('online');
      indicator.classList.add('visible');
    }
    
    // Show offline notification
    if (window.notificationManager) {
      window.notificationManager.show('Working offline', 'warning');
    }
  }
  
  // Show install banner
  showInstallBanner() {
    if (this.isInstalled) return;
    
    const banner = document.createElement('div');
    banner.id = 'pwa-install-banner';
    banner.className = 'pwa-install-banner';
    banner.innerHTML = `
      <div class="pwa-banner-content">
        <div class="pwa-banner-text">
          <div class="pwa-banner-title">Install Room Management System</div>
          <div class="pwa-banner-subtitle">Get quick access and work offline</div>
        </div>
        <div class="pwa-banner-actions">
          <button class="pwa-btn" onclick="pwaManager.dismissInstallBanner()">Later</button>
          <button class="pwa-btn primary" onclick="pwaManager.installApp()">Install</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(banner);
    
    setTimeout(() => {
      banner.classList.add('visible');
    }, 1000);
  }
  
  // Install app
  async installApp() {
    if (!this.deferredInstallPrompt) return;
    
    const result = await this.deferredInstallPrompt.prompt();
    console.log('Install prompt result:', result);
    
    this.deferredInstallPrompt = null;
    this.hideInstallBanner();
  }
  
  // Dismiss install banner
  dismissInstallBanner() {
    this.hideInstallBanner();
  }
  
  // Hide install banner
  hideInstallBanner() {
    const banner = document.getElementById('pwa-install-banner');
    if (banner) {
      banner.classList.remove('visible');
      setTimeout(() => {
        banner.remove();
      }, 300);
    }
  }
  
  // Show install success
  showInstallSuccess() {
    if (window.notificationManager) {
      window.notificationManager.show('App installed successfully!', 'success');
    }
  }
  
  // Show update available notification
  showUpdateAvailable() {
    const notification = document.createElement('div');
    notification.id = 'update-notification';
    notification.className = 'update-notification';
    notification.innerHTML = `
      <div class="update-content">
        <div>
          <div class="font-semibold">Update Available</div>
          <div class="text-sm opacity-90">A new version is ready to install</div>
        </div>
        <div>
          <button class="pwa-btn" onclick="pwaManager.dismissUpdate()">Later</button>
          <button class="pwa-btn primary ml-2" onclick="pwaManager.applyUpdate()">Update</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('visible');
    }, 100);
  }
  
  // Apply update
  applyUpdate() {
    if (this.serviceWorker && this.serviceWorker.waiting) {
      this.serviceWorker.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  }
  
  // Dismiss update
  dismissUpdate() {
    const notification = document.getElementById('update-notification');
    if (notification) {
      notification.classList.remove('visible');
      setTimeout(() => {
        notification.remove();
      }, 300);
    }
  }
  
  // Handle service worker messages
  handleServiceWorkerMessage(data) {
    console.log('Received message from service worker:', data);
    
    switch (data.type) {
      case 'CACHE_UPDATED':
        console.log('Cache updated for:', data.url);
        break;
      case 'OFFLINE_FALLBACK':
        this.handleOfflineStatus();
        break;
    }
  }
  
  // Store data for offline use
  async storeOfflineData(key, data) {
    if (!this.offlineDB) return;
    
    const transaction = this.offlineDB.transaction(['offlineData'], 'readwrite');
    const store = transaction.objectStore('offlineData');
    
    await store.put({
      key,
      data,
      timestamp: Date.now()
    });
  }
  
  // Retrieve offline data
  async getOfflineData(key) {
    if (!this.offlineDB) return null;
    
    const transaction = this.offlineDB.transaction(['offlineData'], 'readonly');
    const store = transaction.objectStore('offlineData');
    
    return new Promise((resolve, reject) => {
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result?.data || null);
      request.onerror = () => reject(request.error);
    });
  }
  
  // Store pending request for offline sync
  async storePendingRequest(url, options) {
    if (!this.offlineDB) return;
    
    const transaction = this.offlineDB.transaction(['pendingRequests'], 'readwrite');
    const store = transaction.objectStore('pendingRequests');
    
    await store.add({
      url,
      method: options.method || 'GET',
      headers: options.headers || {},
      body: options.body || null,
      timestamp: Date.now()
    });
    
    // Register background sync if supported
    if (this.support.backgroundSync && this.serviceWorker) {
      await this.serviceWorker.sync.register('background-sync');
    }
  }
  
  // Sync pending requests
  async syncPendingRequests() {
    if (!this.offlineDB) return;
    
    const transaction = this.offlineDB.transaction(['pendingRequests'], 'readwrite');
    const store = transaction.objectStore('pendingRequests');
    const requests = await this.getAllPendingRequests();
    
    for (const request of requests) {
      try {
        const response = await fetch(request.url, {
          method: request.method,
          headers: request.headers,
          body: request.body
        });
        
        if (response.ok) {
          await store.delete(request.id);
          console.log('Successfully synced request:', request.id);
        }
      } catch (error) {
        console.log('Failed to sync request:', request.id, error);
      }
    }
  }
  
  // Get all pending requests
  async getAllPendingRequests() {
    if (!this.offlineDB) return [];
    
    const transaction = this.offlineDB.transaction(['pendingRequests'], 'readonly');
    const store = transaction.objectStore('pendingRequests');
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  
  // Share functionality
  async shareContent(title, text, url) {
    if (this.support.webShare) {
      try {
        await navigator.share({ title, text, url });
        return true;
      } catch (error) {
        console.log('Web Share failed:', error);
      }
    }
    
    // Fallback to clipboard
    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(url);
        if (window.notificationManager) {
          window.notificationManager.show('Link copied to clipboard', 'success');
        }
        return true;
      } catch (error) {
        console.log('Clipboard failed:', error);
      }
    }
    
    return false;
  }
  
  // Request notification permission
  async requestNotificationPermission() {
    if (!this.support.notification) return false;
    
    if (Notification.permission === 'granted') {
      return true;
    }
    
    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    
    return false;
  }
  
  // Show notification
  showNotification(title, options = {}) {
    if (Notification.permission === 'granted') {
      const notification = new Notification(title, {
        icon: '/public/icons/icon-192.png',
        badge: '/public/icons/badge-72.png',
        ...options
      });
      
      // Auto-close after 5 seconds
      setTimeout(() => {
        notification.close();
      }, 5000);
      
      return notification;
    }
    
    return null;
  }
  
  // Get PWA installation status
  isPWAInstalled() {
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.navigator.standalone === true;
  }
  
  // Public API
  getStatus() {
    return {
      isOnline: this.isOnline,
      isInstalled: this.isPWAInstalled(),
      serviceWorkerReady: !!this.serviceWorker,
      support: this.support
    };
  }
}

// Initialize PWA Manager
window.pwaManager = new PWAManager();

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PWAManager;
}