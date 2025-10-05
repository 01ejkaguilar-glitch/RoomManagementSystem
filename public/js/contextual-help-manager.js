// Contextual Help System
// Provides guided tours, tooltips, and in-app assistance

class ContextualHelpManager {
  constructor() {
    this.tours = new Map();
    this.tooltips = new Map();
    this.helpContent = new Map();
    this.currentTour = null;
    this.currentStep = 0;
    this.isHelpMode = false;
    this.userPreferences = JSON.parse(localStorage.getItem('helpPreferences') || '{}');
    
    this.init();
  }
  
  init() {
    this.addHelpStyles();
    this.createHelpInterface();
    this.setupEventListeners();
    this.loadHelpContent();
    this.setupKeyboardShortcuts();
    this.initializeTooltips();
  }
  
  // Add CSS styles for help system
  addHelpStyles() {
    const style = document.createElement('style');
    style.textContent = `
      /* Help system styles */
      .help-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 9998;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.3s ease, visibility 0.3s ease;
      }
      
      .help-overlay.visible {
        opacity: 1;
        visibility: visible;
      }
      
      .help-spotlight {
        position: absolute;
        background: rgba(255, 255, 255, 0.1);
        border: 2px solid #3b82f6;
        border-radius: 0.5rem;
        box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.7);
        z-index: 9999;
        transition: all 0.3s ease;
        pointer-events: none;
      }
      
      .help-tour-popup {
        position: absolute;
        background: white;
        border-radius: 0.75rem;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        max-width: 320px;
        min-width: 280px;
        z-index: 10000;
        animation: helpPopupIn 0.3s ease-out;
      }
      
      .help-tour-header {
        padding: 1.5rem 1.5rem 1rem 1.5rem;
        border-bottom: 1px solid #e5e7eb;
      }
      
      .help-tour-title {
        font-size: 1.125rem;
        font-weight: 600;
        color: #1f2937;
        margin: 0 0 0.5rem 0;
      }
      
      .help-tour-step {
        font-size: 0.875rem;
        color: #6b7280;
        margin: 0;
      }
      
      .help-tour-content {
        padding: 1rem 1.5rem;
      }
      
      .help-tour-description {
        color: #374151;
        line-height: 1.6;
        margin: 0 0 1rem 0;
      }
      
      .help-tour-actions {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem 1.5rem;
        background: #f9fafb;
        border-top: 1px solid #e5e7eb;
      }
      
      .help-tour-progress {
        display: flex;
        gap: 0.25rem;
      }
      
      .help-progress-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #d1d5db;
        transition: background-color 0.2s;
      }
      
      .help-progress-dot.active {
        background: #3b82f6;
      }
      
      .help-tour-buttons {
        display: flex;
        gap: 0.5rem;
      }
      
      .help-btn {
        padding: 0.5rem 1rem;
        border-radius: 0.375rem;
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
        border: 1px solid transparent;
      }
      
      .help-btn-secondary {
        background: transparent;
        color: #6b7280;
        border-color: #d1d5db;
      }
      
      .help-btn-secondary:hover {
        background: #f3f4f6;
        color: #374151;
      }
      
      .help-btn-primary {
        background: #3b82f6;
        color: white;
      }
      
      .help-btn-primary:hover {
        background: #2563eb;
      }
      
      /* Help button */
      .help-trigger {
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        width: 3.5rem;
        height: 3.5rem;
        background: #3b82f6;
        color: white;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
        z-index: 1000;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.25rem;
        transition: all 0.3s ease;
      }
      
      .help-trigger:hover {
        background: #2563eb;
        transform: scale(1.05);
        box-shadow: 0 8px 20px rgba(59, 130, 246, 0.5);
      }
      
      .help-trigger.pulse {
        animation: helpPulse 2s infinite;
      }
      
      /* Help menu */
      .help-menu {
        position: fixed;
        bottom: 6rem;
        right: 2rem;
        background: white;
        border-radius: 0.75rem;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        min-width: 250px;
        z-index: 1001;
        opacity: 0;
        visibility: hidden;
        transform: translateY(10px);
        transition: all 0.3s ease;
      }
      
      .help-menu.visible {
        opacity: 1;
        visibility: visible;
        transform: translateY(0);
      }
      
      .help-menu-header {
        padding: 1rem;
        border-bottom: 1px solid #e5e7eb;
      }
      
      .help-menu-title {
        font-size: 1rem;
        font-weight: 600;
        color: #1f2937;
        margin: 0;
      }
      
      .help-menu-items {
        padding: 0.5rem 0;
      }
      
      .help-menu-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem 1rem;
        color: #374151;
        text-decoration: none;
        cursor: pointer;
        transition: background-color 0.2s;
      }
      
      .help-menu-item:hover {
        background: #f3f4f6;
      }
      
      .help-menu-icon {
        width: 1.25rem;
        height: 1.25rem;
        color: #6b7280;
      }
      
      /* Tooltips */
      .help-tooltip {
        position: absolute;
        background: #1f2937;
        color: white;
        padding: 0.5rem 0.75rem;
        border-radius: 0.375rem;
        font-size: 0.875rem;
        z-index: 10001;
        opacity: 0;
        visibility: hidden;
        transition: all 0.2s ease;
        max-width: 200px;
        word-wrap: break-word;
      }
      
      .help-tooltip.visible {
        opacity: 1;
        visibility: visible;
      }
      
      .help-tooltip::after {
        content: '';
        position: absolute;
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        border: 4px solid transparent;
        border-top-color: #1f2937;
      }
      
      .help-tooltip.top::after {
        top: auto;
        bottom: 100%;
        border-top-color: transparent;
        border-bottom-color: #1f2937;
      }
      
      .help-tooltip.left::after {
        top: 50%;
        left: 100%;
        transform: translateY(-50%);
        border-top-color: transparent;
        border-left-color: #1f2937;
      }
      
      .help-tooltip.right::after {
        top: 50%;
        left: auto;
        right: 100%;
        transform: translateY(-50%);
        border-top-color: transparent;
        border-right-color: #1f2937;
      }
      
      /* Help mode overlay */
      .help-mode-indicator {
        position: fixed;
        top: 1rem;
        left: 50%;
        transform: translateX(-50%);
        background: #3b82f6;
        color: white;
        padding: 0.75rem 1.5rem;
        border-radius: 2rem;
        font-size: 0.875rem;
        font-weight: 500;
        z-index: 10002;
        display: none;
        animation: helpSlideDown 0.3s ease-out;
      }
      
      .help-mode-indicator.visible {
        display: block;
      }
      
      /* Interactive elements highlighting */
      .help-highlight {
        position: relative;
        z-index: 10000;
      }
      
      .help-highlight::after {
        content: '';
        position: absolute;
        top: -2px;
        left: -2px;
        right: -2px;
        bottom: -2px;
        border: 2px solid #3b82f6;
        border-radius: 0.375rem;
        background: rgba(59, 130, 246, 0.1);
        pointer-events: none;
        animation: helpGlow 2s infinite;
      }
      
      /* Animations */
      @keyframes helpPopupIn {
        from {
          opacity: 0;
          transform: scale(0.9) translateY(10px);
        }
        to {
          opacity: 1;
          transform: scale(1) translateY(0);
        }
      }
      
      @keyframes helpPulse {
        0%, 100% {
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
        }
        50% {
          box-shadow: 0 4px 20px rgba(59, 130, 246, 0.6);
        }
      }
      
      @keyframes helpSlideDown {
        from {
          transform: translateX(-50%) translateY(-100%);
          opacity: 0;
        }
        to {
          transform: translateX(-50%) translateY(0);
          opacity: 1;
        }
      }
      
      @keyframes helpGlow {
        0%, 100% {
          box-shadow: 0 0 5px rgba(59, 130, 246, 0.5);
        }
        50% {
          box-shadow: 0 0 15px rgba(59, 130, 246, 0.8);
        }
      }
      
      /* Mobile adjustments */
      @media (max-width: 768px) {
        .help-trigger {
          bottom: 1rem;
          right: 1rem;
          width: 3rem;
          height: 3rem;
        }
        
        .help-menu {
          bottom: 5rem;
          right: 1rem;
          left: 1rem;
          width: auto;
        }
        
        .help-tour-popup {
          max-width: calc(100vw - 2rem);
          left: 1rem !important;
          right: 1rem;
          width: auto;
        }
        
        .help-mode-indicator {
          left: 1rem;
          right: 1rem;
          transform: none;
          text-align: center;
        }
      }
      
      /* Accessibility */
      .help-element:focus {
        outline: 2px solid #3b82f6;
        outline-offset: 2px;
      }
      
      .help-skip-link {
        position: absolute;
        top: -40px;
        left: 6px;
        background: #3b82f6;
        color: white;
        padding: 8px;
        border-radius: 4px;
        text-decoration: none;
        z-index: 10003;
        transition: top 0.3s;
      }
      
      .help-skip-link:focus {
        top: 6px;
      }
    `;
    
    document.head.appendChild(style);
  }
  
