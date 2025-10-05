// Mobile Navigation Enhancement System
// Provides responsive navigation with hamburger menu and mobile optimizations

class MobileNavigationManager {
  constructor() {
    this.isMenuOpen = false;
    this.breakpoint = 768; // md breakpoint
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.touchEndX = 0;
    this.touchEndY = 0;
    this.swipeThreshold = 50;
    
    this.init();
  }
  
  init() {
    this.addMobileStyles();
    this.createHamburgerMenu();
    this.setupEventListeners();
    this.setupSwipeGestures();
    this.setupResizeHandler();
    this.optimizeForMobile();
  }
  
  // Add mobile-specific styles
  addMobileStyles() {
    const style = document.createElement('style');
    style.textContent = `
      /* Mobile navigation styles */
      .mobile-nav-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 40;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.3s ease, visibility 0.3s ease;
      }
      
      .mobile-nav-overlay.visible {
        opacity: 1;
        visibility: visible;
      }
      
      .hamburger-menu {
        display: none;
        flex-direction: column;
        justify-content: center;
        width: 2rem;
        height: 2rem;
        background: transparent;
        border: none;
        cursor: pointer;
        padding: 0;
        z-index: 50;
        position: relative;
      }
      
      .hamburger-line {
        width: 100%;
        height: 2px;
        background: currentColor;
        border-radius: 1px;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        transform-origin: center;
      }
      
      .hamburger-line:not(:last-child) {
        margin-bottom: 4px;
      }
      
      /* Hamburger animation */
      .hamburger-menu.active .hamburger-line:nth-child(1) {
        transform: translateY(6px) rotate(45deg);
      }
      
      .hamburger-menu.active .hamburger-line:nth-child(2) {
        opacity: 0;
        transform: translateX(-10px);
      }
      
      .hamburger-menu.active .hamburger-line:nth-child(3) {
        transform: translateY(-6px) rotate(-45deg);
      }
      
      /* Mobile sidebar */
      @media (max-width: 767px) {
        .mobile-sidebar {
          position: fixed;
          top: 0;
          left: 0;
          width: 280px;
          height: 100vh;
          background: #2C5D2B;
          transform: translateX(-100%);
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 45;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
        }
        
        .mobile-sidebar.visible {
          transform: translateX(0);
        }
        
        .hamburger-menu {
          display: flex;
        }
        
        .desktop-sidebar {
          display: none;
        }
        
        .main-content {
          margin-left: 0 !important;
        }
        
        /* Mobile header adjustments */
        .mobile-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem;
          background: white;
          border-bottom: 1px solid #e2e8f0;
          position: sticky;
          top: 0;
          z-index: 30;
        }
        
        .mobile-header h1 {
          font-size: 1.125rem;
          font-weight: 600;
          margin: 0;
        }
        
        /* Mobile navigation items */
        .mobile-nav-item {
          display: block;
          color: white;
          text-decoration: none;
          padding: 1rem 1.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          transition: background-color 0.2s;
          position: relative;
        }
        
        .mobile-nav-item:hover,
        .mobile-nav-item.active {
          background: rgba(255, 255, 255, 0.1);
        }
        
        .mobile-nav-item.active::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 4px;
          background: #F4B400;
        }
        
        .mobile-nav-icon {
          width: 1.25rem;
          height: 1.25rem;
          margin-right: 0.75rem;
          display: inline-block;
          vertical-align: middle;
        }
        
        .mobile-nav-text {
          vertical-align: middle;
        }
        
        /* Mobile search */
        .mobile-search {
          padding: 1rem 1.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .mobile-search input {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 0.375rem;
          background: rgba(255, 255, 255, 0.1);
          color: white;
          placeholder-color: rgba(255, 255, 255, 0.7);
        }
        
        .mobile-search input::placeholder {
          color: rgba(255, 255, 255, 0.7);
        }
        
        /* Mobile user menu */
        .mobile-user-menu {
          padding: 1rem 1.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          margin-top: auto;
        }
        
        .mobile-user-info {
          display: flex;
          align-items: center;
          color: white;
          margin-bottom: 1rem;
        }
        
        .mobile-user-avatar {
          width: 2.5rem;
          height: 2.5rem;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 0.75rem;
          font-weight: 600;
        }
        
        .mobile-user-actions {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .mobile-user-action {
          color: rgba(255, 255, 255, 0.9);
          text-decoration: none;
          padding: 0.5rem 0;
          font-size: 0.875rem;
          transition: color 0.2s;
        }
        
        .mobile-user-action:hover {
          color: white;
        }
        
        /* Swipe indicator */
        .swipe-indicator {
          position: absolute;
          left: 100%;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(0, 0, 0, 0.3);
          color: white;
          padding: 0.5rem;
          border-radius: 0 0.375rem 0.375rem 0;
          font-size: 0.75rem;
          opacity: 0;
          transition: opacity 0.3s;
          pointer-events: none;
        }
        
        .mobile-sidebar:hover .swipe-indicator {
          opacity: 1;
        }
        
        /* Bottom navigation alternative */
        .bottom-nav {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: white;
          border-top: 1px solid #e2e8f0;
          display: none;
          z-index: 40;
          padding: 0.5rem 0;
        }
        
        .bottom-nav.visible {
          display: flex;
        }
        
        .bottom-nav-item {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 0.5rem;
          text-decoration: none;
          color: #6b7280;
          transition: color 0.2s;
        }
        
        .bottom-nav-item.active {
          color: #2C5D2B;
        }
        
        .bottom-nav-icon {
          width: 1.5rem;
          height: 1.5rem;
          margin-bottom: 0.25rem;
        }
        
        .bottom-nav-label {
          font-size: 0.75rem;
          font-weight: 500;
        }
        
        /* Touch targets */
        .touch-target {
          min-height: 44px;
          min-width: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        /* Mobile table enhancements */
        .mobile-table-container {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }
        
        .mobile-table {
          min-width: 100%;
          white-space: nowrap;
        }
        
        .mobile-card-view {
          display: none;
        }
        
        /* Show card view on very small screens */
        @media (max-width: 480px) {
          .mobile-table-container {
            display: none;
          }
          
          .mobile-card-view {
            display: block;
          }
        }
      }
      
      /* Tablet adjustments */
      @media (min-width: 768px) and (max-width: 1023px) {
        .desktop-sidebar {
          width: 200px;
        }
        
        .main-content {
          margin-left: 200px;
        }
      }
      
      /* Safe area handling for notch devices */
      @supports (padding: max(0px)) {
        .mobile-sidebar,
        .mobile-header,
        .bottom-nav {
          padding-left: max(1rem, env(safe-area-inset-left));
          padding-right: max(1rem, env(safe-area-inset-right));
        }
        
        .bottom-nav {
          padding-bottom: max(0.5rem, env(safe-area-inset-bottom));
        }
      }
    `;
    
    document.head.appendChild(style);
  }
  
