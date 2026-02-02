# Technical Documentation

## Architecture Overview

The Personal Finance Dashboard is a client-side single-page application (SPA) built with vanilla JavaScript. It uses modular IIFE patterns for clear separation of concerns and loads static assets from the `app/` directory. All state is stored locally unless the user opts into live market data via external APIs.

## Module Map

### Application Bootstrap
- **`core/main.js`**: Initializes theme, i18n, core modules, market status, quote refresh, and FX data.
- **`features/financialDashboard.js`**: Orchestrates major feature modules (Portfolio, Watchlist, Pension, Calculators, Stock Tracker, Settings).

### Navigation
- **`core/tabManager.js`**: Tab switching logic for main sections.

### Portfolio
- **`features/portfolioManager.js`**: Portfolio CRUD, totals, charts, drag-and-drop ordering, CSV/JSON import/export, and transaction history.
- **`data/portfolioStorage.js`**: Portfolio-specific local storage utilities.
- **`services/colorService.js`**: Persistent color assignments for tickers.

### Watchlist
- **`features/watchlistManager.js`**: Watchlist CRUD, manual refresh, optional Finnhub WebSocket stream, CSV/JSON import/export.
- **`data/priceStorage.js`**: Caches latest quote data across modules.

### Pension
- **`features/pensionManager.js`**: Pension entries, summaries, chart rendering, and CSV/JSON import/export.

### Calculators
- **`features/calculator.js`**: Loan, investment, CAGR, mortgage, salary, and Dividend & CGT calculators. Salary and dividend/CGT entries persist locally.

### Stock Tracking
- **`features/stockTracker.js`**: Manual and live price tracking across years, growth calculations, and CSV/JSON import/export.

### Settings & UX
- **`core/settings.js`**: Base currency, theme, font scale, language/RTL, Finnhub API key storage, export/import tools, and app version display.
- **`core/themeManager.js`**: Light/dark/system theme preference.
- **`core/i18n.js`**: Translation engine, formatting helpers, and locale import/export.
- **`core/dialogManager.js`**: Centralized modal alerts/confirmations/prompts.
- **`core/appVersion.js`**: Displays the current version string.

### Utilities & Services
- **`services/quotesService.js`**: Finnhub quote/search wrapper with caching and exception handling.
- **`services/priceUpdater.js`**: Scheduled refresh for portfolio, watchlist, and stock tracker quotes.
- **`services/forexData.js`**: Daily FX rate fetch with caching.
- **`services/marketStatus.js`**: Market session indicator updates.
- **`core/storageUtils.js`**: Local storage availability checks and memory fallback.
- **`core/storageManager.js`**: Legacy storage helper used in tests.
- **`core/dateUtils.js`**: Shared date utilities.

## Data Storage

### Storage Approach
- Local data is stored in `localStorage`, with a memory fallback via `StorageUtils`.
- Feature modules keep their own storage keys to avoid collisions.
- Export/import flows in Settings handle CSV or JSON depending on the module.

### Common Data Types
- **Portfolio**: Multiple portfolios, each with positions and transaction history.
- **Watchlist**: Ticker list with last known prices.
- **Pensions**: Pension entries and metadata.
- **Salary**: Salary calculator entries.
- **Dividend & CGT**: Dividend and capital gains calculator inputs.
- **Stock Tracker**: Multi-year price history per ticker.

## External Integrations

The dashboard can run entirely offline for manual data entry, but several features use external services:

- **Finnhub**: Quotes and symbol search.
- **Polygon.io**: Market status (pre-market, open, after-hours).
- **ExchangeRate-API**: Base currency conversion rates.

API keys are either embedded for public endpoints or provided by the user in Settings. Optional keys are stored locally in the browser.

## UI Architecture

- **HTML**: `app/index.html` defines tabs, tables, modals, and templates.
- **CSS**: `app/css/style.css` provides layout, responsive behavior, and theme support.
- **Icons**: Ionicons are loaded via CDN.
- **Charts**: Chart.js is bundled in `app/js/chart.umd.js`.

## Internationalization

- All translatable strings are defined in `app/js/core/i18n.js`.
- UI elements use `data-i18n` attributes for translation mapping.
- Locale selection and RTL toggles live in Settings.

## Performance Considerations

- Quote updates are batched on a one-minute interval while markets are open.
- Chart rendering is deferred until data is ready.
- Cached data (quotes, FX rates) reduces redundant network requests.

## Security & Privacy

- All user data is stored locally in the browser.
- API keys are stored locally and never transmitted to a server beyond direct API calls.
- No analytics or tracking scripts are included.