  // Create help interface
  createHelpInterface() {
    // Help trigger button
    const helpTrigger = document.createElement('button');
    helpTrigger.id = 'help-trigger';
    helpTrigger.className = 'help-trigger';
    helpTrigger.innerHTML = '?';
    helpTrigger.setAttribute('aria-label', 'Open help menu');
    helpTrigger.setAttribute('title', 'Need help? Click here!');
    
    // Help menu
    const helpMenu = document.createElement('div');
    helpMenu.id = 'help-menu';
    helpMenu.className = 'help-menu';
    helpMenu.innerHTML = `
      <div class="help-menu-header">
        <h3 class="help-menu-title">Help & Support</h3>
      </div>
      <div class="help-menu-items">
        <div class="help-menu-item" data-action="start-tour">
          <svg class="help-menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
          </svg>
          <span>Take a tour</span>
        </div>
        <div class="help-menu-item" data-action="toggle-help-mode">
          <svg class="help-menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <span>Help mode</span>
        </div>
        <div class="help-menu-item" data-action="show-keyboard-shortcuts">
          <svg class="help-menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4"/>
          </svg>
          <span>Keyboard shortcuts</span>
        </div>
        <div class="help-menu-item" data-action="show-documentation">
          <svg class="help-menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
          </svg>
          <span>Documentation</span>
        </div>
        <div class="help-menu-item" data-action="contact-support">
          <svg class="help-menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
          </svg>
          <span>Contact support</span>
        </div>
      </div>
    `;
    
    // Help overlay
    const helpOverlay = document.createElement('div');
    helpOverlay.id = 'help-overlay';
    helpOverlay.className = 'help-overlay';
    
    // Help mode indicator
    const helpModeIndicator = document.createElement('div');
    helpModeIndicator.id = 'help-mode-indicator';
    helpModeIndicator.className = 'help-mode-indicator';
    helpModeIndicator.innerHTML = 'Help Mode Active - Click on any element to learn more';
    
    // Skip link for accessibility
    const skipLink = document.createElement('a');
    skipLink.className = 'help-skip-link';
    skipLink.href = '#main-content';
    skipLink.textContent = 'Skip to main content';
    
    // Add to DOM
    document.body.appendChild(helpTrigger);
    document.body.appendChild(helpMenu);
    document.body.appendChild(helpOverlay);
    document.body.appendChild(helpModeIndicator);
    document.body.appendChild(skipLink);
  }
  
