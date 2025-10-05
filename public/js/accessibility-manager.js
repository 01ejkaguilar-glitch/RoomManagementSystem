// Accessibility Enhancement System
// Provides WCAG 2.1 compliance and enhanced user experience features

class AccessibilityManager {
  constructor() {
    this.isHighContrast = localStorage.getItem('highContrast') === 'true';
    this.fontSize = localStorage.getItem('fontSize') || 'normal';
    this.reducedMotion = localStorage.getItem('reducedMotion') === 'true';
    this.keyboardNavigation = true;
    
    this.init();
  }
  
  init() {
    this.applyStoredPreferences();
    this.setupKeyboardNavigation();
    this.setupFocusManagement();
    this.setupARIAEnhancements();
    this.setupScreenReaderSupport();
    this.addAccessibilityControls();
  }
  
  // Apply stored accessibility preferences
  applyStoredPreferences() {
    if (this.isHighContrast) {
      document.body.classList.add('high-contrast');
    }
    
    document.body.classList.add(`font-size-${this.fontSize}`);
    
    if (this.reducedMotion) {
      document.body.classList.add('reduced-motion');
    }
  }
  
  // Setup keyboard navigation
  setupKeyboardNavigation() {
    // Add visible focus indicators
    this.addFocusStyles();
    
    // Handle tab navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        document.body.classList.add('keyboard-navigation');
      }
      
      // ESC key handling
      if (e.key === 'Escape') {
        this.handleEscapeKey();
      }
      
