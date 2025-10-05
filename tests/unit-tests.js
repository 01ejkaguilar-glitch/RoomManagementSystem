// Unit Tests for Room Management System Components
// Tests for modal system, calendar, accessibility, theme manager, etc.

// Modal System Tests
describe('Modal System', () => {
  let modalSystem;
  let testContainer;

  beforeEach(() => {
    testContainer = testFramework.createTestDOM();
    modalSystem = new ModalSystem();
  });

  afterEach(() => {
    testFramework.cleanupTestDOM();
  });

  it('should create modal instance', () => {
    expect(modalSystem).toBeInstanceOf(ModalSystem);
    expect(modalSystem.modals).toEqual([]);
  });

  it('should show modal with content', () => {
    const modalId = modalSystem.show({
      title: 'Test Modal',
      content: '<p>Test content</p>'
    });

    expect(modalId).toBeTruthy();
    expect(modalSystem.modals.length).toBe(1);
    
    const modal = document.querySelector('.modal');
    expect(modal).toBeTruthy();
    expect(modal.style.display).toBe('flex');
  });

  it('should close modal', () => {
    const modalId = modalSystem.show({
      title: 'Test Modal',
      content: '<p>Test content</p>'
    });

    modalSystem.close(modalId);
    
    expect(modalSystem.modals.length).toBe(0);
    const modal = document.querySelector('.modal');
    expect(modal).toBeFalsy();
  });

  it('should handle multiple modals', () => {
    const modal1 = modalSystem.show({ title: 'Modal 1', content: 'Content 1' });
    const modal2 = modalSystem.show({ title: 'Modal 2', content: 'Content 2' });

    expect(modalSystem.modals.length).toBe(2);
    expect(modal1).not.toBe(modal2);
  });
});

// Calendar System Tests
describe('Calendar System', () => {
  let calendarSystem;
  let testContainer;

  beforeEach(() => {
    testContainer = testFramework.createTestDOM();
    testContainer.innerHTML = '<div id="calendar-container"></div>';
    calendarSystem = new CalendarSystem('#calendar-container');
  });

  afterEach(() => {
    testFramework.cleanupTestDOM();
  });

  it('should initialize calendar', () => {
    expect(calendarSystem).toBeInstanceOf(CalendarSystem);
    expect(calendarSystem.currentDate).toBeInstanceOf(Date);
    expect(calendarSystem.currentView).toBe('month');
  });

  it('should change view', () => {
    calendarSystem.setView('week');
    expect(calendarSystem.currentView).toBe('week');

    calendarSystem.setView('day');
    expect(calendarSystem.currentView).toBe('day');
  });

  it('should navigate between months', () => {
    const initialMonth = calendarSystem.currentDate.getMonth();
    
    calendarSystem.nextMonth();
    const nextMonth = calendarSystem.currentDate.getMonth();
    expect(nextMonth).toBe((initialMonth + 1) % 12);

    calendarSystem.previousMonth();
    const prevMonth = calendarSystem.currentDate.getMonth();
    expect(prevMonth).toBe(initialMonth);
  });

  it('should add and remove events', () => {
    const event = {
      id: 'test-event',
      title: 'Test Event',
      start: new Date(),
      end: new Date(Date.now() + 3600000)
    };

    calendarSystem.addEvent(event);
    expect(calendarSystem.events.length).toBe(1);
    expect(calendarSystem.events[0]).toEqual(event);

    calendarSystem.removeEvent('test-event');
    expect(calendarSystem.events.length).toBe(0);
  });
});

// Theme Manager Tests
describe('Theme Manager', () => {
  let themeManager;

  beforeEach(() => {
    // Clear localStorage
    localStorage.clear();
    themeManager = new ThemeManager();
  });

  it('should initialize with default theme', () => {
    expect(themeManager.currentTheme).toBe('light');
    expect(themeManager.autoMode).toBeFalsy();
  });

  it('should change theme', () => {
    themeManager.setTheme('dark');
    expect(themeManager.currentTheme).toBe('dark');
    expect(localStorage.getItem('theme')).toBe('dark');
  });

  it('should toggle auto mode', () => {
    themeManager.toggleAutoMode(true);
    expect(themeManager.autoMode).toBeTruthy();
    expect(localStorage.getItem('autoMode')).toBe('true');
  });

  it('should apply theme to DOM', () => {
    themeManager.setTheme('dark');
    expect(document.documentElement.classList.contains('dark')).toBeTruthy();
  });

  it('should export theme CSS', () => {
    const css = themeManager.exportThemeCSS();
    expect(css).toContain(':root');
    expect(css).toContain('--theme-');
  });
});