  // Setup event listeners
  setupEventListeners() {
    // Help trigger click
    document.getElementById('help-trigger').addEventListener('click', () => {
      this.toggleHelpMenu();
    });
    
    // Help menu actions
    document.addEventListener('click', (e) => {
      const action = e.target.closest('[data-action]')?.dataset.action;
      if (action) {
        this.handleHelpAction(action);
      }
      
      // Close help menu when clicking outside
      if (!e.target.closest('#help-menu') && !e.target.closest('#help-trigger')) {
        this.hideHelpMenu();
      }
    });
    
    // Help mode interactions
    document.addEventListener('click', (e) => {
      if (this.isHelpMode && !e.target.closest('.help-')) {
        this.showContextualHelp(e.target);
        e.preventDefault();
        e.stopPropagation();
      }
    });
    
    // ESC to close help
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (this.currentTour) {
          this.endTour();
        } else if (this.isHelpMode) {
          this.toggleHelpMode();
        } else {
          this.hideHelpMenu();
        }
      }
    });
    
    // Tooltip events
    document.addEventListener('mouseenter', (e) => {
      if (e.target.hasAttribute('data-help-tooltip')) {
        this.showTooltip(e.target);
      }
    }, true);
    
    document.addEventListener('mouseleave', (e) => {
      if (e.target.hasAttribute('data-help-tooltip')) {
        this.hideTooltip(e.target);
      }
    }, true);
  }
  
  // Setup keyboard shortcuts
  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Alt + H to open help
      if (e.altKey && e.key === 'h') {
        e.preventDefault();
        this.toggleHelpMenu();
      }
      
      // Alt + T to start tour
      if (e.altKey && e.key === 't') {
        e.preventDefault();
        this.startTour();
      }
      
      // Alt + ? to toggle help mode
      if (e.altKey && e.key === '?') {
        e.preventDefault();
        this.toggleHelpMode();
      }
      
      // Arrow keys for tour navigation
      if (this.currentTour) {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          e.preventDefault();
          this.nextStep();
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          e.preventDefault();
          this.previousStep();
        }
      }
    });
  }
  
  // Load help content
  loadHelpContent() {
    // Define tours for different pages
    this.defineTours();
    
    // Add help tooltips to common elements
    this.addTooltips();
    
    // Check if user needs onboarding
    this.checkOnboarding();
  }
  
  // Define tours
  defineTours() {
    // Dashboard tour
    this.tours.set('dashboard', {
      title: 'Dashboard Tour',
      description: 'Learn how to navigate your dashboard',
      steps: [
        {
          target: '.sidebar-link[href="/dashboard"]',
          title: 'Navigation Sidebar',
          description: 'Use the sidebar to navigate between different sections of the system.',
          position: 'right'
        },
        {
          target: '.card:first-child',
          title: 'Statistics Cards',
          description: 'These cards show important metrics and statistics at a glance.',
          position: 'bottom'
        },
        {
          target: '[href="/colleges/new"]',
          title: 'Quick Actions',
          description: 'Use these buttons to quickly add new items to the system.',
          position: 'left'
        }
      ]
    });
    
    // Colleges tour
    this.tours.set('colleges', {
      title: 'Colleges Management',
      description: 'Learn how to manage colleges',
      steps: [
        {
          target: 'button[onclick*="openModal"]',
          title: 'Add New College',
          description: 'Click here to add a new college to the system.',
          position: 'bottom'
        },
        {
          target: '.card:first-child',
          title: 'College Cards',
          description: 'Each card represents a college with its details and actions.',
          position: 'top'
        }
      ]
    });
    
    // Add more tours as needed
  }
  
  // Add tooltips
  addTooltips() {
    const tooltipElements = [
      { selector: '.btn-primary', text: 'Primary action button' },
      { selector: '.search input', text: 'Search for specific items' },
      { selector: '.badge', text: 'Status indicator' },
      { selector: '.sidebar-link', text: 'Navigate to this section' }
    ];
    
    tooltipElements.forEach(({ selector, text }) => {
      document.querySelectorAll(selector).forEach(element => {
        if (!element.hasAttribute('data-help-tooltip')) {
          element.setAttribute('data-help-tooltip', text);
        }
      });
    });
  }
  
  // Check if user needs onboarding
  checkOnboarding() {
    const hasSeenTour = this.userPreferences.hasSeenTour;
    const isFirstVisit = !localStorage.getItem('rms-visited');
    
    if (!hasSeenTour || isFirstVisit) {
      setTimeout(() => {
        this.showOnboardingPrompt();
      }, 2000);
      
      localStorage.setItem('rms-visited', 'true');
    }
  }
  
  // Initialize tooltips
  initializeTooltips() {
    // Create tooltip element
    const tooltip = document.createElement('div');
    tooltip.id = 'help-tooltip';
    tooltip.className = 'help-tooltip';
    document.body.appendChild(tooltip);
  }
  
  // Toggle help menu
  toggleHelpMenu() {
    const menu = document.getElementById('help-menu');
    menu.classList.toggle('visible');
    
    // Pulse effect on first open
    if (!this.userPreferences.hasOpenedHelp) {
      this.userPreferences.hasOpenedHelp = true;
      this.savePreferences();
    }
  }
  
  // Hide help menu
  hideHelpMenu() {
    const menu = document.getElementById('help-menu');
    menu.classList.remove('visible');
  }
  
  // Handle help actions
  handleHelpAction(action) {
    this.hideHelpMenu();
    
    switch (action) {
      case 'start-tour':
        this.startTour();
        break;
      case 'toggle-help-mode':
        this.toggleHelpMode();
        break;
      case 'show-keyboard-shortcuts':
        this.showKeyboardShortcuts();
        break;
      case 'show-documentation':
        this.showDocumentation();
        break;
      case 'contact-support':
        this.contactSupport();
        break;
    }
  }
  
  // Start tour
  startTour(tourName) {
    if (!tourName) {
      // Determine tour based on current page
      const path = window.location.pathname;
      if (path.includes('dashboard')) tourName = 'dashboard';
      else if (path.includes('colleges')) tourName = 'colleges';
      else tourName = 'dashboard';
    }
    
    const tour = this.tours.get(tourName);
    if (!tour) return;
    
    this.currentTour = { ...tour, name: tourName };
    this.currentStep = 0;
    
    this.showOverlay();
    this.showTourStep();
    
    // Analytics
    this.trackEvent('tour_started', { tour: tourName });
  }
  
  // Show tour step
  showTourStep() {
    if (!this.currentTour) return;
    
    const step = this.currentTour.steps[this.currentStep];
    if (!step) return;
    
    const target = document.querySelector(step.target);
    if (!target) {
      console.warn('Tour target not found:', step.target);
      this.nextStep();
      return;
    }
    
    // Position spotlight
    this.positionSpotlight(target);
    
    // Show popup
    this.showTourPopup(step, target);
    
    // Scroll to element
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  
  // Position spotlight
  positionSpotlight(element) {
    let spotlight = document.getElementById('help-spotlight');
    if (!spotlight) {
      spotlight = document.createElement('div');
      spotlight.id = 'help-spotlight';
      spotlight.className = 'help-spotlight';
      document.body.appendChild(spotlight);
    }
    
    const rect = element.getBoundingClientRect();
    const padding = 10;
    
    spotlight.style.left = (rect.left - padding) + 'px';
    spotlight.style.top = (rect.top - padding) + 'px';
    spotlight.style.width = (rect.width + padding * 2) + 'px';
    spotlight.style.height = (rect.height + padding * 2) + 'px';
  }
  
  // Show tour popup
  showTourPopup(step, target) {
    let popup = document.getElementById('help-tour-popup');
    if (!popup) {
      popup = document.createElement('div');
      popup.id = 'help-tour-popup';
      popup.className = 'help-tour-popup';
      document.body.appendChild(popup);
    }
    
    const stepNumber = this.currentStep + 1;
    const totalSteps = this.currentTour.steps.length;
    
    popup.innerHTML = `
      <div class="help-tour-header">
        <h3 class="help-tour-title">${step.title}</h3>
        <p class="help-tour-step">Step ${stepNumber} of ${totalSteps}</p>
      </div>
      <div class="help-tour-content">
        <p class="help-tour-description">${step.description}</p>
      </div>
      <div class="help-tour-actions">
        <div class="help-tour-progress">
          ${Array.from({ length: totalSteps }, (_, i) => 
            `<div class="help-progress-dot ${i === this.currentStep ? 'active' : ''}"></div>`
          ).join('')}
        </div>
        <div class="help-tour-buttons">
          ${this.currentStep > 0 ? '<button class="help-btn help-btn-secondary" onclick="contextualHelpManager.previousStep()">Previous</button>' : ''}
          ${this.currentStep < totalSteps - 1 ? 
            '<button class="help-btn help-btn-primary" onclick="contextualHelpManager.nextStep()">Next</button>' :
            '<button class="help-btn help-btn-primary" onclick="contextualHelpManager.endTour()">Finish</button>'
          }
          <button class="help-btn help-btn-secondary" onclick="contextualHelpManager.endTour()">Skip</button>
        </div>
      </div>
    `;
    
    // Position popup
    this.positionPopup(popup, target, step.position);
  }
  
  // Position popup relative to target
  positionPopup(popup, target, position = 'bottom') {
    const rect = target.getBoundingClientRect();
    const popupRect = popup.getBoundingClientRect();
    const margin = 20;
    
    let left, top;
    
    switch (position) {
      case 'top':
        left = rect.left + rect.width / 2 - popupRect.width / 2;
        top = rect.top - popupRect.height - margin;
        break;
      case 'bottom':
        left = rect.left + rect.width / 2 - popupRect.width / 2;
        top = rect.bottom + margin;
        break;
      case 'left':
        left = rect.left - popupRect.width - margin;
        top = rect.top + rect.height / 2 - popupRect.height / 2;
        break;
      case 'right':
        left = rect.right + margin;
        top = rect.top + rect.height / 2 - popupRect.height / 2;
        break;
      default:
        left = rect.left + rect.width / 2 - popupRect.width / 2;
        top = rect.bottom + margin;
    }
    
    // Keep popup on screen
    left = Math.max(10, Math.min(left, window.innerWidth - popupRect.width - 10));
    top = Math.max(10, Math.min(top, window.innerHeight - popupRect.height - 10));
    
    popup.style.left = left + 'px';
    popup.style.top = top + 'px';
  }
  
  // Next step
  nextStep() {
    if (!this.currentTour) return;
    
    if (this.currentStep < this.currentTour.steps.length - 1) {
      this.currentStep++;
      this.showTourStep();
    } else {
      this.endTour();
    }
  }
  
  // Previous step
  previousStep() {
    if (!this.currentTour) return;
    
    if (this.currentStep > 0) {
      this.currentStep--;
      this.showTourStep();
    }
  }
  
  // End tour
  endTour() {
    if (this.currentTour) {
      this.trackEvent('tour_completed', { 
        tour: this.currentTour.name,
        completed_steps: this.currentStep + 1,
        total_steps: this.currentTour.steps.length
      });
    }
    
    this.currentTour = null;
    this.currentStep = 0;
    
    this.hideOverlay();
    this.removeTourElements();
    
    // Mark tour as seen
    this.userPreferences.hasSeenTour = true;
    this.savePreferences();
  }
  
  // Toggle help mode
  toggleHelpMode() {
    this.isHelpMode = !this.isHelpMode;
    
    const indicator = document.getElementById('help-mode-indicator');
    const trigger = document.getElementById('help-trigger');
    
    if (this.isHelpMode) {
      indicator.classList.add('visible');
      trigger.classList.add('pulse');
      this.highlightInteractiveElements();
      
      if (window.notificationManager) {
        window.notificationManager.show('Help mode activated - click on any element to learn more', 'info');
      }
    } else {
      indicator.classList.remove('visible');
      trigger.classList.remove('pulse');
      this.removeHighlights();
      
      if (window.notificationManager) {
        window.notificationManager.show('Help mode deactivated', 'info');
      }
    }
    
    this.trackEvent('help_mode_toggled', { active: this.isHelpMode });
  }
  
  // Show contextual help
  showContextualHelp(element) {
    const helpContent = this.getElementHelp(element);
    
    if (helpContent) {
      this.showHelpModal(helpContent);
    } else {
      if (window.notificationManager) {
        window.notificationManager.show('No help available for this element', 'warning');
      }
    }
  }
  
  // Get help content for element
  getElementHelp(element) {
    // Try to find help content based on element attributes or classes
    const selectors = [
      element.tagName.toLowerCase(),
      ...Array.from(element.classList),
      element.getAttribute('data-help-content')
    ].filter(Boolean);
    
    for (const selector of selectors) {
      if (this.helpContent.has(selector)) {
        return this.helpContent.get(selector);
      }
    }
    
    // Fallback to generic help based on element type
    return this.getGenericHelp(element);
  }
  
  // Get generic help for element
  getGenericHelp(element) {
    const tagName = element.tagName.toLowerCase();
    const role = element.getAttribute('role');
    
    const genericHelp = {
      'button': 'This is a button. Click it to perform an action.',
      'input': 'This is an input field. Enter text or data here.',
      'select': 'This is a dropdown menu. Click to see available options.',
      'a': 'This is a link. Click to navigate to another page.',
      'form': 'This is a form. Fill out the fields and submit.',
      'table': 'This is a data table. You can sort and filter the information.',
      'nav': 'This is a navigation area. Use it to move around the application.'
    };
    
    if (role && genericHelp[role]) {
      return { title: `${role} element`, description: genericHelp[role] };
    }
    
    if (genericHelp[tagName]) {
      return { title: `${tagName} element`, description: genericHelp[tagName] };
    }
    
    return null;
  }
  
  // Show/hide methods and utility functions continue...
  
  // Show overlay
  showOverlay() {
    const overlay = document.getElementById('help-overlay');
    overlay.classList.add('visible');
  }
  
  // Hide overlay
  hideOverlay() {
    const overlay = document.getElementById('help-overlay');
    overlay.classList.remove('visible');
  }
  
  // Remove tour elements
  removeTourElements() {
    const elements = ['help-spotlight', 'help-tour-popup'];
    elements.forEach(id => {
      const element = document.getElementById(id);
      if (element) element.remove();
    });
  }
  
  // Highlight interactive elements
  highlightInteractiveElements() {
    const interactiveElements = document.querySelectorAll('button, a, input, select, textarea, [role="button"], [onclick]');
    interactiveElements.forEach(element => {
      element.classList.add('help-highlight');
    });
  }
  
  // Remove highlights
  removeHighlights() {
    document.querySelectorAll('.help-highlight').forEach(element => {
      element.classList.remove('help-highlight');
    });
  }
  
  // Show tooltip
  showTooltip(element) {
    const tooltip = document.getElementById('help-tooltip');
    const text = element.getAttribute('data-help-tooltip');
    
    if (!text) return;
    
    tooltip.textContent = text;
    tooltip.classList.add('visible');
    
    // Position tooltip
    const rect = element.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    
    let left = rect.left + rect.width / 2 - tooltipRect.width / 2;
    let top = rect.top - tooltipRect.height - 10;
    
    // Adjust if off screen
    if (left < 10) left = 10;
    if (left + tooltipRect.width > window.innerWidth - 10) {
      left = window.innerWidth - tooltipRect.width - 10;
    }
    if (top < 10) {
      top = rect.bottom + 10;
      tooltip.classList.add('top');
    }
    
    tooltip.style.left = left + 'px';
    tooltip.style.top = top + 'px';
  }
  
  // Hide tooltip
  hideTooltip() {
    const tooltip = document.getElementById('help-tooltip');
    tooltip.classList.remove('visible', 'top');
  }
  
  // Save preferences
  savePreferences() {
    localStorage.setItem('helpPreferences', JSON.stringify(this.userPreferences));
  }
  
  // Track events
  trackEvent(eventName, properties = {}) {
    if (window.performanceMonitor) {
      window.performanceMonitor.trackEvent('help_system', eventName, properties);
    }
    console.log('Help event:', eventName, properties);
  }
  
  // Show onboarding prompt
  showOnboardingPrompt() {
    if (window.notificationManager) {
      window.notificationManager.show(
        'Welcome! Click the help button (?) to take a tour of the system.', 
        'info',
        { duration: 5000 }
      );
    }
    
    // Pulse the help button
    const trigger = document.getElementById('help-trigger');
    trigger.classList.add('pulse');
    
    setTimeout(() => {
      trigger.classList.remove('pulse');
    }, 5000);
  }
  
  // Public API methods
  showKeyboardShortcuts() {
    const shortcuts = [
      'Alt + H: Open help menu',
      'Alt + T: Start tour',
      'Alt + ?: Toggle help mode',
      'ESC: Close help/tour',
      'Arrow keys: Navigate tour steps'
    ];
    
    if (window.modalSystem) {
      window.modalSystem.show({
        title: 'Keyboard Shortcuts',
        content: `<ul class="space-y-2">${shortcuts.map(s => `<li class="flex items-center gap-2"><kbd class="px-2 py-1 bg-gray-100 rounded text-sm">${s.split(':')[0]}</kbd><span>${s.split(':')[1]}</span></li>`).join('')}</ul>`,
        size: 'medium'
      });
    }
  }
  
  showDocumentation() {
    window.open('/docs', '_blank');
  }
  
  contactSupport() {
    if (window.modalSystem) {
      window.modalSystem.show({
        title: 'Contact Support',
        content: `
          <div class="space-y-4">
            <p>Need help? We're here to assist you!</p>
            <div class="space-y-2">
              <p><strong>Email:</strong> support@minsu-rms.edu</p>
              <p><strong>Phone:</strong> +63 (43) 123-4567</p>
              <p><strong>Hours:</strong> Monday - Friday, 8:00 AM - 5:00 PM</p>
            </div>
            <div class="mt-4">
              <button class="btn btn-primary" onclick="window.location.href='mailto:support@minsu-rms.edu'">
                Send Email
              </button>
            </div>
          </div>
        `,
        size: 'medium'
      });
    }
  }
}

// Initialize contextual help manager
window.contextualHelpManager = new ContextualHelpManager();

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ContextualHelpManager;
}