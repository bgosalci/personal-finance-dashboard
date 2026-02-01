# API Reference

This reference covers the public APIs exposed by the JavaScript modules in `app/js/`.

## Application Core

### FinancialDashboard
**Location**: `app/js/features/financialDashboard.js`

- `init()` → Initializes all feature modules.
- `removeTicker(ticker)` → Delegates ticker removal to the stock tracker.

### TabManager
**Location**: `app/js/core/tabManager.js`

- `init()` → Attaches tab click handlers.
- `switchTab(tabName)` → Activates the requested tab.

## Feature Modules

### PortfolioManager
**Location**: `app/js/features/portfolioManager.js`

- `init()` → Loads portfolio data, renders UI, and binds events.
- `fetchQuote(ticker, currency)` → Fetches a single quote via `QuotesService`.
- `fetchLastPrices()` → Refreshes quotes for all portfolio items.
- `updatePortfolioPrices(portfolioId)` → Updates prices for a single portfolio.
- `exportData(format = 'json')` → Returns CSV/JSON text for portfolio data.
- `importData(text, format = 'json')` → Imports portfolio data from CSV/JSON text.
- `deleteAllData()` → Clears all stored portfolio data.

### WatchlistManager
**Location**: `app/js/features/watchlistManager.js`

- `init()` → Loads watchlist, renders UI, and connects WebSocket (if enabled).
- `fetchLastPrices()` → Refreshes prices for watchlist tickers.
- `exportData(format = 'json')` → Returns CSV/JSON text for watchlist data.
- `importData(text, format = 'json')` → Imports watchlist data.
- `deleteAllData()` → Clears stored watchlist data.

### PensionManager
**Location**: `app/js/features/pensionManager.js`

- `init()` → Loads pension data, renders UI, and binds events.
- `exportData(format = 'json')` → Returns CSV/JSON text for pension data.
- `importData(text, format = 'json')` → Imports pension data.
- `deleteAllData()` → Clears stored pension data.

### Calculator
**Location**: `app/js/features/calculator.js`

- `init()` → Initializes calculator sub-tabs and input handling.
- `formatCurrency(amount)` → Formats a currency value using the base currency.
- `formatPercentage(rate)` → Formats a percentage value with two decimals.

### StockTracker
**Location**: `app/js/features/stockTracker.js`

- `init()` → Loads tracker data and sets up UI.
- `removeTicker(ticker)` → Removes a tracked ticker.
- `fetchLatestPrices()` → Fetches latest prices for tracked tickers.
- `exportData(format = 'json')` → Returns CSV/JSON text for tracker data.
- `importData(text, format = 'json')` → Imports tracker data.
- `deleteAllData()` → Clears tracker data.

## Settings & UX

### Settings
**Location**: `app/js/core/settings.js`

- `init()` → Wires settings UI, export/import flows, and preference listeners.
- `getBaseCurrency()` → Returns the current base currency.
- `setBaseCurrency(value)` → Updates the base currency.

### ThemeManager
**Location**: `app/js/core/themeManager.js`

- `init()` → Applies saved theme preference and watches system changes.
- `setPreference(pref)` → Sets `system`, `light`, or `dark`.
- `getPreference()` → Returns saved preference.

### I18n
**Location**: `app/js/core/i18n.js`

- `init()` → Loads translations and applies defaults.
- `setLocale(locale)` → Switches the active locale.
- `t(key)` → Returns a translated string.
- `apply()` → Refreshes translated DOM content.
- `formatNumber(value, options)` → Number formatting helper.
- `formatCurrency(value, currency)` → Currency formatting helper.
- `formatDate(date, options)` → Date formatting helper.
- `toggleDir(isRtl)` / `initDir()` → RTL toggle support.
- `availableLocales` → Array of known locales.
- `exportLocale()` / `importLocale(data)` → Locale import/export.
- `getLocale()` / `getCurrentLocale()` → Returns locale info.

### DialogManager
**Location**: `app/js/core/dialogManager.js`

- `alert(message)` → Alert modal.
- `confirm(message, action)` → Confirmation modal with optional action label.
- `prompt(message, defaultValue, action)` → Prompt modal.

### AppVersion
**Location**: `app/js/core/appVersion.js`

- `get()` → Returns version string.
- `display()` → Updates the Settings UI with the version.

## Services & Utilities

### QuotesService
**Location**: `app/js/services/quotesService.js`

- `getApiKey()` / `setApiKey(key)` → Finnhub API key handling.
- `fetchQuote(ticker)` → Fetches a quote from Finnhub.
- `searchSymbol(query)` → Searches tickers via Finnhub.

### PriceUpdater
**Location**: `app/js/services/priceUpdater.js`

- `init()` → Starts scheduled quote refresh while markets are open.

### ForexData
**Location**: `app/js/services/forexData.js`

- `init()` → Loads cached FX data and schedules refresh.
- `getRates()` → Returns latest FX rates (fetching if needed).

### MarketStatus
**Location**: `app/js/services/marketStatus.js`

- `init()` → Starts polling for market status updates.
- `isMarketOpen()` → Returns the latest open/closed state.

### PriceStorage
**Location**: `app/js/data/priceStorage.js`

- `save(ticker, price)` → Stores latest price.
- `get(ticker)` / `getAll()` → Retrieves cached prices.
- `onChange(fn)` / `offChange(fn)` → Subscribe/unsubscribe to price updates.

### PortfolioStorage
**Location**: `app/js/data/portfolioStorage.js`

- `init()` → Loads portfolio positions and snapshots.
- `addPosition(position)` → Adds a validated position and persists it.
- `createSnapshot(dateStr)` → Saves a portfolio snapshot for a date.
- `exportData()` → Returns JSON text for positions and snapshots.
- `save()` → Persists the current portfolio data.

### StorageUtils
**Location**: `app/js/core/storageUtils.js`

- `isLocalStorageAvailable()` → Checks storage availability.
- `getStorage()` → Returns localStorage or memory fallback.

### ColorService
**Location**: `app/js/services/colorService.js`

- `getColorForKey(key)` → Returns a persistent color for a key.
- `reset()` → Clears the color map.

### DateUtils
**Location**: `app/js/core/dateUtils.js`

- Date formatting helpers for shared UI formatting.

### StorageManager (Legacy/Test)
**Location**: `app/js/core/storageManager.js`

- Helpers for positions/snapshots used in tests.