  // Create hamburger menu and mobile navigation
  createHamburgerMenu() {
    // Add hamburger button to header
    const header = document.querySelector('header');
    if (header) {
      const hamburgerHtml = `
        <button class="hamburger-menu" id="mobile-menu-toggle" aria-label="Toggle navigation menu">
          <span class="hamburger-line"></span>
          <span class="hamburger-line"></span>
          <span class="hamburger-line"></span>
        </button>
      `;
      
      header.insertAdjacentHTML('afterbegin', hamburgerHtml);
    }
    
    // Create mobile sidebar
    this.createMobileSidebar();
    
    // Create mobile overlay
    const overlay = document.createElement('div');
    overlay.className = 'mobile-nav-overlay';
    overlay.id = 'mobile-nav-overlay';
    document.body.appendChild(overlay);
  }
  
  // Create mobile sidebar
  createMobileSidebar() {
    const existingSidebar = document.querySelector('aside');
    if (!existingSidebar) return;
    
    // Mark existing sidebar as desktop
    existingSidebar.classList.add('desktop-sidebar');
    
    // Create mobile version
    const mobileSidebarHtml = `
      <nav class="mobile-sidebar" id="mobile-sidebar">
        <div class="mobile-nav-header">
          <div class="px-4 py-5 text-lg font-semibold tracking-wide flex items-center gap-2">
            <span class="text-highlight">MinSU</span> RMS
          </div>
        </div>
        
        <div class="mobile-search">
          <input type="search" placeholder="Search..." class="mobile-search-input">
        </div>
        
        <div class="mobile-nav-items">
          <a href="/dashboard" class="mobile-nav-item ${this.isActivePage('dashboard') ? 'active' : ''}">
            <svg class="mobile-nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2v0a2 2 0 012 2z"/>
            </svg>
            <span class="mobile-nav-text">Dashboard</span>
          </a>
          
          <a href="/colleges" class="mobile-nav-item ${this.isActivePage('colleges') ? 'active' : ''}">
            <svg class="mobile-nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
            </svg>
            <span class="mobile-nav-text">Colleges</span>
          </a>
          
          <a href="/buildings" class="mobile-nav-item ${this.isActivePage('buildings') ? 'active' : ''}">
            <svg class="mobile-nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
            </svg>
            <span class="mobile-nav-text">Buildings</span>
          </a>
          
          <a href="/rooms" class="mobile-nav-item ${this.isActivePage('rooms') ? 'active' : ''}">
            <svg class="mobile-nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10v11M20 10v11"/>
            </svg>
            <span class="mobile-nav-text">Rooms</span>
          </a>
          
          <a href="/schedules" class="mobile-nav-item ${this.isActivePage('schedules') ? 'active' : ''}">
            <svg class="mobile-nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v16a2 2 0 002 2z"/>
            </svg>
            <span class="mobile-nav-text">Schedules</span>
          </a>
          
          <a href="/calendar" class="mobile-nav-item ${this.isActivePage('calendar') ? 'active' : ''}">
            <svg class="mobile-nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v16a2 2 0 002 2z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11l-4 4-2-2"/>
            </svg>
            <span class="mobile-nav-text">Calendar</span>
          </a>
          
          <a href="/analytics" class="mobile-nav-item ${this.isActivePage('analytics') ? 'active' : ''}">
            <svg class="mobile-nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
            </svg>
            <span class="mobile-nav-text">Analytics</span>
          </a>
        </div>
        
        <div class="mobile-user-menu">
          <div class="mobile-user-info">
            <div class="mobile-user-avatar">U</div>
            <div>
              <div class="font-medium">User</div>
              <div class="text-xs opacity-75">Administrator</div>
            </div>
          </div>
          
          <div class="mobile-user-actions">
            <a href="/settings" class="mobile-user-action">Settings</a>
            <a href="/logout" class="mobile-user-action">Logout</a>
          </div>
        </div>
        
        <div class="swipe-indicator">
          Swipe to close
        </div>
      </nav>
    `;
    
    document.body.insertAdjacentHTML('beforeend', mobileSidebarHtml);
  }
  