// Accessibility Manager Tests
describe('Accessibility Manager', () => {
  let accessibilityManager;

  beforeEach(() => {
    localStorage.clear();
    accessibilityManager = new AccessibilityManager();
  });

  it('should initialize with default settings', () => {
    expect(accessibilityManager.settings.highContrast).toBeFalsy();
    expect(accessibilityManager.settings.fontSize).toBe('normal');
    expect(accessibilityManager.settings.reducedMotion).toBeFalsy();
  });

  it('should toggle high contrast', () => {
    accessibilityManager.toggleHighContrast();
    expect(accessibilityManager.settings.highContrast).toBeTruthy();
    expect(document.body.classList.contains('high-contrast')).toBeTruthy();
  });

  it('should change font size', () => {
    accessibilityManager.setFontSize('large');
    expect(accessibilityManager.settings.fontSize).toBe('large');
    expect(document.body.classList.contains('font-large')).toBeTruthy();
  });

  it('should manage focus properly', () => {
    const element = document.createElement('button');
    testFramework.createTestDOM().appendChild(element);
    
    accessibilityManager.setFocusable(element, true);
    expect(element.getAttribute('tabindex')).toBe('0');
    
    accessibilityManager.setFocusable(element, false);
    expect(element.getAttribute('tabindex')).toBe('-1');
  });

  it('should announce messages', () => {
    const announceSpy = testFramework.mock();
    accessibilityManager.liveRegion = { textContent: '' };
    
    accessibilityManager.announce('Test message');
    expect(accessibilityManager.liveRegion.textContent).toBe('Test message');
  });
});

// Search Manager Tests
describe('Search Manager', () => {
  let searchManager;
  let testContainer;

  beforeEach(() => {
    testContainer = testFramework.createTestDOM();
    searchManager = new SearchManager();
  });

  afterEach(() => {
    testFramework.cleanupTestDOM();
  });

  it('should initialize search manager', () => {
    expect(searchManager).toBeInstanceOf(SearchManager);
    expect(searchManager.minQueryLength).toBe(2);
  });

  it('should create search bar', () => {
    const searchContainer = document.getElementById('search-container');
    expect(searchContainer).toBeTruthy();
    
    const searchInput = document.getElementById('global-search-input');
    expect(searchInput).toBeTruthy();
  });

  it('should handle search input', async () => {
    const searchInput = document.getElementById('global-search-input');
    searchInput.value = 'test query';
    
    testFramework.fireEvent(searchInput, 'input');
    
    // Wait for debounce
    await testFramework.waitFor(() => searchManager.lastQuery === 'test query', 300);
    expect(searchManager.lastQuery).toBe('test query');
  });

  it('should show suggestions', () => {
    const results = [
      { entity: 'rooms', id: '101', label: 'Room 101' },
      { entity: 'users', id: 'u1', label: 'User 1' }
    ];
    
    searchManager.renderSuggestions(results);
    
    const suggestions = document.getElementById('search-suggestions');
    expect(suggestions.children.length).toBe(2);
    expect(suggestions.classList.contains('hidden')).toBeFalsy();
  });
});

// Notification Manager Tests
describe('Notification Manager', () => {
  let notificationManager;

  beforeEach(() => {
    localStorage.clear();
    notificationManager = new NotificationManager();
  });

  it('should initialize notification manager', () => {
    expect(notificationManager).toBeInstanceOf(NotificationManager);
    expect(notificationManager.notifications).toEqual([]);
    expect(notificationManager.enabled).toBeTruthy();
  });

  it('should show notifications', () => {
    const notificationId = notificationManager.show({
      type: 'info',
      title: 'Test Notification',
      message: 'Test message'
    });

    expect(notificationId).toBeTruthy();
    expect(notificationManager.notifications.length).toBe(1);
    
    const notification = document.querySelector('.notification');
    expect(notification).toBeTruthy();
  });

  it('should dismiss notifications', () => {
    const notificationId = notificationManager.show({
      type: 'info',
      title: 'Test Notification',
      message: 'Test message'
    });

    notificationManager.dismiss(notificationId);
    
    // Wait for animation
    setTimeout(() => {
      const notification = document.querySelector('.notification');
      expect(notification).toBeFalsy();
    }, 350);
  });

  it('should handle notification types', () => {
    const types = ['info', 'success', 'warning', 'error', 'conflict', 'schedule'];
    
    types.forEach(type => {
      const method = `show${type.charAt(0).toUpperCase() + type.slice(1)}`;
      if (typeof notificationManager[method] === 'function') {
        const id = notificationManager[method]('Test', 'Message');
        expect(id).toBeTruthy();
      }
    });
  });

  it('should update notification count', () => {
    notificationManager.show({ title: 'Test 1', message: 'Message 1' });
    notificationManager.show({ title: 'Test 2', message: 'Message 2' });
    
    notificationManager.updateNotificationCount();
    
    const badge = document.getElementById('notification-count');
    expect(badge.textContent).toBe('2');
    expect(badge.classList.contains('hidden')).toBeFalsy();
  });
});

