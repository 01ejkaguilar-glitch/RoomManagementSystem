# Frontend Documentation — Room Management System (Complete System)

## Overview
This comprehensive frontend documentation covers all phases of the Room Management System, from basic layout to advanced UI/UX features including accessibility, themes, notifications, performance monitoring, and testing.

## System Architecture
## 10. Accessibility & Responsiveness

### WCAG 2.1 Compliance
The system includes comprehensive accessibility features:

- **High Contrast Mode**: Enhanced visibility for low vision users
- **Font Size Control**: Adjustable text sizing (small, normal, large, extra-large)
- **Reduced Motion**: Respect user's motion preferences
- **Keyboard Navigation**: Full keyboard accessibility with visible focus indicators
- **Screen Reader Support**: ARIA labels, live regions, and semantic markup
- **Color Contrast**: Sufficient contrast ratios for all text and interactive elements

### Accessibility Controls
Users can access accessibility options via the dedicated panel:

```javascript
// Programmatic accessibility control
accessibilityManager.toggleHighContrast();
accessibilityManager.setFontSize('large');
accessibilityManager.toggleReducedMotion();
accessibilityManager.announce('Custom screen reader message');
```

### Focus Management
- **Tab Order**: Logical tab navigation throughout all interfaces
- **Focus Trapping**: Modal dialogs trap focus appropriately
- **Skip Links**: Quick navigation to main content
- **Focus Indicators**: Clear visual focus indicators

### Responsive Design
- **Mobile-First**: Responsive design using Tailwind's breakpoint system
- **Touch-Friendly**: Appropriate touch targets for mobile devices
- **Flexible Layouts**: Grid and flexbox layouts adapt to screen sizes
- **Content Priority**: Important content prioritized on smaller screens

### Testing Accessibility
- **Screen Reader Testing**: Test with NVDA, JAWS, or VoiceOver
- **Keyboard Testing**: Navigate entire interface using only keyboard
- **Color Blind Testing**: Verify interfaces work without color dependency
- **Contrast Testing**: Use accessibility panel's high contrast mode

## 11. Extending the System

### Adding New Components
```javascript
// Create new reusable components in views/partials/
// Example: views/partials/data-table.xian

// Add corresponding JavaScript module
// Example: public/js/data-table.js
class DataTable {
  constructor(selector, options) {
    this.element = document.querySelector(selector);
    this.options = { sortable: true, filterable: true, ...options };
    this.init();
  }
  
  init() {
    this.setupSorting();
    this.setupFiltering();
    this.bindEvents();
  }
}

// Register with global system
window.DataTable = DataTable;
```

### Theme Customization
```javascript
// Add custom themes
themeManager.addCustomTheme('purple', {
  name: 'Purple',
  primary: '#8b5cf6',
  background: '#faf5ff',
  surface: '#f3e8ff',
  text: '#581c87',
  textSecondary: '#7c3aed'
});
```

### Performance Optimization
```javascript
// Track custom metrics
performanceMonitor.recordMetric('customOperation', {
  duration: operationTime,
  success: true
});

// Optimize with caching
const cachedData = performanceMonitor.getFromCache('api-key');
if (!cachedData) {
  const data = await fetchData();
  performanceMonitor.setCache('api-key', data, 5 * 60 * 1000);
}
```

### Adding New Tests
```javascript
// Add to tests/unit-tests.js
describe('New Component', () => {
  beforeEach(() => {
    // Setup
  });
  
  it('should perform expected behavior', () => {
    expect(component.method()).toBeTruthy();
  });
});
```

### Configuration Updates
- **Tailwind Config**: Update `tailwind.config.js` for new colors or breakpoints
- **Performance Thresholds**: Adjust in `performance-monitor.js` configuration
- **Accessibility Settings**: Customize in `accessibility-manager.js`
- **Theme Options**: Add new themes in `theme-manager.js`

## 12. Best Practices

### Code Organization
- Keep JavaScript modules focused and single-purpose
- Use consistent naming conventions across all files
- Implement proper error handling and fallbacks
- Write comprehensive tests for new features

### Performance
- Use performance monitor to track new features
- Implement caching for expensive operations
- Optimize images and assets
- Monitor memory usage and prevent leaks

### Accessibility
- Test with screen readers and keyboard navigation
- Provide alternative text for images and icons
- Ensure sufficient color contrast
- Use semantic HTML elements

### User Experience
- Provide clear feedback for user actions
- Implement loading states for async operations
- Use consistent interaction patterns
- Test across different devices and browsers

