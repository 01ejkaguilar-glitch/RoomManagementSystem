// Data Density Optimization System
// Provides enhanced data display with efficient information presentation

class DataDensityManager {
  constructor() {
    this.viewModes = {
      compact: 'compact',
      comfortable: 'comfortable',
      spacious: 'spacious'
    };
    
    this.currentViewMode = localStorage.getItem('viewMode') || 'comfortable';
    this.columnsVisible = JSON.parse(localStorage.getItem('columnsVisible') || '{}');
    this.sortPreferences = JSON.parse(localStorage.getItem('sortPreferences') || '{}');
    
    this.init();
  }
  
  init() {
    this.addDensityControls();
    this.applyViewMode();
    this.setupColumnToggling();
    this.setupAdvancedFiltering();
    this.setupDataVisualization();
    this.addKeyboardShortcuts();
  }
  
  // Add density control interface
  addDensityControls() {
    const style = document.createElement('style');
    style.textContent = `
      /* View mode styles */
      .density-controls {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: 1rem;
        padding: 0.75rem;
        background: #f8fafc;
        border-radius: 0.5rem;
        border: 1px solid #e2e8f0;
      }
      
      .view-mode-toggle {
        display: flex;
        background: white;
        border-radius: 0.375rem;
        padding: 0.25rem;
        border: 1px solid #d1d5db;
      }
      
      .view-mode-btn {
        padding: 0.5rem 0.75rem;
        border: none;
        background: transparent;
        cursor: pointer;
        border-radius: 0.25rem;
        font-size: 0.875rem;
        transition: all 0.2s;
      }
      
      .view-mode-btn.active {
        background: #3b82f6;
        color: white;
      }
      
      .view-mode-btn:hover:not(.active) {
        background: #f3f4f6;
      }
      
      /* Compact view styles */
      .view-compact .card {
        padding: 0.75rem;
        margin-bottom: 0.5rem;
      }
      
      .view-compact .card h3 {
        font-size: 1rem;
        margin-bottom: 0.25rem;
      }
      
      .view-compact .card p {
        font-size: 0.8rem;
        line-height: 1.3;
      }
      
      .view-compact .grid {
        gap: 0.5rem;
      }
      
      .view-compact table td,
      .view-compact table th {
        padding: 0.5rem 0.75rem;
        font-size: 0.875rem;
      }
      
      /* Comfortable view styles (default) */
      .view-comfortable .card {
        padding: 1.25rem;
        margin-bottom: 1rem;
      }
      
      .view-comfortable table td,
      .view-comfortable table th {
        padding: 0.75rem 1rem;
      }
      
      /* Spacious view styles */
      .view-spacious .card {
        padding: 2rem;
        margin-bottom: 1.5rem;
      }
      
      .view-spacious .grid {
        gap: 1.5rem;
      }
      
      .view-spacious table td,
      .view-spacious table th {
        padding: 1rem 1.25rem;
        font-size: 1rem;
      }
      
      /* Enhanced table styles */
      .enhanced-table {
        position: relative;
        background: white;
        border-radius: 0.5rem;
        overflow: hidden;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      }
      
      .table-header {
        display: flex;
        justify-content: between;
        align-items: center;
        padding: 1rem;
        background: #f8fafc;
        border-bottom: 1px solid #e2e8f0;
      }
      
      .table-actions {
        display: flex;
        gap: 0.5rem;
        align-items: center;
      }
      
      .column-toggle {
        position: relative;
      }
      
      .column-dropdown {
        position: absolute;
        top: 100%;
        right: 0;
        background: white;
        border: 1px solid #d1d5db;
        border-radius: 0.375rem;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        z-index: 10;
        min-width: 200px;
        max-height: 300px;
        overflow-y: auto;
        display: none;
      }
      
      .column-dropdown.visible {
        display: block;
      }
      
      .column-item {
        display: flex;
        align-items: center;
        padding: 0.5rem 0.75rem;
        cursor: pointer;
        border-bottom: 1px solid #f3f4f6;
      }
      
      .column-item:hover {
        background: #f8fafc;
      }
      
      .column-item input {
        margin-right: 0.5rem;
      }
      
      /* Enhanced data cards */
      .data-card {
        position: relative;
        background: white;
        border-radius: 0.5rem;
        padding: 1rem;
        border: 1px solid #e2e8f0;
        transition: all 0.2s;
      }
      
      .data-card:hover {
        border-color: #3b82f6;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }
      
      .data-card-header {
        display: flex;
        justify-content: between;
        align-items: flex-start;
        margin-bottom: 0.75rem;
      }
      
      .data-card-title {
        font-weight: 600;
        color: #1f2937;
        margin: 0;
      }
      
      .data-card-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin-bottom: 0.75rem;
      }
      
      .data-card-stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
        gap: 0.75rem;
        margin-top: 0.75rem;
        padding-top: 0.75rem;
        border-top: 1px solid #f3f4f6;
      }
      
      .stat-item {
        text-align: center;
      }
      
      .stat-value {
        font-size: 1.25rem;
        font-weight: 600;
        color: #1f2937;
        display: block;
      }
      
      .stat-label {
        font-size: 0.75rem;
        color: #6b7280;
        text-transform: uppercase;
        letter-spacing: 0.025em;
      }
      
      /* Quick info tooltips */
      .quick-info {
        position: relative;
        cursor: help;
      }
      
      .quick-info::after {
        content: attr(data-tooltip);
        position: absolute;
        bottom: 100%;
        left: 50%;
        transform: translateX(-50%);
        background: #374151;
        color: white;
        padding: 0.5rem;
        border-radius: 0.25rem;
        font-size: 0.75rem;
        white-space: nowrap;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.2s;
        z-index: 20;
      }
      
      .quick-info:hover::after {
        opacity: 1;
      }
      
      /* Enhanced badges */
      .status-badge {
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
        padding: 0.25rem 0.5rem;
        border-radius: 0.375rem;
        font-size: 0.75rem;
        font-weight: 500;
      }
      
      .status-indicator {
        width: 6px;
        height: 6px;
        border-radius: 50%;
      }
      
      /* Data visualization elements */
      .inline-chart {
        height: 20px;
        background: #f3f4f6;
        border-radius: 10px;
        overflow: hidden;
        position: relative;
      }
      
      .chart-fill {
        height: 100%;
        background: linear-gradient(90deg, #3b82f6, #1d4ed8);
        border-radius: 10px;
        transition: width 0.5s ease;
      }
      
      .chart-label {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 0.75rem;
        font-weight: 500;
        color: white;
        mix-blend-mode: difference;
      }
      
      /* Responsive adjustments */
      @media (max-width: 768px) {
        .density-controls {
          flex-direction: column;
          align-items: stretch;
          gap: 0.75rem;
        }
        
        .table-header {
          flex-direction: column;
          gap: 0.75rem;
        }
        
        .table-actions {
          justify-content: space-between;
          width: 100%;
        }
        
        .data-card-stats {
          grid-template-columns: repeat(2, 1fr);
        }
      }
    `;
    
    document.head.appendChild(style);
  }
  
