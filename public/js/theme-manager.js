// Dark Mode and Theme Management System
// Provides comprehensive theme switching and customization

class ThemeManager {
  constructor() {
    this.currentTheme = localStorage.getItem('theme') || 'light';
    this.systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    this.autoMode = localStorage.getItem('autoMode') === 'true';
    
    this.themes = {
      light: {
        name: 'Light',
        primary: '#3b82f6',
        background: '#ffffff',
        surface: '#f9fafb',
        text: '#111827',
        textSecondary: '#6b7280'
      },
      dark: {
        name: 'Dark',
        primary: '#60a5fa',
        background: '#111827',
        surface: '#1f2937',
        text: '#f9fafb',
        textSecondary: '#d1d5db'
      },
      blue: {
        name: 'Blue',
        primary: '#1e40af',
        background: '#f0f9ff',
        surface: '#e0f2fe',
        text: '#0c4a6e',
        textSecondary: '#0369a1'
      },
      green: {
        name: 'Green',
        primary: '#059669',
        background: '#f0fdf4',
        surface: '#dcfce7',
        text: '#064e3b',
        textSecondary: '#047857'
      }
    };
    
    this.init();
  }
  
  init() {
    this.applyTheme();
    this.setupSystemPreferenceListener();
    this.addThemeControls();
    this.bindEvents();
  }
  
  applyTheme() {
    const theme = this.autoMode ? this.systemPreference : this.currentTheme;
    const themeData = this.themes[theme];
    
    // Apply CSS classes
    document.documentElement.classList.remove('light', 'dark', 'blue', 'green');
    document.documentElement.classList.add(theme);
    
    // Set CSS custom properties
    const root = document.documentElement;
    Object.entries(themeData).forEach(([key, value]) => {
      if (key !== 'name') {
        root.style.setProperty(`--theme-${key}`, value);
      }
    });
    
    // Update meta theme color for mobile browsers
    this.updateMetaThemeColor(themeData.primary);
    
    // Dispatch theme change event
    window.dispatchEvent(new CustomEvent('themechange', {
      detail: { theme, themeData, auto: this.autoMode }
    }));
  }
  
