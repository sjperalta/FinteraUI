# FinteraUI AI Coding Agent Instructions

## Project Overview
React 18 + Vite PWA for real estate financial contract management. Spanish-first bilingual (ES/EN) with JWT auth, dark mode, and mobile-responsive design using Tailwind CSS.

## Critical Architecture Patterns

### Authentication & Authorization
- **Token Management**: JWT stored in `localStorage` with auto-refresh via `AuthContext` (`src/context/AuthContext.jsx`)
- **Route Protection**: Three guard levels:
  - `ProtectedRoute`: Any authenticated user
  - `AdminRoute`: Admin role only (`src/component/protectedRoute/AdminRoute.jsx`)
  - `AdminOrOwnerRoute`: Admin or resource owner (`src/component/protectedRoute/AdminOrOwnerRoute.jsx`)
- **Auth Helper**: Use `getToken()` from `auth.js` for API calls, NOT from context directly
- **Token Refresh**: Automatic every 5 minutes, triggers 30s before expiration

### API Integration
- **Base URL**: `${API_URL}` from `config.js` (uses `import.meta.env.VITE_API_URL`)
- **Headers Pattern**: Always include `Authorization: Bearer ${token}` and `Content-Type: application/json`
- **Error Handling**: Check `response.ok`, parse `data.errors` or `data.error`, handle network failures gracefully

### Internationalization (i18n)
- **Context**: `LocaleContext` (`src/contexts/LocaleContext.jsx`) with `useLocale()` hook
- **Translation Function**: `t("key.nested.path", { param: value })` with parameter interpolation
- **File Structure**: `src/locales/en.json` and `src/locales/es.json` (JSON nested objects)
- **Missing Keys**: Falls back to English, logs warning, returns key if not found
- **Default Locale**: Spanish (`es`), stored in `localStorage` as `userLocale`

### Component Architecture Patterns

#### Reusable UI Components (Component Library)
**Location**: `src/component/ui/`

1. **GenericList** (`GenericList.jsx`) - Universal paginated list component
   - **Use for**: Any entity list (users, projects, contracts, payments)
   - **Render Props Pattern**: `renderItem(item, index, isMobileCard, handleClick) => JSX`
   - **Dual Views**: Mobile cards (visible on `<lg`) + Desktop table (`hidden lg:block`)
   - **Item Component Contract**: Must support `isMobileCard` prop:
     - `isMobileCard={true}`: Return full card div
     - `isMobileCard={false}`: Return only `<td>` elements (GenericList wraps in `<tr>`)
   - **Props**: `endpoint`, `renderItem`, `filters`, `onItemSelect`, `columns`, `entityName`, `itemsPerPage`
   - **API Response**: Supports `{users: []}`, `{items: []}`, `{data: []}`, or flat array

2. **SearchFilterBar** (`SearchFilterBar.jsx`) - Search + filter + actions bar
   - **Debounced Search**: 500ms delay using `lodash.debounce`
   - **Filter Dropdown**: `filterOptions` as `[{value, label}]`
   - **Action Buttons**: `actions` as `[{label, onClick, className, icon}]`
   - **Props**: `searchTerm`, `filterValue`, `onSearchChange`, `onFilterChange`, `actions`

3. **Pagination** (built into GenericList) - Enhanced pagination
   - **Features**: Page numbers with ellipsis, first/last buttons, items per page selector
   - **Translation Keys**: `common.page`, `common.of`, `common.previous`, `common.next`, `common.firstPage`, `common.lastPage`, `common.itemsPerPage`

#### Component Refactoring Pattern (See `UserData.jsx`)
When abstracting components for GenericList:
```jsx
function ItemComponent({ item, index, onClick, isMobileCard = false }) {
  if (isMobileCard) {
    return (<div className="card">{/* Mobile card content */}</div>);
  }
  // Desktop table row - ONLY return <td> elements, NO <tr>
  return (
    <>
      <td className="px-6 py-4">{/* Cell 1 */}</td>
      <td className="px-6 py-4">{/* Cell 2 */}</td>
    </>
  );
}
```

### Routing Structure
- **Router**: `src/Router.jsx` using React Router v6 `createBrowserRouter`
- **Layout Wrapper**: `src/component/layout/` wraps all authenticated routes
- **Nested Routes**: Settings and Financing use nested child routes
- **Navigation State**: Pass data via `navigate("/path", { state: { key: value } })`, access with `useLocation().state`
- **Error Boundary**: `RouteErrorElement` for route-level error handling