      // Arrow key navigation for components
      this.handleArrowNavigation(e);
    });
    
    // Remove keyboard navigation class on mouse use
    document.addEventListener('mousedown', () => {
      document.body.classList.remove('keyboard-navigation');
    });
  }
  
  // Setup focus management
  setupFocusManagement() {
    // Focus trap for modals
    this.setupModalFocusTrap();
    
    // Skip links
    this.addSkipLinks();
    
    // Focus indicators
    this.enhanceFocusIndicators();
  }
  
  // Setup ARIA enhancements
  setupARIAEnhancements() {
    // Add ARIA labels to interactive elements
    this.addARIALabels();
    
    // Setup live regions for dynamic content
    this.setupLiveRegions();
    
    // Add ARIA states and properties
    this.enhanceARIAStates();
  }
  
  // Setup screen reader support
  setupScreenReaderSupport() {
    // Add screen reader only text
    this.addScreenReaderText();
    
    // Announce dynamic changes
    this.setupAnnouncementSystem();
  }
  
  // Add accessibility control panel
  addAccessibilityControls() {
    const controlPanel = document.createElement('div');
    controlPanel.id = 'accessibility-controls';
    controlPanel.className = 'accessibility-controls';
    controlPanel.setAttribute('role', 'region');
    controlPanel.setAttribute('aria-label', 'Accessibility Controls');
    
    controlPanel.innerHTML = `
      <button class="accessibility-toggle" aria-label="Open accessibility options" title="Accessibility Options">
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0v-.5A1.5 1.5 0 0114.5 6c.526 0 .988-.27 1.256-.679a6.012 6.012 0 011.912 2.706A8.02 8.02 0 0117 10a8.02 8.02 0 01-.332 2.027z" clip-rule="evenodd"></path>
        </svg>
      </button>
      
      <div class="accessibility-panel hidden">
        <h3>Accessibility Options</h3>
        
        <div class="accessibility-option">
          <label>
            <input type="checkbox" ${this.isHighContrast ? 'checked' : ''} id="high-contrast-toggle">
            High Contrast Mode
          </label>
        </div>
        
        <div class="accessibility-option">
          <label for="font-size-select">Font Size:</label>
          <select id="font-size-select">
            <option value="small" ${this.fontSize === 'small' ? 'selected' : ''}>Small</option>
            <option value="normal" ${this.fontSize === 'normal' ? 'selected' : ''}>Normal</option>
            <option value="large" ${this.fontSize === 'large' ? 'selected' : ''}>Large</option>
            <option value="extra-large" ${this.fontSize === 'extra-large' ? 'selected' : ''}>Extra Large</option>
          </select>
        </div>
        
        <div class="accessibility-option">
          <label>
            <input type="checkbox" ${this.reducedMotion ? 'checked' : ''} id="reduced-motion-toggle">
            Reduce Motion
          </label>
        </div>
        
        <div class="accessibility-option">
          <button id="reset-accessibility" class="btn btn-secondary">Reset to Defaults</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(controlPanel);
    this.bindAccessibilityControls();
  }
  
  // Bind accessibility control events
  bindAccessibilityControls() {
    const toggle = document.querySelector('.accessibility-toggle');
    const panel = document.querySelector('.accessibility-panel');
    
    toggle.addEventListener('click', () => {
      const isHidden = panel.classList.contains('hidden');
      panel.classList.toggle('hidden');
      toggle.setAttribute('aria-expanded', !isHidden);
    });
    
    // High contrast toggle
    document.getElementById('high-contrast-toggle').addEventListener('change', (e) => {
      this.toggleHighContrast(e.target.checked);
    });
    
    // Font size selector
    document.getElementById('font-size-select').addEventListener('change', (e) => {
      this.changeFontSize(e.target.value);
    });
    
    // Reduced motion toggle
    document.getElementById('reduced-motion-toggle').addEventListener('change', (e) => {
      this.toggleReducedMotion(e.target.checked);
    });
    
    // Reset button
    document.getElementById('reset-accessibility').addEventListener('click', () => {
      this.resetAccessibilitySettings();
    });
  }
  
  // Toggle high contrast mode
  toggleHighContrast(enabled) {
    this.isHighContrast = enabled;
    document.body.classList.toggle('high-contrast', enabled);
    localStorage.setItem('highContrast', enabled);
    this.announce(`High contrast mode ${enabled ? 'enabled' : 'disabled'}`);
  }
  
  // Change font size
  changeFontSize(size) {
    // Remove existing font size classes
    document.body.classList.remove('font-size-small', 'font-size-normal', 'font-size-large', 'font-size-extra-large');
    
    this.fontSize = size;
    document.body.classList.add(`font-size-${size}`);
    localStorage.setItem('fontSize', size);
    this.announce(`Font size changed to ${size}`);
  }
  
  // Toggle reduced motion
  toggleReducedMotion(enabled) {
    this.reducedMotion = enabled;
    document.body.classList.toggle('reduced-motion', enabled);
    localStorage.setItem('reducedMotion', enabled);
    this.announce(`Reduced motion ${enabled ? 'enabled' : 'disabled'}`);
  }
  
  // Reset accessibility settings
  resetAccessibilitySettings() {
    this.toggleHighContrast(false);
    this.changeFontSize('normal');
    this.toggleReducedMotion(false);
    
    // Update form controls
    document.getElementById('high-contrast-toggle').checked = false;
    document.getElementById('font-size-select').value = 'normal';
    document.getElementById('reduced-motion-toggle').checked = false;
    
    this.announce('Accessibility settings reset to defaults');
  }
  
  // Add focus styles
  addFocusStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .keyboard-navigation *:focus {
        outline: 2px solid #3b82f6 !important;
        outline-offset: 2px !important;
      }
      
      .high-contrast {
        filter: contrast(150%);
      }
      
      .high-contrast .btn-primary {
        background-color: #000 !important;
        color: #fff !important;
        border: 2px solid #fff !important;
      }
      
      .font-size-small { font-size: 0.875em; }
      .font-size-normal { font-size: 1em; }
      .font-size-large { font-size: 1.125em; }
      .font-size-extra-large { font-size: 1.25em; }
      
      .reduced-motion * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
      
      .accessibility-controls {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 1000;
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
        border: 1px solid #e5e7eb;
      }
      
      .accessibility-toggle {
        padding: 8px;
        border: none;
        background: #3b82f6;
        color: white;
        border-radius: 8px;
        cursor: pointer;
      }
      
      .accessibility-panel {
        position: absolute;
        top: 100%;
        right: 0;
        margin-top: 8px;
        padding: 16px;
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
        min-width: 250px;
      }
      
      .accessibility-option {
        margin-bottom: 12px;
      }
      
      .accessibility-option label {
        display: block;
        font-weight: 500;
        margin-bottom: 4px;
      }
      
      .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      }
    `;
    document.head.appendChild(style);
  }
  
  // Handle escape key
  handleEscapeKey() {
    // Close modals
    const openModals = document.querySelectorAll('.modal:not(.hidden)');
    openModals.forEach(modal => {
      if (typeof closeModal === 'function') {
        closeModal(modal.id);
      }
    });
    
    // Close accessibility panel
    const panel = document.querySelector('.accessibility-panel');
    if (panel && !panel.classList.contains('hidden')) {
      panel.classList.add('hidden');
      document.querySelector('.accessibility-toggle').setAttribute('aria-expanded', 'false');
    }
  }
  
  // Handle arrow key navigation
  handleArrowNavigation(e) {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      const focusableElements = this.getFocusableElements();
      const currentIndex = focusableElements.indexOf(document.activeElement);
      
      if (currentIndex !== -1) {
        let nextIndex;
        
        switch (e.key) {
          case 'ArrowDown':
          case 'ArrowRight':
            nextIndex = (currentIndex + 1) % focusableElements.length;
            break;
          case 'ArrowUp':
          case 'ArrowLeft':
            nextIndex = (currentIndex - 1 + focusableElements.length) % focusableElements.length;
            break;
        }
        
        if (nextIndex !== undefined) {
          e.preventDefault();
          focusableElements[nextIndex].focus();
        }
      }
    }
  }
  
  // Get focusable elements
  getFocusableElements() {
    const selector = 'a[href], button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])';
    return Array.from(document.querySelectorAll(selector))
      .filter(el => !el.disabled && !el.hidden && el.offsetParent !== null);
  }
  
  // Setup modal focus trap
  setupModalFocusTrap() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        const openModal = document.querySelector('.modal:not(.hidden)');
        if (openModal) {
          const focusableElements = openModal.querySelectorAll(
            'a[href], button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])'
          );
          
          if (focusableElements.length > 0) {
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];
            
            if (e.shiftKey && document.activeElement === firstElement) {
              e.preventDefault();
              lastElement.focus();
            } else if (!e.shiftKey && document.activeElement === lastElement) {
              e.preventDefault();
              firstElement.focus();
            }
          }
        }
      }
    });
  }
  
  // Add skip links
  addSkipLinks() {
    const skipLinks = document.createElement('div');
    skipLinks.className = 'skip-links';
    skipLinks.innerHTML = `
      <a href="#main-content" class="skip-link">Skip to main content</a>
      <a href="#sidebar-nav" class="skip-link">Skip to navigation</a>
    `;
    
    const style = document.createElement('style');
    style.textContent = `
      .skip-links {
        position: absolute;
        top: -40px;
        left: 6px;
        z-index: 1000;
      }
      
      .skip-link {
        position: absolute;
        top: -40px;
        left: 6px;
        background: #000;
        color: #fff;
        padding: 8px;
        text-decoration: none;
        border-radius: 4px;
        z-index: 1000;
      }
      
      .skip-link:focus {
        top: 6px;
      }
    `;
    
    document.head.appendChild(style);
    document.body.insertBefore(skipLinks, document.body.firstChild);
  }
  
  // Enhance focus indicators
  enhanceFocusIndicators() {
    // Add focus indicators to custom components
    const customElements = document.querySelectorAll('.btn, .card, .schedule-event');
    customElements.forEach(el => {
      if (!el.hasAttribute('tabindex') && !el.matches('button, a, input, select, textarea')) {
        el.setAttribute('tabindex', '0');
      }
    });
  }
  
  // Add ARIA labels
  addARIALabels() {
    // Add labels to buttons without text
    const iconButtons = document.querySelectorAll('button:not([aria-label])');
    iconButtons.forEach(button => {
      const svg = button.querySelector('svg');
      if (svg && !button.textContent.trim()) {
        const title = button.getAttribute('title') || 'Button';
        button.setAttribute('aria-label', title);
      }
    });
    
    // Add ARIA labels to form inputs
    const inputs = document.querySelectorAll('input:not([aria-label]):not([aria-labelledby])');
    inputs.forEach(input => {
      const label = document.querySelector(`label[for="${input.id}"]`);
      if (!label && input.placeholder) {
        input.setAttribute('aria-label', input.placeholder);
      }
    });
  }
  
  // Setup live regions
  setupLiveRegions() {
    if (!document.getElementById('announcements')) {
      const liveRegion = document.createElement('div');
      liveRegion.id = 'announcements';
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.className = 'sr-only';
      document.body.appendChild(liveRegion);
    }
  }
  
  // Enhance ARIA states
  enhanceARIAStates() {
    // Add ARIA expanded to dropdowns
    const dropdowns = document.querySelectorAll('[data-dropdown]');
    dropdowns.forEach(dropdown => {
      dropdown.setAttribute('aria-expanded', 'false');
    });
    
    // Add ARIA selected to navigation items
    const navItems = document.querySelectorAll('.sidebar-link');
    navItems.forEach(item => {
      const isActive = item.classList.contains('sidebar-link-active');
      item.setAttribute('aria-current', isActive ? 'page' : 'false');
    });
  }
  
  // Add screen reader text
  addScreenReaderText() {
    // Add screen reader descriptions to complex UI elements
    const tables = document.querySelectorAll('table');
    tables.forEach(table => {
      if (!table.querySelector('caption')) {
        const caption = document.createElement('caption');
        caption.className = 'sr-only';
        caption.textContent = 'Data table';
        table.insertBefore(caption, table.firstChild);
      }
    });
  }
  
  // Setup announcement system
  setupAnnouncementSystem() {
    this.announceQueue = [];
    this.isAnnouncing = false;
  }
  
  // Announce text to screen readers
  announce(text, priority = 'polite') {
    const liveRegion = document.getElementById('announcements');
    if (liveRegion) {
      liveRegion.setAttribute('aria-live', priority);
      liveRegion.textContent = text;
      
      // Clear after a short delay
      setTimeout(() => {
        liveRegion.textContent = '';
      }, 1000);
    }
  }
  
  // Check accessibility compliance
  checkCompliance() {
    const issues = [];
    
    // Check for missing alt text
    const images = document.querySelectorAll('img:not([alt])');
    if (images.length > 0) {
      issues.push(`${images.length} images missing alt text`);
    }
    
    // Check for missing form labels
    const unlabeledInputs = document.querySelectorAll('input:not([aria-label]):not([aria-labelledby])');
    const unlabeled = Array.from(unlabeledInputs).filter(input => {
      return !document.querySelector(`label[for="${input.id}"]`);
    });
    if (unlabeled.length > 0) {
      issues.push(`${unlabeled.length} form inputs missing labels`);
    }
    
    // Check color contrast (basic check)
    const lowContrastElements = this.checkColorContrast();
    if (lowContrastElements.length > 0) {
      issues.push(`${lowContrastElements.length} elements with potential contrast issues`);
    }
    
    return issues;
  }
  
  // Basic color contrast check
  checkColorContrast() {
    // This is a simplified version - in production, you'd use a proper color contrast library
    const elements = document.querySelectorAll('*');
    const lowContrast = [];
    
    // This would require more sophisticated color analysis
    // For now, just return empty array as placeholder
    return lowContrast;
  }
}

// Initialize accessibility manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.accessibilityManager = new AccessibilityManager();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AccessibilityManager;
}