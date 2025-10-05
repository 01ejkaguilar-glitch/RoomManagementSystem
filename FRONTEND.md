# Frontend Conventions — MinSU Room Management System (Phase 1)

## 1. Layout & Structure
- All pages use a shared layout (`views/layouts/base.xian`) with:
  - Sidebar navigation (`partials/sidebar.xian`)
  - Topbar with page title, breadcrumbs, user menu (`partials/topbar.xian`)
  - Flash alerts (`partials/alerts.xian`)
  - Footer (`partials/footer.xian`)
  - Main content slot (`{{{ body }}}`)
- Auth pages (login, register, forgot password) use content-only sections, styled for minimal distraction.

## 2. Page Templates
- Each view (e.g., `dashboard.xian`, `colleges.xian`) contains only the content section (no `<html>`, `<head>`, `<body>`, or footer tags).
- Breadcrumbs are set at the top of each view using:
  ```
  {{#set 'breadcrumbs'}}
    [ { "label": "Dashboard", "url": "/dashboard" }, ... ]
  {{/set}}
  ```
- Use semantic headings (`<h2 class="text-2xl font-bold">`) for page titles.

## 3. Styling & Components
- Tailwind CSS is used for all styling, with a custom config (`tailwind.config.js`) for brand colors and tokens.
- Custom utility classes are defined in `resources/css/app.css` using `@layer components`:
  - `.btn`, `.btn-primary`, `.card`, `.badge`, `.badge-green`, `.badge-red`, `.sidebar-link`, `.sidebar-link-active`, `.breadcrumb`
- Use these classes for consistent UI elements:
  - Buttons: `<button class="btn btn-primary">...`</button>
  - Cards: `<div class="card">...`</div>
  - Badges: `<span class="badge badge-green">Available</span>`
- Sidebar links highlight the active page using the `activeRoute` variable.

## 4. Navigation & Breadcrumbs
- Breadcrumbs are rendered via `partials/breadcrumbs.xian` and should be set per page for navigation context.
- Example:
  ```
  {{#set 'breadcrumbs'}}
    [ { "label": "Dashboard", "url": "/dashboard" }, { "label": "Colleges", "url": "/colleges" } ]
  {{/set}}
  ```

## 5. Flash Alerts
- Use `req.flash('success_msg', '...')` or `req.flash('error_msg', '...')` in controllers to show alerts.
- Alerts are rendered at the top of the main content area via `partials/alerts.xian`.

## 6. File Naming & Organization
- Views: `views/*.xian` for main pages, `views/partials/*.xian` for reusable components.
- Layout: `views/layouts/base.xian` is the main wrapper.
- CSS: Source in `resources/css/app.css`, output in `public/css/app.css` (built by Tailwind CLI).

## 7. Adding a New Page
1. Create a new `.xian` file in `views/` with only the content section.
2. Set breadcrumbs at the top if needed.
3. Use Tailwind utility classes and custom components for layout and styling.
4. Add a route and controller as needed.

## 8. Development Workflow
- Run Tailwind and the server together:
  ```
  npm run ui:dev
  ```
- Edit `resources/css/app.css` for custom styles/components.
- Use the Tailwind VS Code extension for best experience (syntax highlighting, class suggestions).

## 9. Accessibility & Responsiveness
- Use semantic HTML elements and headings.
- All layouts and components are designed to be responsive via Tailwind’s grid and flex utilities.

## 10. Extending the System
- Add new partials for reusable UI (e.g., modals, tables) in `views/partials/`.
- Update `tailwind.config.js` to add new color tokens or breakpoints as needed.

---

For any new contributors: follow these conventions for consistency and maintainability. See existing views and partials for examples.