// Conflict Detector Tests
describe('Conflict Detector', () => {
  let conflictDetector;

  beforeEach(() => {
    conflictDetector = new ConflictDetector();
  });

  it('should initialize conflict detector', () => {
    expect(conflictDetector).toBeInstanceOf(ConflictDetector);
    expect(conflictDetector.conflicts).toEqual([]);
  });

  it('should detect time conflicts', () => {
    const schedule1 = {
      id: 1,
      roomId: 'R101',
      startTime: '09:00',
      endTime: '10:00',
      date: '2025-10-06'
    };
    
    const schedule2 = {
      id: 2,
      roomId: 'R101',
      startTime: '09:30',
      endTime: '10:30',
      date: '2025-10-06'
    };

    const conflicts = conflictDetector.detectConflicts([schedule1, schedule2]);
    expect(conflicts.length).toBe(1);
    expect(conflicts[0].type).toBe('room_conflict');
  });

  it('should detect capacity conflicts', () => {
    const schedule = {
      roomId: 'R101',
      capacity: 50,
      attendees: 60
    };
    
    const room = {
      id: 'R101',
      capacity: 50
    };

    const isValid = conflictDetector.validateCapacity(schedule, room);
    expect(isValid).toBeFalsy();
  });

  it('should suggest resolutions', () => {
    const conflict = {
      type: 'room_conflict',
      schedules: [
        { id: 1, roomId: 'R101', startTime: '09:00', endTime: '10:00' },
        { id: 2, roomId: 'R101', startTime: '09:30', endTime: '10:30' }
      ]
    };

    const suggestions = conflictDetector.suggestResolutions(conflict);
    expect(suggestions.length).toBeGreaterThan(0);
    expect(suggestions[0]).toHaveProperty('type');
    expect(suggestions[0]).toHaveProperty('description');
  });
});

// Performance Tests
describe('Performance Tests', () => {
  it('should benchmark modal creation', () => {
    const modalSystem = new ModalSystem();
    
    const avgTime = testFramework.benchmark('Modal Creation', () => {
      const modalId = modalSystem.show({
        title: 'Benchmark Modal',
        content: '<p>Benchmark content</p>'
      });
      modalSystem.close(modalId);
    }, 100);

    expect(avgTime).toBeLessThan(10); // Should be under 10ms
  });

  it('should benchmark calendar rendering', () => {
    const container = testFramework.createTestDOM();
    container.innerHTML = '<div id="calendar"></div>';
    
    const avgTime = testFramework.benchmark('Calendar Rendering', () => {
      const calendar = new CalendarSystem('#calendar');
      calendar.render();
    }, 50);

    expect(avgTime).toBeLessThan(50); // Should be under 50ms
    testFramework.cleanupTestDOM();
  });

  it('should benchmark search operations', () => {
    const searchManager = new SearchManager();
    
    const avgTime = testFramework.benchmark('Search Operations', () => {
      searchManager.mockSearch('test query');
    }, 1000);

    expect(avgTime).toBeLessThan(1); // Should be under 1ms for mock
  });
});

// Integration Tests
describe('Integration Tests', () => {
  it('should integrate theme manager with accessibility', () => {
    const themeManager = new ThemeManager();
    const accessibilityManager = new AccessibilityManager();
    
    // Change theme
    themeManager.setTheme('dark');
    
    // Check if accessibility features work with dark theme
    accessibilityManager.toggleHighContrast();
    
    expect(document.documentElement.classList.contains('dark')).toBeTruthy();
    expect(document.body.classList.contains('high-contrast')).toBeTruthy();
  });

  it('should integrate notifications with accessibility', () => {
    const notificationManager = new NotificationManager();
    const accessibilityManager = new AccessibilityManager();
    
    // Mock announce method
    const announceSpy = testFramework.mock();
    accessibilityManager.announce = announceSpy;
    
    notificationManager.showInfo('Test', 'Integration test message');
    
    expect(announceSpy.callCount).toBe(1);
  });

  it('should integrate conflict detector with notifications', () => {
    const conflictDetector = new ConflictDetector();
    const notificationManager = new NotificationManager();
    
    // Mock notification method
    const notificationSpy = testFramework.mock();
    notificationManager.showConflict = notificationSpy;
    
    const conflicts = conflictDetector.detectConflicts([
      { id: 1, roomId: 'R101', startTime: '09:00', endTime: '10:00', date: '2025-10-06' },
      { id: 2, roomId: 'R101', startTime: '09:30', endTime: '10:30', date: '2025-10-06' }
    ]);
    
    if (conflicts.length > 0) {
      notificationManager.showConflict('Conflict Detected', 'Room scheduling conflict found');
      expect(notificationSpy.callCount).toBe(1);
    }
  });
});

// Export test runner
window.runAllTests = async function() {
  console.log('🧪 Running Room Management System Tests...');
  await testFramework.runTests();
  return testFramework.results;
};