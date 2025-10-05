// Enhanced Search and Filtering System
// Provides advanced search with autocomplete and filtering for rooms, schedules, and users

class SearchManager {
  constructor(options = {}) {
    this.endpoint = options.endpoint || '/search';
    this.entities = options.entities || ['rooms', 'schedules', 'users'];
    this.minQueryLength = options.minQueryLength || 2;
    this.debounceDelay = options.debounceDelay || 200;
    this.lastQuery = '';
    this.timer = null;
    this.init();
  }

  init() {
    this.createSearchBar();
    this.bindEvents();
  }

  createSearchBar() {
    // Create search bar UI
    const searchContainer = document.createElement('div');
    searchContainer.id = 'search-container';
    searchContainer.className = 'search-container fixed top-6 right-6 z-50';
    searchContainer.innerHTML = `
      <form id="global-search-form" class="flex items-center bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg px-3 py-2 w-96 max-w-full">
        <input type="text" id="global-search-input" class="flex-1 bg-transparent outline-none text-gray-900 dark:text-white placeholder-gray-400" placeholder="Search rooms, schedules, users..." aria-label="Global Search" autocomplete="off" />
        <button type="submit" class="ml-2 text-brand dark:text-brand-light" aria-label="Search">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z"/></svg>
        </button>
      </form>
      <ul id="search-suggestions" class="search-suggestions absolute left-0 right-0 mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg hidden"></ul>
    `;
    document.body.appendChild(searchContainer);
  }

  bindEvents() {
    const input = document.getElementById('global-search-input');
    const form = document.getElementById('global-search-form');
    const suggestions = document.getElementById('search-suggestions');

    input.addEventListener('input', (e) => {
      const query = e.target.value.trim();
      if (query.length < this.minQueryLength) {
        suggestions.classList.add('hidden');
        suggestions.innerHTML = '';
        return;
      }
      clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        this.fetchSuggestions(query);
      }, this.debounceDelay);
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const query = input.value.trim();
      if (query.length >= this.minQueryLength) {
        this.performSearch(query);
      }
    });

    suggestions.addEventListener('click', (e) => {
      const item = e.target.closest('li[data-entity]');
      if (item) {
        this.navigateToEntity(item.dataset.entity, item.dataset.id);
      }
    });

    // Keyboard navigation for suggestions
    input.addEventListener('keydown', (e) => {
      const items = Array.from(suggestions.querySelectorAll('li'));
      let idx = items.findIndex(item => item.classList.contains('active'));
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (idx < items.length - 1) idx++;
        else idx = 0;
        items.forEach(item => item.classList.remove('active'));
        if (items[idx]) items[idx].classList.add('active');
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (idx > 0) idx--;
        else idx = items.length - 1;
        items.forEach(item => item.classList.remove('active'));
        if (items[idx]) items[idx].classList.add('active');
      } else if (e.key === 'Enter' && idx >= 0) {
        e.preventDefault();
        items[idx].click();
      }
    });
  }

  async fetchSuggestions(query) {
    this.lastQuery = query;
    // Simulate API call (replace with real endpoint)
    const results = await this.mockSearch(query);
    this.renderSuggestions(results);
  }

  renderSuggestions(results) {
    const suggestions = document.getElementById('search-suggestions');
    if (!results.length) {
      suggestions.classList.add('hidden');
      suggestions.innerHTML = '';
      return;
    }
    suggestions.innerHTML = results.map(item => `
      <li class="px-4 py-2 cursor-pointer hover:bg-brand/10 active bg-brand/20" data-entity="${item.entity}" data-id="${item.id}">
        <span class="font-semibold">${item.label}</span>
        <span class="ml-2 text-xs text-gray-500">${item.entity}</span>
      </li>
    `).join('');
    suggestions.classList.remove('hidden');
  }

  async performSearch(query) {
    // Simulate API call (replace with real endpoint)
    const results = await this.mockSearch(query);
    // For now, just show suggestions as results
    this.renderSuggestions(results);
  }

  navigateToEntity(entity, id) {
    // Route to the appropriate page (customize as needed)
    if (entity === 'rooms') {
      window.location.href = `/rooms/${id}`;
    } else if (entity === 'schedules') {
      window.location.href = `/schedules/${id}`;
    } else if (entity === 'users') {
      window.location.href = `/users/${id}`;
    }
  }

  // Mock search for demonstration (replace with real API call)
  async mockSearch(query) {
    // Simulate delay
    await new Promise(res => setTimeout(res, 150));
    // Return mock results
    return [
      { entity: 'rooms', id: '101', label: `Room 101 (${query})` },
      { entity: 'schedules', id: '2025-10-06', label: `Schedule for ${query}` },
      { entity: 'users', id: 'u123', label: `User: ${query}` }
    ];
  }
}

// Initialize search manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.searchManager = new SearchManager();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SearchManager;
}
