// Performance Monitor and Optimization System
// Provides real-time performance tracking, caching, and optimization tools

class PerformanceMonitor {
  constructor(options = {}) {
    this.config = {
      enableMetrics: options.enableMetrics !== false,
      enableCaching: options.enableCaching !== false,
      cacheSize: options.cacheSize || 100,
      performanceThresholds: {
        loadTime: 3000,
        interactionTime: 100,
        memoryUsage: 50 * 1024 * 1024, // 50MB
        ...options.performanceThresholds
      },
      reportingInterval: options.reportingInterval || 30000, // 30 seconds
      ...options
    };
    
    this.metrics = {
      pageLoad: [],
      interactions: [],
      apiCalls: [],
      renderTimes: [],
      memoryUsage: [],
      cacheHits: 0,
      cacheMisses: 0
    };
    
    this.cache = new Map();
    this.observers = [];
    this.startTime = performance.now();
    
    this.init();
  }
  
  init() {
    if (!this.config.enableMetrics) return;
    
    this.setupPerformanceObservers();
    this.trackPageLoad();
    this.setupCaching();
    this.startPeriodicReporting();
    this.createPerformanceUI();
  }
  
  setupPerformanceObservers() {
    // Performance Observer for navigation timing
    if ('PerformanceObserver' in window) {
      try {
        const navObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach(entry => {
            if (entry.entryType === 'navigation') {
              this.recordNavigationMetrics(entry);
            }
          });
        });
        navObserver.observe({ entryTypes: ['navigation'] });
        this.observers.push(navObserver);
        
        // Observer for resource timing
        const resourceObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach(entry => {
            if (entry.entryType === 'resource') {
              this.recordResourceMetrics(entry);
            }
          });
        });
        resourceObserver.observe({ entryTypes: ['resource'] });
        this.observers.push(resourceObserver);
        
        // Observer for paint timing
        const paintObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach(entry => {
            if (entry.entryType === 'paint') {
              this.recordPaintMetrics(entry);
            }
          });
        });
        paintObserver.observe({ entryTypes: ['paint'] });
        this.observers.push(paintObserver);
        
        // Observer for layout shift
        if ('LayoutShift' in window) {
          const layoutObserver = new PerformanceObserver((list) => {
            list.getEntries().forEach(entry => {
              if (entry.entryType === 'layout-shift' && !entry.hadRecentInput) {
                this.recordLayoutShift(entry);
              }
            });
          });
          layoutObserver.observe({ entryTypes: ['layout-shift'] });
          this.observers.push(layoutObserver);
        }
        
      } catch (error) {
        console.warn('Performance observers not fully supported:', error);
      }
    }
  }
  
  recordNavigationMetrics(entry) {
    const metrics = {
      timestamp: Date.now(),
      domContentLoaded: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
      loadComplete: entry.loadEventEnd - entry.loadEventStart,
      domInteractive: entry.domInteractive - entry.navigationStart,
      firstByte: entry.responseStart - entry.requestStart,
      dns: entry.domainLookupEnd - entry.domainLookupStart,
      tcp: entry.connectEnd - entry.connectStart,
      total: entry.loadEventEnd - entry.navigationStart
    };
    
    this.metrics.pageLoad.push(metrics);
    this.checkThresholds('loadTime', metrics.total);
  }
  
  recordResourceMetrics(entry) {
    const metrics = {
      name: entry.name,
      type: this.getResourceType(entry.name),
      duration: entry.duration,
      size: entry.transferSize || 0,
      timestamp: Date.now()
    };
    
    // Keep only recent entries to prevent memory bloat
    if (this.metrics.apiCalls.length > 1000) {
      this.metrics.apiCalls = this.metrics.apiCalls.slice(-500);
    }
    
    this.metrics.apiCalls.push(metrics);
  }
  
  recordPaintMetrics(entry) {
    const metric = {
      name: entry.name,
      startTime: entry.startTime,
      timestamp: Date.now()
    };
    
    this.metrics.renderTimes.push(metric);
  }
  
  recordLayoutShift(entry) {
    // Cumulative Layout Shift tracking
    this.metrics.layoutShifts = (this.metrics.layoutShifts || 0) + entry.value;
  }
  
  trackPageLoad() {
    window.addEventListener('load', () => {
      const loadTime = performance.now() - this.startTime;
      this.recordMetric('pageLoad', { duration: loadTime, timestamp: Date.now() });
    });
  }
  
  // Public API for tracking custom metrics
  recordMetric(type, data) {
    if (!this.metrics[type]) {
      this.metrics[type] = [];
    }
    
    this.metrics[type].push({
      ...data,
      timestamp: data.timestamp || Date.now()
    });
    
    this.checkThresholds(type, data.duration || data.value);
  }
  
  trackInteraction(element, action) {
    const startTime = performance.now();
    
    return () => {
      const duration = performance.now() - startTime;
      this.recordMetric('interactions', {
        element: element.tagName || 'unknown',
        action,
        duration
      });
      
      this.checkThresholds('interactionTime', duration);
    };
  }
  
  trackFunction(name, fn) {
    return async (...args) => {
      const startTime = performance.now();
      try {
        const result = await fn(...args);
        const duration = performance.now() - startTime;
        this.recordMetric('functions', { name, duration, success: true });
        return result;
      } catch (error) {
        const duration = performance.now() - startTime;
        this.recordMetric('functions', { name, duration, success: false, error: error.message });
        throw error;
      }
    };
  }
  
  setupCaching() {
    if (!this.config.enableCaching) return;
    
    this.cache = new Map();
    
    // Cache API responses
    this.interceptFetch();
    
    // Cache DOM queries
    this.cacheDOM();
  }
  
  interceptFetch() {
    const originalFetch = window.fetch;
    
    window.fetch = async (url, options = {}) => {
      const cacheKey = this.getCacheKey(url, options);
      
      // Check cache for GET requests
      if (!options.method || options.method.toLowerCase() === 'get') {
        const cached = this.getFromCache(cacheKey);
        if (cached) {
          this.metrics.cacheHits++;
          return Promise.resolve(new Response(JSON.stringify(cached.data), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          }));
        }
      }
      
      this.metrics.cacheMisses++;
      
      const startTime = performance.now();
      try {
        const response = await originalFetch(url, options);
        const duration = performance.now() - startTime;
        
        this.recordMetric('apiCalls', {
          url,
          method: options.method || 'GET',
          status: response.status,
          duration
        });
        
        // Cache successful GET responses
        if (response.ok && (!options.method || options.method.toLowerCase() === 'get')) {
          const clonedResponse = response.clone();
          const data = await clonedResponse.json().catch(() => null);
          if (data) {
            this.setCache(cacheKey, data, 5 * 60 * 1000); // 5 minutes
          }
        }
        
        return response;
      } catch (error) {
        const duration = performance.now() - startTime;
        this.recordMetric('apiCalls', {
          url,
          method: options.method || 'GET',
          error: error.message,
          duration
        });
        throw error;
      }
    };
  }
  
  cacheDOM() {
    const originalQuerySelector = document.querySelector;
    const originalQuerySelectorAll = document.querySelectorAll;
    const domCache = new Map();
    
    document.querySelector = function(selector) {
      if (domCache.has(selector)) {
        return domCache.get(selector);
      }
      
      const result = originalQuerySelector.call(this, selector);
      if (result) {
        domCache.set(selector, result);
        // Clear cache after 1 second to avoid stale references
        setTimeout(() => domCache.delete(selector), 1000);
      }
      return result;
    };
  }
  
  getCacheKey(url, options) {
    return `${url}_${JSON.stringify(options)}`;
  }
  
  setCache(key, data, ttl = 5 * 60 * 1000) {
    // Implement LRU cache
    if (this.cache.size >= this.config.cacheSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(key, {
      data,
      expiry: Date.now() + ttl
    });
  }
  
  getFromCache(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item;
  }
  
  clearCache() {
    this.cache.clear();
    this.metrics.cacheHits = 0;
    this.metrics.cacheMisses = 0;
  }
  
  checkThresholds(type, value) {
    const threshold = this.config.performanceThresholds[type];
    if (threshold && value > threshold) {
      this.reportPerformanceIssue(type, value, threshold);
    }
  }
  
  reportPerformanceIssue(type, value, threshold) {
    console.warn(`Performance threshold exceeded for ${type}: ${value}ms > ${threshold}ms`);
    
    if (window.notificationManager) {
      window.notificationManager.showWarning(
        'Performance Warning',
        `${type} exceeded threshold: ${Math.round(value)}ms`
      );
    }
  }
  
  getMemoryUsage() {
    if ('memory' in performance) {
      return {
        usedJSHeapSize: performance.memory.usedJSHeapSize,
        totalJSHeapSize: performance.memory.totalJSHeapSize,
        jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
      };
    }
    return null;
  }
  
  trackMemoryUsage() {
    const memory = this.getMemoryUsage();
    if (memory) {
      this.metrics.memoryUsage.push({
        ...memory,
        timestamp: Date.now()
      });
      
      this.checkThresholds('memoryUsage', memory.usedJSHeapSize);
    }
  }
  
  startPeriodicReporting() {
    setInterval(() => {
      this.trackMemoryUsage();
      this.generatePerformanceReport();
    }, this.config.reportingInterval);
  }
  
  generatePerformanceReport() {
    const report = {
      timestamp: Date.now(),
      pageLoad: this.getAverageMetric('pageLoad', 'duration'),
      interactions: this.getAverageMetric('interactions', 'duration'),
      apiCalls: this.getAverageMetric('apiCalls', 'duration'),
      memory: this.getMemoryUsage(),
      cache: {
        hits: this.metrics.cacheHits,
        misses: this.metrics.cacheMisses,
        hitRate: this.metrics.cacheHits / (this.metrics.cacheHits + this.metrics.cacheMisses) || 0
      },
      layoutShifts: this.metrics.layoutShifts || 0
    };
    
    this.updatePerformanceUI(report);
    return report;
  }
  
  getAverageMetric(type, property) {
    const metrics = this.metrics[type] || [];
    if (metrics.length === 0) return 0;
    
    const sum = metrics.reduce((acc, metric) => acc + (metric[property] || 0), 0);
    return sum / metrics.length;
  }
  
  createPerformanceUI() {
    const panel = document.createElement('div');
    panel.id = 'performance-monitor';
    panel.className = 'performance-monitor';
    panel.innerHTML = `
      <div class="performance-header">
        <h3>⚡ Performance Monitor</h3>
        <button id="performance-toggle" class="performance-toggle">📊</button>
      </div>
      <div id="performance-content" class="performance-content hidden">
        <div class="performance-metrics">
          <div class="metric">
            <span class="metric-label">Page Load:</span>
            <span id="metric-pageload" class="metric-value">-</span>
          </div>
          <div class="metric">
            <span class="metric-label">Interactions:</span>
            <span id="metric-interactions" class="metric-value">-</span>
          </div>
          <div class="metric">
            <span class="metric-label">API Calls:</span>
            <span id="metric-apicalls" class="metric-value">-</span>
          </div>
          <div class="metric">
            <span class="metric-label">Memory:</span>
            <span id="metric-memory" class="metric-value">-</span>
          </div>
          <div class="metric">
            <span class="metric-label">Cache Hit Rate:</span>
            <span id="metric-cache" class="metric-value">-</span>
          </div>
        </div>
        <div class="performance-actions">
          <button id="clear-cache-btn" class="btn-small">Clear Cache</button>
          <button id="force-gc-btn" class="btn-small">Force GC</button>
          <button id="export-metrics-btn" class="btn-small">Export</button>
        </div>
      </div>
    `;
    
    // Add styles
    const style = document.createElement('style');
    style.textContent = `
      .performance-monitor {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: var(--bg-primary);
        border: 1px solid var(--border-primary);
        border-radius: 8px;
        box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
        z-index: 9998;
        font-size: 12px;
        width: 250px;
      }
      
      .performance-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 12px;
        background: var(--brand);
        color: white;
        border-radius: 8px 8px 0 0;
      }
      
      .performance-header h3 {
        margin: 0;
        font-size: 14px;
        font-weight: 600;
      }
      
      .performance-toggle {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        font-size: 16px;
        padding: 2px;
      }
      
      .performance-content {
        padding: 12px;
      }
      
      .performance-metrics {
        margin-bottom: 12px;
      }
      
      .metric {
        display: flex;
        justify-content: space-between;
        margin-bottom: 4px;
      }
      
      .metric-label {
        color: var(--text-secondary);
      }
      
      .metric-value {
        color: var(--text-primary);
        font-weight: 600;
      }
      
      .performance-actions {
        display: flex;
        gap: 4px;
        flex-wrap: wrap;
      }
      
      .btn-small {
        padding: 4px 8px;
        font-size: 10px;
        border: 1px solid var(--border-primary);
        background: var(--bg-secondary);
        color: var(--text-primary);
        border-radius: 4px;
        cursor: pointer;
        flex: 1;
      }
      
      .btn-small:hover {
        background: var(--bg-tertiary);
      }
      
      .hidden {
        display: none !important;
      }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(panel);
    
    // Bind events
    document.getElementById('performance-toggle').addEventListener('click', () => {
      document.getElementById('performance-content').classList.toggle('hidden');
    });
    
    document.getElementById('clear-cache-btn').addEventListener('click', () => {
      this.clearCache();
    });
    
    document.getElementById('force-gc-btn').addEventListener('click', () => {
      if (window.gc) {
        window.gc();
      } else {
        console.log('Garbage collection not available');
      }
    });
    
    document.getElementById('export-metrics-btn').addEventListener('click', () => {
      this.exportMetrics();
    });
  }
  
  updatePerformanceUI(report) {
    document.getElementById('metric-pageload').textContent = 
      `${Math.round(report.pageLoad)}ms`;
    
    document.getElementById('metric-interactions').textContent = 
      `${Math.round(report.interactions)}ms`;
    
    document.getElementById('metric-apicalls').textContent = 
      `${Math.round(report.apiCalls)}ms`;
    
    document.getElementById('metric-memory').textContent = 
      report.memory ? `${Math.round(report.memory.usedJSHeapSize / 1024 / 1024)}MB` : 'N/A';
    
    document.getElementById('metric-cache').textContent = 
      `${Math.round(report.cache.hitRate * 100)}%`;
  }
  
  exportMetrics() {
    const report = this.generatePerformanceReport();
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-report-${Date.now()}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
  }
  
  getResourceType(url) {
    const extension = url.split('.').pop().toLowerCase();
    const types = {
      js: 'script',
      css: 'stylesheet',
      png: 'image',
      jpg: 'image',
      jpeg: 'image',
      gif: 'image',
      svg: 'image',
      woff: 'font',
      woff2: 'font',
      ttf: 'font'
    };
    return types[extension] || 'other';
  }
  
  // Optimization recommendations
  getOptimizationRecommendations() {
    const recommendations = [];
    
    // Check cache hit rate
    const cacheHitRate = this.metrics.cacheHits / (this.metrics.cacheHits + this.metrics.cacheMisses) || 0;
    if (cacheHitRate < 0.8) {
      recommendations.push({
        type: 'caching',
        priority: 'medium',
        message: 'Low cache hit rate. Consider implementing better caching strategies.'
      });
    }
    
    // Check memory usage
    const memory = this.getMemoryUsage();
    if (memory && memory.usedJSHeapSize > this.config.performanceThresholds.memoryUsage) {
      recommendations.push({
        type: 'memory',
        priority: 'high',
        message: 'High memory usage detected. Check for memory leaks.'
      });
    }
    
    // Check page load times
    const avgLoadTime = this.getAverageMetric('pageLoad', 'duration');
    if (avgLoadTime > this.config.performanceThresholds.loadTime) {
      recommendations.push({
        type: 'performance',
        priority: 'high',
        message: 'Slow page load times. Consider optimizing resources.'
      });
    }
    
    return recommendations;
  }
  
  destroy() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    
    const panel = document.getElementById('performance-monitor');
    if (panel) panel.remove();
  }
}

// Performance optimization utilities
class PerformanceOptimizer {
  static debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
  
  static throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
  
  static lazy(fn) {
    let result;
    let computed = false;
    return function(...args) {
      if (!computed) {
        result = fn.apply(this, args);
        computed = true;
      }
      return result;
    };
  }
  
  static preloadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }
  
  static prefetchResource(url, type = 'fetch') {
    const link = document.createElement('link');
    link.rel = type === 'script' ? 'preload' : 'prefetch';
    link.href = url;
    if (type === 'script') link.as = 'script';
    if (type === 'style') link.as = 'style';
    document.head.appendChild(link);
  }
}

// Initialize performance monitoring
document.addEventListener('DOMContentLoaded', () => {
  window.performanceMonitor = new PerformanceMonitor();
  window.PerformanceOptimizer = PerformanceOptimizer;
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PerformanceMonitor, PerformanceOptimizer };
}