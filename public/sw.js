// Service Worker for Progressive Web App
// Provides offline functionality, caching, and enhanced performance

const CACHE_NAME = 'rms-cache-v1';
const STATIC_CACHE = 'rms-static-v1';
const DYNAMIC_CACHE = 'rms-dynamic-v1';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/colleges',
  '/buildings',
  '/rooms',
  '/schedules',
  '/calendar',
  '/analytics',
  '/public/css/app.css',
  '/public/js/theme-manager.js',
  '/public/js/accessibility-manager.js',
  '/public/js/notification-manager.js',
  '/public/js/modal-system.js',
  '/public/js/calendar-system.js',
  '/public/js/animation-system.js',
  '/public/js/data-density-manager.js',
  '/public/js/mobile-navigation-manager.js',
  '/public/js/performance-monitor.js',
  // Add other critical assets
];

// Assets to cache dynamically
const CACHE_STRATEGIES = {
  // Cache first, fallback to network
  cacheFirst: [
    /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/,
    /\.(?:css|js)$/,
    /\/public\//
  ],
  
  // Network first, fallback to cache
  networkFirst: [
    /\/api\//,
    /\/data\//,
    /\.json$/
  ],
  
  // Stale while revalidate
  staleWhileRevalidate: [
    /\/$/,
    /\/dashboard/,
    /\/colleges/,
    /\/buildings/,
    /\/rooms/,
    /\/schedules/,
    /\/calendar/,
    /\/analytics/
  ]
};

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Caching static assets...');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Static assets cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Failed to cache static assets:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return cacheName !== STATIC_CACHE && 
                     cacheName !== DYNAMIC_CACHE &&
                     cacheName.startsWith('rms-');
            })
            .map((cacheName) => {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('Cache cleanup completed');
        return self.clients.claim();
      })
  );
});

// Fetch event - handle requests with caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const { url, method } = request;
  
  // Only handle GET requests
  if (method !== 'GET') {
    return;
  }
  
  // Skip cross-origin requests
  if (!url.startsWith(self.location.origin)) {
    return;
  }
  
  event.respondWith(handleRequest(request));
});

// Handle different types of requests
async function handleRequest(request) {
  const url = new URL(request.url);
  
  // Determine caching strategy
  const strategy = getCachingStrategy(url.pathname);
  
  switch (strategy) {
    case 'cacheFirst':
      return cacheFirst(request);
    case 'networkFirst':
      return networkFirst(request);
    case 'staleWhileRevalidate':
      return staleWhileRevalidate(request);
    default:
      return fetch(request);
  }
}

// Determine caching strategy based on URL
function getCachingStrategy(pathname) {
  for (const [strategy, patterns] of Object.entries(CACHE_STRATEGIES)) {
    if (patterns.some(pattern => pattern.test(pathname))) {
      return strategy;
    }
  }
  return 'networkFirst'; // Default strategy
}

// Cache First Strategy
async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      // Update cache in background
      updateCacheInBackground(request);
      return cachedResponse;
    }
    
    // Not in cache, fetch from network
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Cache first strategy failed:', error);
    return createOfflineResponse(request);
  }
}

// Network First Strategy
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Network failed, trying cache:', error.message);
    
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    return createOfflineResponse(request);
  }
}

// Stale While Revalidate Strategy
async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cachedResponse = await cache.match(request);
  
  // Always try to fetch from network in background
  const networkPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => {
    // Network failed, but we might have cached version
    return null;
  });
  
  // Return cached version immediately if available
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // No cached version, wait for network
  const networkResponse = await networkPromise;
  return networkResponse || createOfflineResponse(request);
}

// Update cache in background
function updateCacheInBackground(request) {
  fetch(request)
    .then((response) => {
      if (response.ok) {
        caches.open(DYNAMIC_CACHE)
          .then((cache) => cache.put(request, response));
      }
    })
    .catch(() => {
      // Silently fail background updates
    });
}

