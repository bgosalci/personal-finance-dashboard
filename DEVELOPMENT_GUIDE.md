# Development Guide

## Development Environment Setup

### Prerequisites
- Modern web browser with developer tools
- Text editor or IDE (VS Code, Sublime Text, etc.)
- Basic HTML/CSS/JavaScript knowledge
- Optional: Finnhub API key for real-time quotes

### Local Development
1. Clone the repository.
2. Serve `app/` with a local server (recommended for fetch APIs):
   ```bash
   python3 -m http.server 8000
   # Then visit http://localhost:8000/app/
   ```
3. Alternatively, open `app/index.html` directly for offline-only usage.

### Recommended Tools
- **Browser**: Chrome or Firefox with developer tools
- **Editor**: VS Code with extensions:
  - HTML CSS Support
  - JavaScript (ES6) snippets
  - Prettier for formatting
  - Live Server for auto-refresh

## Running Tests

This project uses Jest with JSDOM:

```bash
npm --prefix app/js test
```

Or:

```bash
cd app/js
npm test
```

## Code Structure and Organization

```
personal-finance-dashboard/
├── app/
│   ├── index.html            # Application shell
│   ├── css/style.css         # Styles
│   └── js/                   # Modular JavaScript files
│       ├── core/             # App bootstrap + shared utilities
│       ├── data/             # Data persistence helpers
│       ├── features/         # Feature-specific modules
│       └── services/         # External API integrations
├── __tests__/                # Jest tests
└── *.md                      # Documentation
```

### Core Entry Points
- `app/index.html`: HTML structure and modal templates.
- `app/js/core/main.js`: Bootstraps theme, i18n, and feature modules.
- `app/js/features/financialDashboard.js`: Initializes major modules.

### Module Pattern
Modules use the IIFE pattern to keep public APIs explicit and scoped:

```javascript
const ModuleName = (function() {
    'use strict';

    function init() {
        // setup
    }

    return { init };
})();
```

## Key Modules

- **TabManager**: Handles tab navigation.
- **PortfolioManager**: Portfolio CRUD, charts, and summary metrics.
- **WatchlistManager**: Watchlist CRUD with optional real-time quotes.
- **PensionManager**: Pension tracking, charts, and summaries.
- **Calculator**: Loan, investment, CAGR, mortgage, salary, and Dividend & CGT calculators.
- **StockTracker**: Historical price tracking and growth calculations.
- **Settings**: Base currency, theme, language, API key, and data import/export.
- **I18n**: Translation utilities and locale management.
- **ThemeManager**: Light/dark/system theme support.

## Data and Storage

- Local data is stored in `localStorage` with graceful fallback to memory storage (`StorageUtils`).
- Portfolio, watchlist, pension, salary, dividend/CGT, and stock tracker data have dedicated storage keys.
- Data export/import flows are handled in the Settings module.

## External Services

Some features require network access:
- **Finnhub**: Quotes and symbol search.
- **Polygon.io**: Market status indicator.
- **ExchangeRate-API**: Base currency conversion rates.

When no network is available, the dashboard still functions for manual data entry.

## UI & Accessibility Notes

- Use `data-i18n` attributes for translatable text.
- Prefer `I18n.t()` for runtime strings and `DialogManager` for prompts.
- Use semantic HTML and consistent class naming.
- Keep layout responsive and test on mobile widths.

## Adding Features

1. Create or update a module under `app/js/features` (or `app/js/core` for shared utilities).
2. Wire new UI elements in `app/index.html`.
3. Add styles in `app/css/style.css`.
4. Register the module in `features/financialDashboard.js` and `core/main.js` if needed.
5. Add tests in `__tests__/`.
6. Update documentation and translations.

## Manual Testing Checklist

- Verify all tabs render correctly.
- Validate dialogs and forms.
- Test base currency conversion and FX refresh.
- Confirm export/import flows for each data type.
- Check theme, font scale, and language changes.
- Confirm optional API key workflows for quotes and watchlist.