## 13. Troubleshooting

### Common Issues

**Theme not applying**: Check if theme-manager.js is loaded and CSS custom properties are defined

**JavaScript errors**: Open browser DevTools console and check for module loading issues

**Performance issues**: Use performance monitor to identify bottlenecks

**Accessibility problems**: Use accessibility panel to test features and check browser DevTools Accessibility tab

**Calendar not working**: Verify calendar-system.js is loaded and container element exists

**Notifications not showing**: Check if notification-manager.js is loaded and permissions are granted

### Debug Mode
```javascript
// Enable debug logging
window.DEBUG = true;

// Check system status
console.log('Systems loaded:', {
  modal: !!window.modalSystem,
  calendar: !!window.calendarSystem,
  theme: !!window.themeManager,
  accessibility: !!window.accessibilityManager,
  notifications: !!window.notificationManager,
  performance: !!window.performanceMonitor
});
```

---

## Documentation Status
- ✅ **Complete System Documentation**: All phases and features documented
- ✅ **Code Examples**: Comprehensive usage examples provided
- ✅ **Best Practices**: Development guidelines established
- ✅ **Troubleshooting**: Common issues and solutions documented

For new contributors: Follow these conventions and refer to existing implementations for examples. The system is fully documented and production-ready with comprehensive testing, accessibility compliance, and performance optimization.Framework
- **XianFire Framework**: Custom templating system with Handlebars integration
- **Layout System**: Shared layout structure with modular components
- **Styling**: Tailwind CSS with custom utility classes and themes
- **JavaScript Modules**: Component-based architecture with ES6 modules

### Phase Implementation Status
- ✅ **Phase 1**: Basic Layout & Navigation
- ✅ **Phase 2**: Tables & Data Management  
- ✅ **Phase 3**: Forms & Validation
- ✅ **Phase 4**: Modal System & CRUD Operations
- ✅ **Phase 5**: Calendar Integration & Scheduling
- ✅ **Phase 6**: Advanced UI/UX (Accessibility, Dark Mode, Search, Notifications)
- ✅ **Phase 7**: Testing, Performance & Documentation

## 1. Layout & Structure
- All pages use a shared layout (`views/layouts/base.xian`) with:
  - Sidebar navigation (`partials/sidebar.xian`) with analytics link
  - Topbar with page title, breadcrumbs, user menu (`partials/topbar.xian`)
  - Flash alerts (`partials/alerts.xian`)
  - Footer (`partials/footer.xian`)
  - Main content slot (`{{{ body }}}`)
  - Theme manager and accessibility controls (auto-injected)
- Auth pages (login, register, forgot password) use content-only sections, styled for minimal distraction.

## 2. Page Templates & Views
- Each view (e.g., `dashboard.xian`, `colleges.xian`, `analytics.xian`) contains only the content section (no `<html>`, `<head>`, `<body>`, or footer tags).
- **Special Views**:
  - `calendar.xian`: Main calendar interface with multiple view modes
  - `weekly-schedule.xian`: Weekly calendar view with conflict detection
  - `daily-schedule.xian`: Daily schedule view with detailed time slots
  - `analytics.xian`: Comprehensive analytics dashboard with charts
- Breadcrumbs are set at the top of each view using:
  ```
  {{#set 'breadcrumbs'}}
    [ { "label": "Dashboard", "url": "/dashboard" }, ... ]
  {{/set}}
  ```
- Use semantic headings (`<h2 class="text-2xl font-bold">`) for page titles.

## 3. Styling & Components
- **Tailwind CSS** with custom config (`tailwind.config.js`) for brand colors and tokens
- **Theme System**: CSS custom properties for light/dark/blue/green themes
- **Custom Utility Classes** in `resources/css/app.css` using `@layer components`:
  - `.btn`, `.btn-primary`, `.card`, `.badge`, `.badge-green`, `.badge-red`
  - `.sidebar-link`, `.sidebar-link-active`, `.breadcrumb`
  - `.modal`, `.notification`, `.calendar-cell`, `.accessibility-controls`

### Component Usage:
- **Buttons**: `<button class="btn btn-primary">...</button>`
- **Cards**: `<div class="card">...</div>`
- **Badges**: `<span class="badge badge-green">Available</span>`
- **Modals**: Managed by `modal-system.js`
- **Notifications**: Managed by `notification-manager.js`
- **Calendar**: Managed by `calendar-system.js`