  // Setup event listeners
  setupEventListeners() {
    // Hamburger menu toggle
    const menuToggle = document.getElementById('mobile-menu-toggle');
    if (menuToggle) {
      menuToggle.addEventListener('click', () => this.toggleMobileMenu());
    }
    
    // Overlay click to close
    const overlay = document.getElementById('mobile-nav-overlay');
    if (overlay) {
      overlay.addEventListener('click', () => this.closeMobileMenu());
    }
    
    // ESC key to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isMenuOpen) {
        this.closeMobileMenu();
      }
    });
    
    // Mobile navigation clicks
    document.addEventListener('click', (e) => {
      if (e.target.matches('.mobile-nav-item')) {
        // Close menu after navigation (with slight delay for UX)
        setTimeout(() => this.closeMobileMenu(), 150);
      }
    });
  }
  
  // Setup swipe gestures
  setupSwipeGestures() {
    const mobileSidebar = document.getElementById('mobile-sidebar');
    if (!mobileSidebar) return;
    
    // Touch events for swipe to close
    mobileSidebar.addEventListener('touchstart', (e) => {
      this.touchStartX = e.changedTouches[0].screenX;
      this.touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });
    
    mobileSidebar.addEventListener('touchend', (e) => {
      this.touchEndX = e.changedTouches[0].screenX;
      this.touchEndY = e.changedTouches[0].screenY;
      this.handleSwipeGesture();
    }, { passive: true });
    
    // Swipe from edge to open menu
    document.addEventListener('touchstart', (e) => {
      if (window.innerWidth <= this.breakpoint && !this.isMenuOpen) {
        const touch = e.changedTouches[0];
        if (touch.clientX < 20) { // Edge detection
          this.touchStartX = touch.screenX;
          this.touchStartY = touch.screenY;
        }
      }
    }, { passive: true });
    
    document.addEventListener('touchend', (e) => {
      if (window.innerWidth <= this.breakpoint && !this.isMenuOpen) {
        const touch = e.changedTouches[0];
        this.touchEndX = touch.screenX;
        this.touchEndY = touch.screenY;
        
        const deltaX = this.touchEndX - this.touchStartX;
        const deltaY = Math.abs(this.touchEndY - this.touchStartY);
        
        // Swipe right from left edge
        if (deltaX > this.swipeThreshold && deltaY < this.swipeThreshold) {
          this.openMobileMenu();
        }
      }
    }, { passive: true });
  }
  
  // Handle swipe gestures
  handleSwipeGesture() {
    const deltaX = this.touchEndX - this.touchStartX;
    const deltaY = Math.abs(this.touchEndY - this.touchStartY);
    
    // Swipe left to close menu
    if (deltaX < -this.swipeThreshold && deltaY < this.swipeThreshold) {
      this.closeMobileMenu();
    }
  }
  
  // Setup resize handler
  setupResizeHandler() {
    let resizeTimeout;
    
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (window.innerWidth > this.breakpoint && this.isMenuOpen) {
          this.closeMobileMenu();
        }
        this.updateViewport();
      }, 150);
    });
    
    // Initial viewport update
    this.updateViewport();
  }
  
  // Update viewport meta tag for mobile
  updateViewport() {
    let viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport) {
      viewport = document.createElement('meta');
      viewport.name = 'viewport';
      document.head.appendChild(viewport);
    }
    
    viewport.content = 'width=device-width, initial-scale=1.0, viewport-fit=cover';
  }
  
  // Optimize interface for mobile
  optimizeForMobile() {
    // Add touch-friendly classes
    document.querySelectorAll('button, .btn, a').forEach(element => {
      if (!element.classList.contains('touch-target')) {
        element.classList.add('touch-target');
      }
    });
    
    // Optimize tables for mobile
    this.optimizeTablesForMobile();
    
    // Add mobile-specific behaviors
    this.addMobileBehaviors();
  }
  
  // Optimize tables for mobile viewing
  optimizeTablesForMobile() {
    document.querySelectorAll('table').forEach(table => {
      if (!table.closest('.mobile-table-container')) {
        const container = document.createElement('div');
        container.className = 'mobile-table-container';
        table.parentNode.insertBefore(container, table);
        container.appendChild(table);
        table.classList.add('mobile-table');
      }
      
      // Create mobile card view
      this.createMobileCardView(table);
    });
  }
  
  // Create mobile card view for tables
  createMobileCardView(table) {
    const headers = Array.from(table.querySelectorAll('thead th')).map(th => th.textContent.trim());
    const rows = Array.from(table.querySelectorAll('tbody tr'));
    
    const cardViewHtml = `
      <div class="mobile-card-view">
        ${rows.map(row => {
          const cells = Array.from(row.querySelectorAll('td'));
          return `
            <div class="card mb-4">
              ${cells.map((cell, index) => {
                if (headers[index] && cell.textContent.trim()) {
                  return `
                    <div class="flex justify-between py-2 border-b border-gray-100 last:border-b-0">
                      <span class="font-medium text-gray-600">${headers[index]}:</span>
                      <span class="text-right">${cell.innerHTML}</span>
                    </div>
                  `;
                }
                return '';
              }).join('')}
            </div>
          `;
        }).join('')}
      </div>
    `;
    
    table.parentNode.insertAdjacentHTML('beforeend', cardViewHtml);
  }
  
  // Add mobile-specific behaviors
  addMobileBehaviors() {
    // Prevent zoom on input focus (iOS)
    document.querySelectorAll('input, select, textarea').forEach(input => {
      if (input.style.fontSize === '') {
        input.style.fontSize = '16px';
      }
    });
    
    // Add haptic feedback for touch devices
    if ('vibrate' in navigator) {
      document.addEventListener('click', (e) => {
        if (e.target.matches('button, .btn')) {
          navigator.vibrate(10); // Short vibration
        }
      });
    }
    
    // Optimize scroll behavior
    document.documentElement.style.webkitTextSizeAdjust = '100%';
    document.documentElement.style.textSizeAdjust = '100%';
  }
  
  // Toggle mobile menu
  toggleMobileMenu() {
    if (this.isMenuOpen) {
      this.closeMobileMenu();
    } else {
      this.openMobileMenu();
    }
  }
  
  // Open mobile menu
  openMobileMenu() {
    this.isMenuOpen = true;
    
    const sidebar = document.getElementById('mobile-sidebar');
    const overlay = document.getElementById('mobile-nav-overlay');
    const toggle = document.getElementById('mobile-menu-toggle');
    
    if (sidebar) sidebar.classList.add('visible');
    if (overlay) overlay.classList.add('visible');
    if (toggle) toggle.classList.add('active');
    
    // Prevent body scrolling
    document.body.style.overflow = 'hidden';
    
    // Focus trap
    this.trapFocus(sidebar);
    
    // Announce to screen readers
    this.announceToScreenReader('Navigation menu opened');
  }
  
  // Close mobile menu
  closeMobileMenu() {
    this.isMenuOpen = false;
    
    const sidebar = document.getElementById('mobile-sidebar');
    const overlay = document.getElementById('mobile-nav-overlay');
    const toggle = document.getElementById('mobile-menu-toggle');
    
    if (sidebar) sidebar.classList.remove('visible');
    if (overlay) overlay.classList.remove('visible');
    if (toggle) toggle.classList.remove('active');
    
    // Restore body scrolling
    document.body.style.overflow = '';
    
    // Return focus
    if (toggle) toggle.focus();
    
    // Announce to screen readers
    this.announceToScreenReader('Navigation menu closed');
  }
  
  // Focus trap for accessibility
  trapFocus(element) {
    const focusableElements = element.querySelectorAll(
      'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select'
    );
    const firstFocusableElement = focusableElements[0];
    const lastFocusableElement = focusableElements[focusableElements.length - 1];
    
    element.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstFocusableElement) {
            lastFocusableElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastFocusableElement) {
            firstFocusableElement.focus();
            e.preventDefault();
          }
        }
      }
    });
    
    firstFocusableElement?.focus();
  }
  
  // Announce to screen readers
  announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }
  
  // Check if page is active
  isActivePage(page) {
    return window.location.pathname.includes(page);
  }
  
  // Public API methods
  isMobileView() {
    return window.innerWidth <= this.breakpoint;
  }
  
  getCurrentOrientation() {
    return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
  }
}

// Initialize mobile navigation
window.mobileNavigationManager = new MobileNavigationManager();

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MobileNavigationManager;
}