  // Apply current view mode
  applyViewMode() {
    document.body.className = document.body.className.replace(/view-\w+/g, '');
    document.body.classList.add(`view-${this.currentViewMode}`);
  }
  
  // Setup column toggling functionality
  setupColumnToggling() {
    document.addEventListener('click', (e) => {
      if (e.target.matches('.column-toggle-btn')) {
        this.toggleColumnDropdown(e.target);
      }
      
      if (e.target.matches('.column-item input')) {
        this.toggleColumn(e.target);
      }
    });
  }
  
  // Setup advanced filtering
  setupAdvancedFiltering() {
    document.addEventListener('input', (e) => {
      if (e.target.matches('.advanced-filter')) {
        this.applyAdvancedFilter(e.target);
      }
    });
  }
  
  // Setup data visualization
  setupDataVisualization() {
    this.updateInlineCharts();
    this.addQuickStats();
  }
  
  // Add keyboard shortcuts
  addKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
          case '1':
            e.preventDefault();
            this.setViewMode('compact');
            break;
          case '2':
            e.preventDefault();
            this.setViewMode('comfortable');
            break;
          case '3':
            e.preventDefault();
            this.setViewMode('spacious');
            break;
        }
      }
    });
  }
  
  // Enhanced data rendering methods
  renderEnhancedTable(containerId, data, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const {
      columns = [],
      showSearch = true,
      showColumnToggle = true,
      showExport = true,
      pagination = true
    } = options;
    
    const tableHtml = `
      <div class="enhanced-table">
        <div class="table-header">
          <div class="table-info">
            <h3 class="text-lg font-semibold">${options.title || 'Data Table'}</h3>
            <span class="text-sm text-gray-500">${data.length} items</span>
          </div>
          <div class="table-actions">
            ${showSearch ? `
              <input type="search" placeholder="Search..." 
                class="px-3 py-1 border rounded text-sm advanced-filter"
                data-filter-type="search">
            ` : ''}
            ${showColumnToggle ? `
              <div class="column-toggle">
                <button class="column-toggle-btn btn text-sm">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M4 6h16M4 12h16M4 18h16"/>
                  </svg>
                  Columns
                </button>
                <div class="column-dropdown">
                  ${columns.map(col => `
                    <div class="column-item">
                      <input type="checkbox" ${col.visible !== false ? 'checked' : ''} 
                        data-column="${col.key}">
                      <span>${col.label}</span>
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : ''}
            ${showExport ? `
              <button class="btn btn-primary text-sm" onclick="dataDensityManager.exportData('${containerId}')">
                Export
              </button>
            ` : ''}
          </div>
        </div>
        <div class="table-content">
          ${this.generateTableContent(data, columns)}
        </div>
      </div>
    `;
    
    container.innerHTML = tableHtml;
  }
  
  renderEnhancedCards(containerId, data, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const cardsHtml = data.map(item => this.generateCardContent(item, options)).join('');
    
    container.innerHTML = `
      <div class="enhanced-cards-container">
        ${options.showControls ? this.generateDensityControls() : ''}
        <div class="cards-grid grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          ${cardsHtml}
        </div>
      </div>
    `;
  }
  
  // Generate enhanced card content
  generateCardContent(item, options = {}) {
    const { 
      titleField = 'name',
      subtitleField = 'description',
      metaFields = [],
      statsFields = [],
      statusField = 'status'
    } = options;
    
    return `
      <div class="data-card" data-item-id="${item.id}">
        <div class="data-card-header">
          <div>
            <h3 class="data-card-title">${item[titleField] || 'Untitled'}</h3>
            ${item[subtitleField] ? `<p class="text-sm text-gray-600 mt-1">${item[subtitleField]}</p>` : ''}
          </div>
          ${item[statusField] ? `
            <span class="status-badge badge-${this.getStatusColor(item[statusField])}">
              <span class="status-indicator bg-current"></span>
              ${item[statusField]}
            </span>
          ` : ''}
        </div>
        
        ${metaFields.length > 0 ? `
          <div class="data-card-meta">
            ${metaFields.map(field => {
              if (item[field.key]) {
                return `<span class="badge badge-gray">${field.label}: ${item[field.key]}</span>`;
              }
              return '';
            }).join('')}
          </div>
        ` : ''}
        
        ${statsFields.length > 0 ? `
          <div class="data-card-stats">
            ${statsFields.map(field => `
              <div class="stat-item quick-info" data-tooltip="${field.description || ''}">
                <span class="stat-value">${item[field.key] || '0'}</span>
                <span class="stat-label">${field.label}</span>
              </div>
            `).join('')}
          </div>
        ` : ''}
        
        ${this.generateCardActions(item)}
      </div>
    `;
  }
  
  // Generate density controls
  generateDensityControls() {
    return `
      <div class="density-controls">
        <div class="view-mode-toggle">
          <button class="view-mode-btn ${this.currentViewMode === 'compact' ? 'active' : ''}" 
            onclick="dataDensityManager.setViewMode('compact')">
            Compact
          </button>
          <button class="view-mode-btn ${this.currentViewMode === 'comfortable' ? 'active' : ''}" 
            onclick="dataDensityManager.setViewMode('comfortable')">
            Comfortable
          </button>
          <button class="view-mode-btn ${this.currentViewMode === 'spacious' ? 'active' : ''}" 
            onclick="dataDensityManager.setViewMode('spacious')">
            Spacious
          </button>
        </div>
        
        <div class="view-info">
          <span class="text-sm text-gray-600">
            Use Ctrl+1/2/3 for quick switching
          </span>
        </div>
      </div>
    `;
  }
  
  // Set view mode
  setViewMode(mode) {
    this.currentViewMode = mode;
    localStorage.setItem('viewMode', mode);
    this.applyViewMode();
    
    // Update toggle buttons
    document.querySelectorAll('.view-mode-btn').forEach(btn => {
      btn.classList.toggle('active', btn.textContent.toLowerCase() === mode);
    });
    
    // Trigger re-layout
    this.updateLayout();
  }
  
  // Toggle column visibility
  toggleColumn(checkbox) {
    const column = checkbox.dataset.column;
    const isVisible = checkbox.checked;
    
    this.columnsVisible[column] = isVisible;
    localStorage.setItem('columnsVisible', JSON.stringify(this.columnsVisible));
    
    // Update table
    this.updateTableColumns();
  }
  
  // Apply advanced filtering
  applyAdvancedFilter(filterInput) {
    const filterType = filterInput.dataset.filterType;
    const value = filterInput.value.toLowerCase();
    const table = filterInput.closest('.enhanced-table');
    
    if (!table) return;
    
    const rows = table.querySelectorAll('tbody tr');
    
    rows.forEach(row => {
      const text = row.textContent.toLowerCase();
      const matches = text.includes(value);
      row.style.display = matches ? '' : 'none';
    });
    
    // Update results count
    const visibleRows = Array.from(rows).filter(row => row.style.display !== 'none');
    const infoElement = table.querySelector('.table-info span');
    if (infoElement) {
      infoElement.textContent = `${visibleRows.length} of ${rows.length} items`;
    }
  }
  
  // Update inline charts
  updateInlineCharts() {
    document.querySelectorAll('.inline-chart').forEach(chart => {
      const percentage = chart.dataset.percentage || 0;
      const fill = chart.querySelector('.chart-fill');
      const label = chart.querySelector('.chart-label');
      
      if (fill) {
        fill.style.width = percentage + '%';
      }
      
      if (label) {
        label.textContent = percentage + '%';
      }
    });
  }
  
  // Add quick statistics
  addQuickStats() {
    const containers = document.querySelectorAll('[data-add-stats]');
    
    containers.forEach(container => {
      const items = container.querySelectorAll('.data-card, tr');
      const stats = this.calculateQuickStats(items);
      
      const statsHtml = `
        <div class="quick-stats bg-gray-50 p-3 rounded-lg mb-4">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div class="text-2xl font-bold text-blue-600">${stats.total}</div>
              <div class="text-xs text-gray-500">Total Items</div>
            </div>
            <div>
              <div class="text-2xl font-bold text-green-600">${stats.active}</div>
              <div class="text-xs text-gray-500">Active</div>
            </div>
            <div>
              <div class="text-2xl font-bold text-yellow-600">${stats.pending}</div>
              <div class="text-xs text-gray-500">Pending</div>
            </div>
            <div>
              <div class="text-2xl font-bold text-red-600">${stats.inactive}</div>
              <div class="text-xs text-gray-500">Inactive</div>
            </div>
          </div>
        </div>
      `;
      
      container.insertAdjacentHTML('afterbegin', statsHtml);
    });
  }
  
  // Calculate quick statistics
  calculateQuickStats(items) {
    const stats = {
      total: items.length,
      active: 0,
      pending: 0,
      inactive: 0
    };
    
    items.forEach(item => {
      const statusElement = item.querySelector('.status-badge, .badge');
      if (statusElement) {
        const status = statusElement.textContent.toLowerCase();
        if (status.includes('active') || status.includes('available')) {
          stats.active++;
        } else if (status.includes('pending') || status.includes('scheduled')) {
          stats.pending++;
        } else {
          stats.inactive++;
        }
      }
    });
    
    return stats;
  }
  
  // Export data functionality
  exportData(containerId, format = 'csv') {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const table = container.querySelector('table');
    if (!table) return;
    
    const data = this.extractTableData(table);
    
    switch(format) {
      case 'csv':
        this.downloadCSV(data, `${containerId}-export.csv`);
        break;
      case 'json':
        this.downloadJSON(data, `${containerId}-export.json`);
        break;
    }
  }
  
  // Helper methods
  getStatusColor(status) {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('active') || statusLower.includes('available')) return 'green';
    if (statusLower.includes('pending') || statusLower.includes('scheduled')) return 'yellow';
    if (statusLower.includes('inactive') || statusLower.includes('occupied')) return 'red';
    return 'gray';
  }
  
  generateCardActions(item) {
    return `
      <div class="flex gap-2 mt-3 pt-3 border-t border-gray-100">
        <button class="btn btn-primary flex-1 text-sm" onclick="viewItem('${item.id}')">
          View Details
        </button>
        <button class="btn text-gray-600 border border-gray-300 text-sm" onclick="editItem('${item.id}')">
          Edit
        </button>
      </div>
    `;
  }
  
  // Update layout after view mode change
  updateLayout() {
    // Trigger any layout-dependent calculations
    this.updateInlineCharts();
    
    // Dispatch custom event for other components
    window.dispatchEvent(new CustomEvent('densityModeChanged', {
      detail: { mode: this.currentViewMode }
    }));
  }
}

// Initialize data density manager
window.dataDensityManager = new DataDensityManager();

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DataDensityManager;
}