### Theme Integration:
- All components use CSS custom properties for theming
- Automatic dark mode detection and manual theme switching
- High contrast mode and accessibility customizations
- Sidebar links highlight the active page using the `activeRoute` variable

## 4. JavaScript Architecture

### Core Modules
All JavaScript modules are loaded in `views/partials/head.xian`:

- **`modal-system.js`**: Dynamic modal creation and management
- **`table-enhancements.js`**: Advanced table features (sorting, filtering, pagination)
- **`calendar-system.js`**: Calendar views, navigation, and event management
- **`conflict-detector.js`**: Real-time scheduling conflict detection
- **`accessibility-manager.js`**: WCAG 2.1 compliance and customization
- **`theme-manager.js`**: Dark mode and theme switching
- **`search-manager.js`**: Global search with autocomplete
- **`notification-manager.js`**: Real-time notifications and alerts
- **`performance-monitor.js`**: Performance tracking and optimization
- **`test-framework.js`**: Comprehensive testing system

### Module Initialization
```javascript
// All modules initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.modalSystem = new ModalSystem();
  window.calendarSystem = new CalendarSystem();
  window.accessibilityManager = new AccessibilityManager();
  window.themeManager = new ThemeManager();
  // ... other modules
});
```

### Global APIs
```javascript
// Modal System
window.modalSystem.show({ title: 'Title', content: 'Content' });

// Notifications
window.notificationManager.showSuccess('Success!', 'Operation completed');

// Theme Management
window.themeManager.setTheme('dark');

// Accessibility
window.accessibilityManager.announce('Screen reader message');

// Performance Tracking
window.performanceMonitor.trackInteraction(element, 'click');
```

## 5. Navigation & Breadcrumbs
- **Sidebar Navigation**: Includes all major sections plus Analytics link
- **Breadcrumbs**: Rendered via `partials/breadcrumbs.xian` and should be set per page
- **Search**: Global search bar with autocomplete (auto-injected)
- **Theme Controls**: Theme switching panel (auto-injected)
- **Accessibility Controls**: WCAG compliance panel (auto-injected)
- **Notification Center**: Bell icon with notification history (auto-injected)

Example breadcrumb setup:
```handlebars
{{#set 'breadcrumbs'}}
  [
    { "label": "Dashboard", "url": "/dashboard" },
    { "label": "Analytics", "url": "/analytics" },
    { "label": "Room Utilization", "url": "/analytics/rooms" }
  ]
{{/set}}
```

## 6. Flash Alerts & Notifications

### Traditional Flash Messages
- Use `req.flash('success_msg', '...')` or `req.flash('error_msg', '...')` in controllers
- Alerts are rendered at the top of the main content area via `partials/alerts.xian`

### Advanced Notification System
```javascript
// Toast notifications
notificationManager.showSuccess('Title', 'Message');
notificationManager.showError('Error', 'Something went wrong');
notificationManager.showWarning('Warning', 'Please check your input');
notificationManager.showInfo('Info', 'System update available');

// Scheduling-specific notifications
notificationManager.showConflict('Schedule Conflict', 'Room double-booked');
notificationManager.showScheduleUpdate('Schedule Changed', 'Room 101 updated');

// With action buttons
notificationManager.show({
  type: 'warning',
  title: 'Unsaved Changes',
  message: 'You have unsaved changes. Save before leaving?',
  actions: [
    { label: 'Save', action: () => saveChanges() },
    { label: 'Discard', action: () => discardChanges() }
  ]
});
```

### Notification Features
- **Toast Notifications**: Auto-dismissing popup messages
- **Notification Center**: Persistent history with bell icon
- **Sound Alerts**: Optional audio notifications
- **Browser Notifications**: System-level notifications when permitted
- **Accessibility Integration**: Screen reader announcements

## 7. File Naming & Organization

### Views Structure
```
views/
├── layouts/
│   └── base.xian              # Main layout wrapper
├── partials/
│   ├── head.xian              # HTML head with all scripts
│   ├── sidebar.xian           # Navigation sidebar
│   ├── topbar.xian            # Page header
│   ├── alerts.xian            # Flash message alerts
│   ├── breadcrumbs.xian       # Navigation breadcrumbs
│   └── footer.xian            # Page footer
├── dashboard.xian             # Main dashboard
├── colleges.xian              # College management
├── buildings.xian             # Building management
├── rooms.xian                 # Room management
├── schedules.xian             # Schedule management
├── settings.xian              # System settings
├── calendar.xian              # Calendar interface
├── weekly-schedule.xian       # Weekly calendar view
├── daily-schedule.xian        # Daily calendar view
├── analytics.xian             # Analytics dashboard
├── login.xian                 # Authentication
├── register.xian              # User registration
└── forgotpassword.xian        # Password reset
```

