// Table Enhancement System
// Provides sorting, filtering, and search functionality for data tables

class TableEnhancer {
  constructor(config) {
    this.config = {
      searchInput: null,
      sortButtons: [],
      filterSelects: [],
      tableBody: null,
      emptyStateElement: null,
      ...config
    };
    
    this.originalData = [];
    this.filteredData = [];
    this.currentSort = { field: null, direction: 'asc' };
    
    this.init();
  }
  
  init() {
    this.captureOriginalData();
    this.bindEvents();
  }
  
  captureOriginalData() {
    if (!this.config.tableBody) return;
    
    const rows = this.config.tableBody.querySelectorAll('[data-item]');
    this.originalData = Array.from(rows).map(row => ({
      element: row,
      data: JSON.parse(row.getAttribute('data-item') || '{}')
    }));
    
    this.filteredData = [...this.originalData];
  }
  
  bindEvents() {
    // Search functionality
    if (this.config.searchInput) {
      this.config.searchInput.addEventListener('input', (e) => {
        this.handleSearch(e.target.value);
      });
    }
    
    // Sort functionality
    this.config.sortButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const field = button.getAttribute('data-sort-field');
        this.handleSort(field);
      });
    });
    
    // Filter functionality
    this.config.filterSelects.forEach(select => {
      select.addEventListener('change', (e) => {
        this.handleFilter();
      });
    });
  }
  
  handleSearch(query) {
    if (!query.trim()) {
      this.filteredData = [...this.originalData];
    } else {
      const searchTerm = query.toLowerCase();
      this.filteredData = this.originalData.filter(item => {
        // Search through all text content in the row
        const textContent = item.element.textContent.toLowerCase();
        return textContent.includes(searchTerm);
      });
    }
    
    this.applyFiltersAndSort();
    this.renderTable();
  }
  
  handleSort(field) {
    if (this.currentSort.field === field) {
      this.currentSort.direction = this.currentSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
      this.currentSort.field = field;
      this.currentSort.direction = 'asc';
    }
    
    this.updateSortButtons();
    this.applySort();
    this.renderTable();
  }
  
  handleFilter() {
    this.applyFiltersAndSort();
    this.renderTable();
  }
  
  applyFiltersAndSort() {
    let data = [...this.originalData];
    
    // Apply search if there's a search query
    if (this.config.searchInput && this.config.searchInput.value.trim()) {
      const searchTerm = this.config.searchInput.value.toLowerCase();
      data = data.filter(item => {
        const textContent = item.element.textContent.toLowerCase();
        return textContent.includes(searchTerm);
      });
    }
    
    // Apply filters
    this.config.filterSelects.forEach(select => {
      if (select.value && select.value !== 'all') {
        const filterField = select.getAttribute('data-filter-field');
        const filterValue = select.value.toLowerCase();
        
        data = data.filter(item => {
          const itemValue = this.getNestedValue(item.data, filterField);
          return itemValue && itemValue.toString().toLowerCase().includes(filterValue);
        });
      }
    });
    
    this.filteredData = data;
    this.applySort();
  }
  
  applySort() {
    if (!this.currentSort.field) return;
    
    this.filteredData.sort((a, b) => {
      const aValue = this.getNestedValue(a.data, this.currentSort.field);
      const bValue = this.getNestedValue(b.data, this.currentSort.field);
      
      // Handle different data types
      let comparison = 0;
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue);
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue;
      } else {
        comparison = String(aValue).localeCompare(String(bValue));
      }
      
      return this.currentSort.direction === 'desc' ? -comparison : comparison;
    });
  }
  
  updateSortButtons() {
    this.config.sortButtons.forEach(button => {
      const field = button.getAttribute('data-sort-field');
      button.classList.remove('sort-asc', 'sort-desc');
      
      if (field === this.currentSort.field) {
        button.classList.add(`sort-${this.currentSort.direction}`);
      }
    });
  }
  
  renderTable() {
    if (!this.config.tableBody) return;
    
    // Clear current table content
    this.config.tableBody.innerHTML = '';
    
    if (this.filteredData.length === 0) {
      this.showEmptyState();
    } else {
      this.hideEmptyState();
      // Append filtered and sorted elements
      this.filteredData.forEach(item => {
        this.config.tableBody.appendChild(item.element);
      });
    }
  }
  
  showEmptyState() {
    if (this.config.emptyStateElement) {
      this.config.emptyStateElement.style.display = 'block';
    }
  }
  
  hideEmptyState() {
    if (this.config.emptyStateElement) {
      this.config.emptyStateElement.style.display = 'none';
    }
  }
  
  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current && current[key], obj);
  }
  
  // Public method to refresh data (useful after CRUD operations)
  refresh() {
    this.captureOriginalData();
    this.applyFiltersAndSort();
    this.renderTable();
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TableEnhancer;
}

// Global utility functions for common table operations
window.TableUtils = {
  // Create sortable headers
  makeSortable: function(headerElement, field) {
    headerElement.setAttribute('data-sort-field', field);
    headerElement.style.cursor = 'pointer';
    headerElement.classList.add('sortable-header');
    
    // Add sort icon
    const icon = document.createElement('span');
    icon.className = 'sort-icon ml-1';
    icon.innerHTML = '↕️';
    headerElement.appendChild(icon);
  },
  
  // Add search functionality to any input
  addSearch: function(inputElement, targetTable) {
    inputElement.addEventListener('input', function(e) {
      const searchTerm = e.target.value.toLowerCase();
      const rows = targetTable.querySelectorAll('tbody tr, .list-item');
      
      rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        const matches = text.includes(searchTerm);
        row.style.display = matches ? '' : 'none';
      });
    });
  },
  
  // Real-time filtering
  addFilter: function(selectElement, targetTable, filterField) {
    selectElement.addEventListener('change', function(e) {
      const filterValue = e.target.value.toLowerCase();
      const rows = targetTable.querySelectorAll('[data-item]');
      
      rows.forEach(row => {
        if (filterValue === 'all' || filterValue === '') {
          row.style.display = '';
        } else {
          const data = JSON.parse(row.getAttribute('data-item') || '{}');
          const fieldValue = data[filterField]?.toString().toLowerCase() || '';
          row.style.display = fieldValue.includes(filterValue) ? '' : 'none';
        }
      });
    });
  }
};