### State Management
- **No Global State Library**: Uses React Context for auth and locale only
- **Local State**: `useState` in pages, avoid prop drilling with composition
- **Server State**: Fetch in `useEffect`, store in local state, no caching layer
- **Form State**: Controlled components with `useState`, validate before submit

### Styling Conventions

#### Tailwind CSS Patterns
- **Dark Mode**: Use `dark:` prefix for all color classes (enforced by `darkMode: "class"`)
- **Responsive**: Mobile-first with breakpoints: `sm:`, `md:`, `lg:`, `xl:`, `2xl:`
- **Color Palette**: Custom colors in `tailwind.config.js`:
  - Primary: `success-300` (#22C55E green)
  - Dark backgrounds: `darkblack-600`, `darkblack-700`
  - Errors: `error-200` (#FF4747 red)
  - Alternate rows: `bg-white dark:bg-darkblack-600` and `bg-gray-50 dark:bg-darkblack-500`
- **Common Classes**:
  - Cards: `bg-white dark:bg-darkblack-600 rounded-lg border border-gray-200 dark:border-darkblack-400`
  - Buttons: `bg-success-300 hover:bg-success-400 text-white font-bold rounded-lg px-4 py-2`
  - Inputs: Use `@tailwindcss/forms` plugin styles

#### Component Styling Guidelines
- **Hover States**: Always include for interactive elements (`hover:bg-*`, `hover:shadow-lg`)
- **Transitions**: Use `transition-colors duration-150` or `transition-all`
- **Loading States**: Spinning border animation: `animate-spin rounded-full border-b-2 border-blue-500`
- **Empty States**: Centered with icon, message, helper text

### Date Handling
- **Library**: `date-fns` (NOT moment.js)
- **Formatting**: `format(parseISO(dateString), "PPP", { locale: es })` for display
- **Locale Import**: `import { es, enUS } from "date-fns/locale"`, use based on `locale` state
- **Common Formats**: 
  - Display: `"PPP"` (e.g., "Apr 29, 2021")
  - API: ISO 8601 strings (`dateString` as-is)

### Business Logic Patterns

#### Overdue Payment Calculation (Critical - See PaymentHistory)
**Rule**: Overdue is client-side calculated, NOT from `payment.status` field
```javascript
const isOverdue = payment.due_date && !payment.payment_date && new Date(payment.due_date) < new Date();
```
- **Never** use `payment.status === "overdue"` for visual indicators
- **Display**: Red background `bg-red-50 dark:bg-red-900/10`, red text for amounts

#### Interest Display (Critical - See PaymentHistory)
- **Location**: Next to amount, NOT in description
- **Pattern**: 
  ```jsx
  {payment.interest_amount > 0 && (
    <div className="text-xs text-red-600 dark:text-red-400">
      +{formatCurrency(payment.interest_amount, payment.contract.currency)} {t("paymentHistory.interest")}
    </div>
  )}
  ```

### Testing Strategy
- **Framework**: Vitest + Testing Library (configured in `package.json`)
- **Environment**: jsdom for DOM testing
- **Run Tests**: `npm test`
- **File Location**: Co-located `*.test.jsx` or `__tests__/` directory
- **Mock API**: Mock `fetch` calls, avoid real API in tests
- **Coverage**: Aim for 80%+ on new components

### Build & Deployment

#### Development
```bash
npm run dev              # Start Vite dev server (localhost:5173)
npm run lint             # ESLint check
npm test                 # Run Vitest
```

#### Production Build
```bash
npm run build            # Vite production build -> dist/
npm run preview          # Preview production build locally
npm start                # Serve dist/ with 'serve' (for Railway/Heroku)
```

#### Environment Variables
- **Required**: `VITE_API_URL` (API base URL)
- **Optional**: `VITE_APP_ENV` (development/staging/production)
- **Access**: `import.meta.env.VITE_*` (NOT `process.env`)

#### PWA Configuration
- **Plugin**: `vite-plugin-pwa` with Workbox strategies
- **Manifest**: `vite.config.js` defines app name, icons, theme colors
- **Assets**: `pwa-64x64.png`, `pwa-192x192.png`, `pwa-512x512.png`, `maskable-icon-512x512.png`
- **Service Worker**: Auto-registered, caches JS/CSS/HTML/images with `StaleWhileRevalidate`

### Code Style Rules (ENFORCE STRICTLY)

#### Strings & Quotes
- **Always use double quotes** for strings: `"example"`, NOT `'example'`
- **JSX attributes**: Double quotes: `<div className="example">`
- **Template literals**: Only when interpolating: `` `Hello ${name}` ``

#### Testing (When writing tests)
- **Expectations**: Use `expect` over `allow` for message expectations
- **No Test Mocks in Production Code**: Keep test doubles in test files only

#### Dependency Injection
- **Avoid dependency injection patterns** in code and tests
- **Direct imports**: Import dependencies directly: `import { getToken } from "../../../auth"`
- **No constructor injection**: Use static imports, not class/function parameters for dependencies

#### PropTypes (Required)
- **All components** must have PropTypes validation
- **Pattern**:
  ```javascript
  ComponentName.propTypes = {
    requiredProp: PropTypes.string.isRequired,
    optionalProp: PropTypes.number,
    objectProp: PropTypes.shape({
      key: PropTypes.string
    })
  };
  ```

### Common Pitfalls & Solutions

#### Problem: GenericList items not rendering
**Solution**: Ensure `entityName` prop matches API response key. API returns `{users: []}`, set `entityName="users"`.

#### Problem: Translation keys showing instead of text
**Solution**: Add missing keys to BOTH `src/locales/en.json` AND `es.json`. Use nested structure matching `t()` calls.

#### Problem: Dark mode colors not working
**Solution**: Add `dark:` prefix to all color classes. Check `<html>` has `class="dark"` applied via theme toggle.

#### Problem: Pagination not working
**Solution**: API must return `pagination: { page, pages }` metadata. GenericList expects this structure.

#### Problem: Mobile view not showing
**Solution**: Use `block lg:hidden` for mobile, `hidden lg:block` for desktop. Check Tailwind breakpoint classes.

#### Problem: Token expired errors
**Solution**: AuthContext auto-refreshes tokens. Ensure `refresh_token` in localStorage. Check backend refresh endpoint.

### File Organization Guidelines

#### When creating new pages:
1. Create directory: `src/pages/entityName/`
2. Main component: `src/pages/entityName/index.jsx`
3. Subcomponents: `src/pages/entityName/components/` (if complex)
4. Use GenericList for list views when possible

#### When creating new components:
1. Reusable UI: `src/component/ui/` (SearchFilterBar, GenericList pattern)
2. Feature-specific: `src/component/featureName/` (contracts, payments, etc.)
3. Export from `index.jsx` if multiple related components

#### Documentation:
- **Component docs**: Create `ComponentName_COMPONENT.md` in `documentation/`
- **Implementation guides**: Create `FEATURE_IMPLEMENTATION.md` in `documentation/`
- **Include**: Props API, usage examples, migration guides

### Recent Architectural Decisions

1. **GenericList Abstraction** (Jan 2025): Unified list component for all entities. See `GENERICLIST_COMPONENT.md` and `GENERICLIST_IMPLEMENTATION.md`.

2. **SearchFilterBar Abstraction**: Reusable search/filter bar replacing inline filter components. See `documentation/SEARCHFILTERBAR_COMPONENT.md`.

3. **Payment History Refactoring**: Split monolithic component into 12 subcomponents for maintainability. Enforced overdue calculation rules.

4. **Enhanced Pagination**: Added page numbers, first/last buttons, items per page selector (5/10/25/50/100 options).

### Quick Reference: Common Tasks

#### Add a new entity list page:
1. Create page component with SearchFilterBar + GenericList
2. Define `columns` array for table headers
3. Create or adapt item component with `isMobileCard` support
4. Define `renderItem` function using render props pattern
5. Add translation keys for entity-specific empty/loading messages

#### Add a new API endpoint call:
```javascript
const response = await fetch(`${API_URL}/api/v1/endpoint`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`
  },
  body: JSON.stringify(data)
});
if (!response.ok) {
  const errorData = await response.json();
  throw new Error(errorData.errors || "Request failed");
}
const result = await response.json();
```

#### Add translation keys:
1. Edit `src/locales/en.json` and `src/locales/es.json`
2. Use nested structure: `{ "section": { "key": "value" } }`
3. Access via `t("section.key")` or `t("section.key", { param: "value" })`

#### Add a protected route:
```javascript
// In src/Router.jsx
{
  path: "/new-route",
  element: (
    <ProtectedRoute>
      <NewComponent />
    </ProtectedRoute>
  )
}
```

---

**Key Documentation Files**:
- `README.md` - Project setup, tech stack, development workflow
- `GENERICLIST_COMPONENT.md` - GenericList API reference
- `documentation/SEARCHFILTERBAR_COMPONENT.md` - SearchFilterBar usage
- `documentation/QA-SCENARIOS.md` - QA test scenarios

**When in doubt**: Check existing implementations in `src/pages/users/index.jsx` (GenericList), `src/pages/paymentHistory/` (component composition), or `src/component/ui/` (reusable patterns).