### JavaScript Structure
```
public/js/
├── modal-system.js            # Modal management
├── table-enhancements.js      # Table features
├── calendar-system.js         # Calendar functionality
├── conflict-detector.js       # Scheduling conflicts
├── accessibility-manager.js   # WCAG compliance
├── theme-manager.js           # Dark mode & themes
├── search-manager.js          # Global search
├── notification-manager.js    # Notifications
├── performance-monitor.js     # Performance tracking
└── test-framework.js          # Testing system
```

### CSS Structure
- **Source**: `resources/css/app.css` (Tailwind + custom components)
- **Output**: `public/css/app.css` (built by Tailwind CLI)
- **Themes**: CSS custom properties for dynamic theming

## 8. Adding a New Page

### Basic Page Creation
1. Create a new `.xian` file in `views/` with only the content section
2. Set breadcrumbs at the top if needed
3. Use Tailwind utility classes and custom components for layout
4. Add route and controller as needed

### Advanced Features Integration
```handlebars
{{!-- Example new page with all features --}}
{{#set 'breadcrumbs'}}
  [{ "label": "Dashboard", "url": "/dashboard" }, { "label": "New Page", "url": "/new-page" }]
{{/set}}

<div class="space-y-6">
  <div class="flex justify-between items-center">
    <h2 class="text-2xl font-bold text-gray-900 dark:text-white">New Page</h2>
    <button onclick="modalSystem.show({title: 'Add Item', content: 'Form content'})" 
            class="btn btn-primary">
      Add New Item
    </button>
  </div>
  
  {{!-- Enhanced table with sorting and filtering --}}
  <div class="card">
    <table class="enhanced-table" data-sortable="true" data-filterable="true">
      <thead>
        <tr>
          <th data-sort="name">Name</th>
          <th data-sort="date">Date</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {{#each items}}
        <tr>
          <td>{{this.name}}</td>
          <td>{{this.date}}</td>
          <td>
            <button onclick="editItem('{{this.id}}')">Edit</button>
            <button onclick="deleteItem('{{this.id}}')">Delete</button>
          </td>
        </tr>
        {{/each}}
      </tbody>
    </table>
  </div>
</div>

<script>
// Custom page JavaScript
function editItem(id) {
  // Track interaction for performance
  const tracker = performanceMonitor.trackInteraction(event.target, 'edit');
  
  modalSystem.show({
    title: 'Edit Item',
    content: `Edit form for item ${id}`,
    actions: [{
      label: 'Save',
      action: () => {
        // Save logic
        notificationManager.showSuccess('Saved', 'Item updated successfully');
        tracker(); // Complete performance tracking
      }
    }]
  });
}
</script>
```

## 9. Development Workflow

### Running the System
```bash
# Development mode with hot reload
npm run ui:dev

# Build for production
npm run build

# Run tests
npm run test
```

### Testing
- **Test Runner**: Open `tests/test-runner.html` in browser
- **Unit Tests**: Individual component testing
- **Integration Tests**: Cross-component interaction testing
- **Performance Tests**: Speed and efficiency benchmarks
- **Automated Testing**: Run via `window.runAllTests()`

### Performance Monitoring
- **Real-time Monitoring**: Performance panel in bottom-right corner
- **Metrics Tracked**: Page load, interactions, API calls, memory usage, cache performance
- **Optimization Tools**: Cache management, garbage collection, performance recommendations
- **Export Reports**: JSON performance reports for analysis

### Debugging Tools
- **Theme Inspector**: Test different themes and accessibility modes
- **Notification Testing**: Test notification system with different types
- **Performance Profiling**: Track function execution times and memory usage
- **Search Testing**: Verify search functionality and autocomplete

### Code Quality
- Use Tailwind VS Code extension for class suggestions
- Follow accessibility guidelines (WCAG 2.1)
- Implement performance best practices
- Write tests for new features
- Use semantic HTML elements

## 9. Accessibility & Responsiveness
- Use semantic HTML elements and headings.
- All layouts and components are designed to be responsive via Tailwind’s grid and flex utilities.

## 10. Extending the System
- Add new partials for reusable UI (e.g., modals, tables) in `views/partials/`.
- Update `tailwind.config.js` to add new color tokens or breakpoints as needed.

---

For any new contributors: follow these conventions for consistency and maintainability. See existing views and partials for examples.