  setupSystemPreferenceListener() {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', (e) => {
      this.systemPreference = e.matches ? 'dark' : 'light';
      if (this.autoMode) {
        this.applyTheme();
      }
    });
  }
  
  addThemeControls() {
    // Create theme selector
    const themeSelector = document.createElement('div');
    themeSelector.id = 'theme-controls';
    themeSelector.className = 'theme-controls';
    themeSelector.setAttribute('role', 'region');
    themeSelector.setAttribute('aria-label', 'Theme Controls');
    
    themeSelector.innerHTML = `
      <button class="theme-toggle" aria-label="Open theme options" title="Theme Options">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
        </svg>
      </button>
      
      <div class="theme-panel hidden">
        <h3>Theme Settings</h3>
        
        <div class="theme-option">
          <label>
            <input type="checkbox" ${this.autoMode ? 'checked' : ''} id="auto-theme-toggle">
            Auto (System Preference)
          </label>
        </div>
        
        <div class="theme-option">
          <label for="theme-select">Manual Theme:</label>
          <div class="theme-grid">
            ${Object.entries(this.themes).map(([key, theme]) => `
              <button class="theme-swatch ${this.currentTheme === key ? 'active' : ''}" 
                      data-theme="${key}" 
                      title="${theme.name}"
                      style="background: ${theme.primary}; color: ${theme.text};">
                <span class="sr-only">${theme.name}</span>
                ${theme.name.charAt(0)}
              </button>
            `).join('')}
          </div>
        </div>
        
        <div class="theme-option">
          <button id="reset-theme" class="btn btn-secondary">Reset to Defaults</button>
        </div>
      </div>
    `;
    
    // Insert theme controls after accessibility controls
    const accessibilityControls = document.getElementById('accessibility-controls');
    if (accessibilityControls) {
      accessibilityControls.insertAdjacentElement('afterend', themeSelector);
    } else {
      document.body.appendChild(themeSelector);
    }
    
    this.addThemeStyles();
  }
  
  addThemeStyles() {
    const style = document.createElement('style');
    style.id = 'theme-styles';
    style.textContent = `
      :root {
        --theme-transition: all 0.3s ease;
      }
      
      /* Light theme (default) */
      .light {
        --bg-primary: #ffffff;
        --bg-secondary: #f9fafb;
        --bg-tertiary: #f3f4f6;
        --text-primary: #111827;
        --text-secondary: #6b7280;
        --text-tertiary: #9ca3af;
        --border-primary: #e5e7eb;
        --border-secondary: #d1d5db;
        --brand: #3b82f6;
        --brand-accent: #2563eb;
        --brand-light: #93c5fd;
        --highlight: #fbbf24;
        --success: #10b981;
        --warning: #f59e0b;
        --error: #ef4444;
      }
      
      /* Dark theme */
      .dark {
        --bg-primary: #111827;
        --bg-secondary: #1f2937;
        --bg-tertiary: #374151;
        --text-primary: #f9fafb;
        --text-secondary: #d1d5db;
        --text-tertiary: #9ca3af;
        --border-primary: #374151;
        --border-secondary: #4b5563;
        --brand: #60a5fa;
        --brand-accent: #3b82f6;
        --brand-light: #1e40af;
        --highlight: #fbbf24;
        --success: #34d399;
        --warning: #fbbf24;
        --error: #f87171;
      }
      
      /* Blue theme */
      .blue {
        --bg-primary: #f0f9ff;
        --bg-secondary: #e0f2fe;
        --bg-tertiary: #bae6fd;
        --text-primary: #0c4a6e;
        --text-secondary: #0369a1;
        --text-tertiary: #0284c7;
        --border-primary: #7dd3fc;
        --border-secondary: #38bdf8;
        --brand: #1e40af;
        --brand-accent: #1d4ed8;
        --brand-light: #3b82f6;
        --highlight: #fbbf24;
        --success: #059669;
        --warning: #d97706;
        --error: #dc2626;
      }
      
      /* Green theme */
      .green {
        --bg-primary: #f0fdf4;
        --bg-secondary: #dcfce7;
        --bg-tertiary: #bbf7d0;
        --text-primary: #064e3b;
        --text-secondary: #047857;
        --text-tertiary: #059669;
        --border-primary: #86efac;
        --border-secondary: #4ade80;
        --brand: #059669;
        --brand-accent: #047857;
        --brand-light: #10b981;
        --highlight: #fbbf24;
        --success: #22c55e;
        --warning: #f59e0b;
        --error: #ef4444;
      }
      
      /* Apply theme variables to elements */
      body {
        background-color: var(--bg-primary);
        color: var(--text-primary);
        transition: var(--theme-transition);
      }
      
      .card, .bg-white {
        background-color: var(--bg-primary) !important;
        border-color: var(--border-primary) !important;
        transition: var(--theme-transition);
      }
      
      .bg-gray-50 {
        background-color: var(--bg-secondary) !important;
      }
      
      .bg-gray-100 {
        background-color: var(--bg-tertiary) !important;
      }
      
      .text-gray-900 {
        color: var(--text-primary) !important;
      }
      
      .text-gray-600 {
        color: var(--text-secondary) !important;
      }
      
      .text-gray-500 {
        color: var(--text-tertiary) !important;
      }
      
      .border-gray-200, .border-gray-300 {
        border-color: var(--border-primary) !important;
      }
      
      .btn-primary {
        background-color: var(--brand) !important;
        border-color: var(--brand) !important;
      }
      
      .btn-primary:hover {
        background-color: var(--brand-accent) !important;
      }
      
      .text-brand {
        color: var(--brand) !important;
      }
      
      .bg-brand {
        background-color: var(--brand) !important;
      }
      
      /* Theme controls styles */
      .theme-controls {
        position: fixed;
        top: 80px;
        right: 20px;
        z-index: 999;
        background: var(--bg-primary);
        border-radius: 8px;
        box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
        border: 1px solid var(--border-primary);
        transition: var(--theme-transition);
      }
      
      .theme-toggle {
        padding: 8px;
        border: none;
        background: var(--brand);
        color: white;
        border-radius: 8px;
        cursor: pointer;
        transition: var(--theme-transition);
      }
      
      .theme-toggle:hover {
        background: var(--brand-accent);
      }
      
      .theme-panel {
        position: absolute;
        top: 100%;
        right: 0;
        margin-top: 8px;
        padding: 16px;
        background: var(--bg-primary);
        border: 1px solid var(--border-primary);
        border-radius: 8px;
        box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
        min-width: 250px;
        transition: var(--theme-transition);
      }
      
      .theme-panel h3 {
        margin: 0 0 12px 0;
        color: var(--text-primary);
        font-weight: 600;
      }
      
      .theme-option {
        margin-bottom: 12px;
      }
      
      .theme-option label {
        display: block;
        font-weight: 500;
        margin-bottom: 4px;
        color: var(--text-primary);
      }
      
      .theme-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 8px;
        margin-top: 8px;
      }
      
      .theme-swatch {
        width: 40px;
        height: 40px;
        border-radius: 6px;
        border: 2px solid transparent;
        cursor: pointer;
        font-weight: 600;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: var(--theme-transition);
      }
      
      .theme-swatch:hover {
        transform: scale(1.1);
      }
      
      .theme-swatch.active {
        border-color: var(--text-primary);
        box-shadow: 0 0 0 2px var(--bg-primary);
      }
      
      /* Sidebar theme support */
      .sidebar {
        background: var(--brand) !important;
      }
      
      .dark .sidebar {
        background: linear-gradient(135deg, #1f2937 0%, #111827 100%) !important;
      }
      
      /* Modal theme support */
      .modal {
        background-color: var(--bg-primary);
        border-color: var(--border-primary);
      }
      
      /* Form theme support */
      input, select, textarea {
        background-color: var(--bg-primary) !important;
        color: var(--text-primary) !important;
        border-color: var(--border-primary) !important;
      }
      
      input:focus, select:focus, textarea:focus {
        border-color: var(--brand) !important;
        box-shadow: 0 0 0 3px rgb(59 130 246 / 0.1) !important;
      }
      
      /* Animation for theme transitions */
      * {
        transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
      }
      
      /* Reduced motion support */
      @media (prefers-reduced-motion: reduce) {
        * {
          transition: none !important;
        }
      }
      
      /* High contrast mode overrides */
      .high-contrast .theme-swatch {
        border: 3px solid currentColor !important;
      }
      
      .high-contrast .theme-toggle {
        border: 2px solid white !important;
      }
    `;
    
    document.head.appendChild(style);
  }
  
  bindEvents() {
    // Theme toggle button
    const toggle = document.querySelector('.theme-toggle');
    const panel = document.querySelector('.theme-panel');
    
    toggle.addEventListener('click', () => {
      const isHidden = panel.classList.contains('hidden');
      panel.classList.toggle('hidden');
      toggle.setAttribute('aria-expanded', !isHidden);
    });
    
    // Auto theme toggle
    document.getElementById('auto-theme-toggle').addEventListener('change', (e) => {
      this.toggleAutoMode(e.target.checked);
    });
    
    // Theme swatches
    document.querySelectorAll('.theme-swatch').forEach(swatch => {
      swatch.addEventListener('click', (e) => {
        const theme = e.target.getAttribute('data-theme');
        this.setTheme(theme);
      });
    });
    
    // Reset button
    document.getElementById('reset-theme').addEventListener('click', () => {
      this.resetTheme();
    });
    
    // Close panel when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.theme-controls')) {
        panel.classList.add('hidden');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !panel.classList.contains('hidden')) {
        panel.classList.add('hidden');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.focus();
      }
    });
  }
  
  setTheme(theme) {
    if (this.themes[theme]) {
      this.currentTheme = theme;
      this.autoMode = false;
      localStorage.setItem('theme', theme);
      localStorage.setItem('autoMode', 'false');
      
      // Update UI
      document.getElementById('auto-theme-toggle').checked = false;
      document.querySelectorAll('.theme-swatch').forEach(swatch => {
        swatch.classList.toggle('active', swatch.getAttribute('data-theme') === theme);
      });
      
      this.applyTheme();
      
      // Announce change
      if (window.accessibilityManager) {
        window.accessibilityManager.announce(`Theme changed to ${this.themes[theme].name}`);
      }
    }
  }
  
  toggleAutoMode(enabled) {
    this.autoMode = enabled;
    localStorage.setItem('autoMode', enabled);
    
    if (enabled) {
      // Disable manual theme selection
      document.querySelectorAll('.theme-swatch').forEach(swatch => {
        swatch.disabled = true;
        swatch.style.opacity = '0.5';
      });
    } else {
      // Enable manual theme selection
      document.querySelectorAll('.theme-swatch').forEach(swatch => {
        swatch.disabled = false;
        swatch.style.opacity = '1';
      });
    }
    
    this.applyTheme();
    
    // Announce change
    if (window.accessibilityManager) {
      window.accessibilityManager.announce(`Auto theme mode ${enabled ? 'enabled' : 'disabled'}`);
    }
  }
  
  resetTheme() {
    this.setTheme('light');
    this.toggleAutoMode(false);
    
    // Update form controls
    document.getElementById('auto-theme-toggle').checked = false;
    
    if (window.accessibilityManager) {
      window.accessibilityManager.announce('Theme settings reset to defaults');
    }
  }
  
  updateMetaThemeColor(color) {
    let metaTheme = document.querySelector('meta[name="theme-color"]');
    if (!metaTheme) {
      metaTheme = document.createElement('meta');
      metaTheme.name = 'theme-color';
      document.head.appendChild(metaTheme);
    }
    metaTheme.content = color;
  }
  
  getCurrentTheme() {
    return {
      name: this.currentTheme,
      data: this.themes[this.currentTheme],
      auto: this.autoMode,
      system: this.systemPreference
    };
  }
  
  // Export theme as CSS
  exportThemeCSS() {
    const theme = this.getCurrentTheme();
    const css = Object.entries(theme.data)
      .filter(([key]) => key !== 'name')
      .map(([key, value]) => `  --theme-${key}: ${value};`)
      .join('\n');
    
    return `:root {\n${css}\n}`;
  }
  
  // Add custom theme
  addCustomTheme(name, themeData) {
    this.themes[name] = themeData;
    this.updateThemeControls();
  }
  
  updateThemeControls() {
    const grid = document.querySelector('.theme-grid');
    if (grid) {
      grid.innerHTML = Object.entries(this.themes).map(([key, theme]) => `
        <button class="theme-swatch ${this.currentTheme === key ? 'active' : ''}" 
                data-theme="${key}" 
                title="${theme.name}"
                style="background: ${theme.primary}; color: ${theme.text};">
          <span class="sr-only">${theme.name}</span>
          ${theme.name.charAt(0)}
        </button>
      `).join('');
      
      // Re-bind events for new swatches
      document.querySelectorAll('.theme-swatch').forEach(swatch => {
        swatch.addEventListener('click', (e) => {
          const theme = e.target.getAttribute('data-theme');
          this.setTheme(theme);
        });
      });
    }
  }
}

// Initialize theme manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Wait for accessibility manager to load first
  setTimeout(() => {
    window.themeManager = new ThemeManager();
  }, 100);
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ThemeManager;
}