// Create offline response
function createOfflineResponse(request) {
  const url = new URL(request.url);
  
  // Handle different types of offline responses
  if (url.pathname.endsWith('.html') || url.pathname === '/' || !url.pathname.includes('.')) {
    return new Response(createOfflinePage(), {
      status: 200,
      statusText: 'OK',
      headers: { 'Content-Type': 'text/html' }
    });
  }
  
  if (url.pathname.endsWith('.json')) {
    return new Response(JSON.stringify({
      error: 'Offline',
      message: 'This data is not available offline',
      cached: false
    }), {
      status: 503,
      statusText: 'Service Unavailable',
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // Default offline response
  return new Response('Offline - Content not available', {
    status: 503,
    statusText: 'Service Unavailable',
    headers: { 'Content-Type': 'text/plain' }
  });
}

// Create offline page HTML
function createOfflinePage() {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Offline - Room Management System</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          margin: 0;
          padding: 2rem;
          background: #f5f8f4;
          color: #1f2937;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          text-align: center;
        }
        .offline-container {
          max-width: 500px;
          background: white;
          border-radius: 1rem;
          padding: 2rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .offline-icon {
          width: 4rem;
          height: 4rem;
          background: #ef4444;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem;
          color: white;
          font-size: 1.5rem;
        }
        h1 {
          margin: 0 0 1rem 0;
          color: #1f2937;
          font-size: 1.5rem;
          font-weight: 600;
        }
        p {
          margin: 0 0 1.5rem 0;
          color: #6b7280;
          line-height: 1.6;
        }
        .retry-btn {
          background: #2C5D2B;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 0.5rem;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        .retry-btn:hover {
          background: #76A743;
        }
        .offline-actions {
          margin-top: 1.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid #e5e7eb;
        }
        .offline-link {
          display: inline-block;
          color: #2C5D2B;
          text-decoration: none;
          margin: 0 0.5rem;
          font-weight: 500;
        }
        .offline-link:hover {
          text-decoration: underline;
        }
      </style>
    </head>
    <body>
      <div class="offline-container">
        <div class="offline-icon">
          ⚠️
        </div>
        <h1>You're Offline</h1>
        <p>
          Sorry, it looks like you're not connected to the internet. 
          Some features of the Room Management System may not be available.
        </p>
        <button class="retry-btn" onclick="window.location.reload()">
          Try Again
        </button>
        
        <div class="offline-actions">
          <p>While offline, you can still:</p>
          <a href="/dashboard" class="offline-link">View Dashboard</a>
          <a href="/calendar" class="offline-link">Check Calendar</a>
          <a href="/settings" class="offline-link">Settings</a>
        </div>
      </div>
      
      <script>
        // Listen for online event
        window.addEventListener('online', function() {
          window.location.reload();
        });
        
        // Check connection periodically
        setInterval(function() {
          if (navigator.onLine) {
            window.location.reload();
          }
        }, 30000);
      </script>
    </body>
    </html>
  `;
}

// Background sync for form submissions
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(processBackgroundSync());
  }
});

// Process background sync
async function processBackgroundSync() {
  try {
    // Get pending requests from IndexedDB
    const pendingRequests = await getPendingRequests();
    
    for (const request of pendingRequests) {
      try {
        const response = await fetch(request.url, {
          method: request.method,
          headers: request.headers,
          body: request.body
        });
        
        if (response.ok) {
          await removePendingRequest(request.id);
          console.log('Successfully synced request:', request.id);
        }
      } catch (error) {
        console.log('Failed to sync request:', request.id, error);
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'New notification from RMS',
    icon: '/public/icons/icon-192.png',
    badge: '/public/icons/badge-72.png',
    tag: 'rms-notification',
    actions: [
      {
        action: 'open',
        title: 'Open App'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Room Management System', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Message handling from main thread
self.addEventListener('message', (event) => {
  console.log('Service Worker received message:', event.data);
  
  if (event.data && event.data.type) {
    switch (event.data.type) {
      case 'SKIP_WAITING':
        self.skipWaiting();
        break;
      case 'CACHE_UPDATE':
        updateCache(event.data.url);
        break;
      case 'CLEAR_CACHE':
        clearCache();
        break;
    }
  }
});

// Update specific cache entry
async function updateCache(url) {
  try {
    const response = await fetch(url);
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      await cache.put(url, response);
      console.log('Cache updated for:', url);
    }
  } catch (error) {
    console.error('Failed to update cache for:', url, error);
  }
}

// Clear all caches
async function clearCache() {
  try {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.map(cacheName => caches.delete(cacheName))
    );
    console.log('All caches cleared');
  } catch (error) {
    console.error('Failed to clear caches:', error);
  }
}

// IndexedDB helpers for offline data
async function getPendingRequests() {
  // Implementation would use IndexedDB to store pending requests
  // Simplified for this example
  return [];
}

async function removePendingRequest(id) {
  // Implementation would remove request from IndexedDB
  console.log('Removing pending request:', id);
}

// Periodic cache cleanup
setInterval(() => {
  cleanupOldCacheEntries();
}, 24 * 60 * 60 * 1000); // Daily cleanup

async function cleanupOldCacheEntries() {
  try {
    const cache = await caches.open(DYNAMIC_CACHE);
    const requests = await cache.keys();
    const now = Date.now();
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
    
    for (const request of requests) {
      const response = await cache.match(request);
      const cacheDate = new Date(response.headers.get('date')).getTime();
      
      if (now - cacheDate > maxAge) {
        await cache.delete(request);
        console.log('Removed old cache entry:', request.url);
      }
    }
  } catch (error) {
    console.error('Cache cleanup failed:', error);
  }
}