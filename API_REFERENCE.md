

# API Reference

## Core Modules API

### TabManager

The TabManager handles navigation between different sections of the application.

#### Methods

##### `switchTab(tabName)`
Switches to the specified tab and updates the UI accordingly.

**Parameters:**
- `tabName` (string): The name of the tab to switch to ('portfolio', 'calculators', 'tracker', 'reports', 'settings')

**Returns:** `void`

**Example:**
```javascript
TabManager.switchTab('portfolio');
```

##### `getCurrentTab()`
Returns the currently active tab name.

**Returns:** `string` - The name of the current tab

**Example:**
```javascript
const currentTab = TabManager.getCurrentTab();
console.log(currentTab); // 'portfolio'
```

##### `initializeTabs()`
Sets up event listeners for tab navigation. Called automatically on page load.

**Returns:** `void`

---

### PortfolioManager

Manages investment portfolio operations including CRUD operations and calculations.

#### Methods

##### `addInvestment(investment)`
Adds a new investment to the portfolio.

**Parameters:**
- `investment` (object): Investment data object

```javascript
{
    symbol: string,      // Stock symbol (e.g., 'AAPL')
    quantity: number,    // Number of shares
    purchasePrice: number, // Price per share at purchase
    currentPrice: number,  // Current price per share (optional)
    purchaseDate: string   // Purchase date in YYYY-MM-DD format
}
```

**Returns:** `string` - Unique investment ID

**Example:**
```javascript
const investmentId = PortfolioManager.addInvestment({
    symbol: 'AAPL',
    quantity: 100,
    purchasePrice: 150.00,
    currentPrice: 175.00,
    purchaseDate: '2024-01-15'
});
```

##### `updateInvestment(id, data)`
Updates an existing investment.

**Parameters:**
- `id` (string): Investment ID
- `data` (object): Updated investment data

**Returns:** `boolean` - Success status

**Example:**
```javascript
const success = PortfolioManager.updateInvestment('inv-123', {
    currentPrice: 180.00,
    quantity: 150
});
```

##### `deleteInvestment(id)`
Removes an investment from the portfolio.

**Parameters:**
- `id` (string): Investment ID

**Returns:** `boolean` - Success status

**Example:**
```javascript
const deleted = PortfolioManager.deleteInvestment('inv-123');
```

##### `getInvestment(id)`
Retrieves a specific investment by ID.

**Parameters:**
- `id` (string): Investment ID

**Returns:** `object|null` - Investment data or null if not found

##### `getAllInvestments()`
Returns all investments in the portfolio.

**Returns:** `array` - Array of investment objects

##### `calculateTotalValue()`
Calculates the total current value of the portfolio.

**Returns:** `number` - Total portfolio value

##### `calculateTotalGainLoss()`
Calculates total profit/loss for the portfolio.

**Returns:** `object` - Gain/loss data

```javascript
{
    totalGain: number,     // Total gain/loss amount
    totalGainPercent: number, // Total gain/loss percentage
    gainers: array,        // Investments with gains
    losers: array          // Investments with losses
}
```

##### `generateChart()`
Creates a Chart.js chart for portfolio visualization.

**Returns:** `Chart` - Chart.js instance

##### `fetchLastPrices()`
Fetches the latest price for each unique ticker in the portfolio.

**Returns:** `Promise<void>`


---

### Calculator

Provides various financial calculation tools.

#### Methods

##### `calculateLoan(principal, rate, term)`
Calculates loan payment information.

**Parameters:**
- `principal` (number): Loan amount
- `rate` (number): Annual interest rate (as percentage)
- `term` (number): Loan term in years

**Returns:** `object` - Loan calculation results

```javascript
{
    monthlyPayment: number,
    totalPayment: number,
    totalInterest: number,
    amortizationSchedule: array
}
```

**Example:**
```javascript
const loanInfo = Calculator.calculateLoan(250000, 4.5, 30);
console.log(loanInfo.monthlyPayment); // 1266.71
```

##### `calculateInvestment(principal, rate, time, compound)`
Calculates investment growth with compound interest.

**Parameters:**
- `principal` (number): Initial investment amount
- `rate` (number): Annual interest rate (as percentage)
- `time` (number): Investment period in years
- `compound` (number): Compounding frequency per year

**Returns:** `object` - Investment calculation results

```javascript
{
    futureValue: number,
    totalInterest: number,
    yearlyBreakdown: array
}
```

##### `calculateCAGR(beginValue, endValue, years)`
Calculates Compound Annual Growth Rate.

**Parameters:**
- `beginValue` (number): Starting value
- `endValue` (number): Ending value
- `years` (number): Number of years

**Returns:** `number` - CAGR as percentage

**Example:**
```javascript
const cagr = Calculator.calculateCAGR(10000, 15000, 3);
console.log(cagr); // 14.47
```

##### `calculateFairValue(eps, peRatio, growthRate)`
Calculates fair value of a stock.

**Parameters:**
- `eps` (number): Earnings per share
- `peRatio` (number): Price-to-earnings ratio
- `growthRate` (number): Expected growth rate (as percentage)

**Returns:** `object` - Fair value calculation

```javascript
{
    currentFairValue: number,
    futureValue: number,
    recommendation: string // 'BUY', 'HOLD', 'SELL'
}
```

---

### StockTracker

Tracks stock performance over time with historical data analysis.

#### Methods

##### `addStock(symbol, data)`
Adds a stock to the tracking list.

**Parameters:**
- `symbol` (string): Stock symbol
- `data` (array): Historical price data

```javascript
[
    {
        date: string,    // YYYY-MM-DD format
        price: number,   // Stock price
        volume: number   // Trading volume (optional)
    }
]
```

**Returns:** `boolean` - Success status

##### `updateStockPrice(symbol, date, price)`
Updates or adds a price point for a stock.

**Parameters:**
- `symbol` (string): Stock symbol
- `date` (string): Date in YYYY-MM-DD format
- `price` (number): Stock price

**Returns:** `boolean` - Success status

##### `getStockData(symbol)`
Retrieves historical data for a stock.

**Parameters:**
- `symbol` (string): Stock symbol

**Returns:** `array` - Historical price data

##### `calculateGrowth(symbol, startDate, endDate)`
Calculates growth percentage for a stock over a period.

**Parameters:**
- `symbol` (string): Stock symbol
- `startDate` (string): Start date (YYYY-MM-DD)
- `endDate` (string): End date (YYYY-MM-DD)

**Returns:** `object` - Growth calculation

```javascript
{
    startPrice: number,
    endPrice: number,
    growthAmount: number,
    growthPercent: number,
    annualizedReturn: number
}
```

##### `generatePerformanceChart(symbols, period)`
Creates a performance comparison chart.

**Parameters:**
- `symbols` (array): Array of stock symbols
- `period` (string): Time period ('1Y', '3Y', '5Y', 'ALL')

**Returns:** `Chart` - Chart.js instance

---


## Utility Functions

### Data Validation

##### `validateInvestmentData(data)`
Validates investment data before processing.

**Parameters:**
- `data` (object): Investment data to validate

**Returns:** `array` - Array of error messages (empty if valid)

##### `validateNumericInput(value, min, max)`
Validates numeric input within specified range.

**Parameters:**
- `value` (any): Value to validate
- `min` (number): Minimum allowed value
- `max` (number): Maximum allowed value

**Returns:** `boolean` - Validation result

### Data Formatting

##### `formatCurrency(amount, currency)`
Formats a number as currency.

**Parameters:**
- `amount` (number): Amount to format
- `currency` (string): Currency code (default: 'USD')

**Returns:** `string` - Formatted currency string

**Example:**
```javascript
const formatted = formatCurrency(1234.56);
console.log(formatted); // "$1,234.56"
```

##### `formatPercentage(value, decimals)`
Formats a number as percentage.

**Parameters:**
- `value` (number): Value to format (as decimal)
- `decimals` (number): Number of decimal places

**Returns:** `string` - Formatted percentage string

##### `formatDate(date, format)`
Formats a date string.

**Parameters:**
- `date` (string|Date): Date to format
- `format` (string): Format pattern

**Returns:** `string` - Formatted date string

### Storage Operations

##### `saveToStorage(key, data)`
Saves data to localStorage.

**Parameters:**
- `key` (string): Storage key
- `data` (any): Data to save

**Returns:** `boolean` - Success status

##### `loadFromStorage(key, defaultValue)`
Loads data from localStorage.

**Parameters:**
- `key` (string): Storage key
- `defaultValue` (any): Default value if key doesn't exist

**Returns:** `any` - Stored data or default value

##### `clearStorage(key)`
Removes data from localStorage.

**Parameters:**
- `key` (string): Storage key to remove

**Returns:** `boolean` - Success status

---

## Event System

### Custom Events

The application uses a custom event system for module communication.

##### `EventBus.emit(eventName, data)`
Emits a custom event.

**Parameters:**
- `eventName` (string): Name of the event
- `data` (any): Event data

##### `EventBus.on(eventName, callback)`
Listens for a custom event.

**Parameters:**
- `eventName` (string): Name of the event
- `callback` (function): Event handler function

##### `EventBus.off(eventName, callback)`
Removes an event listener.

**Parameters:**
- `eventName` (string): Name of the event
- `callback` (function): Event handler to remove

### Available Events

- `portfolio:updated` - Fired when portfolio data changes
- `investment:added` - Fired when a new investment is added
- `investment:updated` - Fired when an investment is modified
- `investment:deleted` - Fired when an investment is removed
- `calculation:completed` - Fired when a calculation is finished
- `chart:rendered` - Fired when a chart is created or updated
- `data:saved` - Fired when data is saved to storage
- `error:occurred` - Fired when an error occurs

---

## Error Handling

### Error Types

The application defines custom error types for better error handling:

```javascript
class ValidationError extends Error {
    constructor(message, field) {
        super(message);
        this.name = 'ValidationError';
        this.field = field;
    }
}

class StorageError extends Error {
    constructor(message) {
        super(message);
        this.name = 'StorageError';
    }
}

class CalculationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'CalculationError';
    }
}
```

### Error Handling Functions

##### `handleError(error, context)`
Global error handler.

**Parameters:**
- `error` (Error): Error object
- `context` (string): Context where error occurred

##### `showNotification(message, type, duration)`
Displays user notifications.

**Parameters:**
- `message` (string): Notification message
- `type` (string): Notification type ('success', 'error', 'warning', 'info')
- `duration` (number): Display duration in milliseconds

---

## Configuration

### Application Settings

The application supports various configuration options:

```javascript
const CONFIG = {
    currency: 'USD',
    dateFormat: 'MM/DD/YYYY',
    chartColors: ['#3498db', '#e74c3c', '#2ecc71', '#f39c12'],
## Services

### QuotesService
- getApiKey(): string
- setApiKey(key: string): void
- fetchQuote(ticker: string): Promise<{ price: number|null, raw: any }>
- searchSymbol(query: string): Promise<any>

Notes:
- API key is read from localStorage under key "pf_api_key_finnhub"
- When missing, requests are still attempted; Finnhub may reject unauthenticated or rate-limited calls

### ColorService
- getColorForKey(key: string): string
- reset(): void

Notes:
- Deterministic color assignment with palette and HSL fallback
- Persists map in localStorage under key "pf_color_map_v1"

    autoSave: true,
    autoSaveInterval: 30000, // 30 seconds
    maxInvestments: 100,
    maxHistoryEntries: 1000
};
```

### Customization Options

Users can customize various aspects of the application through the settings interface or by modifying the configuration object.

## Latest Changes
- Pension tracking with charts and summary view.
- Portfolio export/import and deletion options.
- Portfolio and stock tracker price refresh during pre-, regular, and after-market sessions.
- Base-currency calculations and sticky table improvements.
- Automatic input focus in dialog and edit modals.
- Expanded to cover newly modularized functions.
- Updated `.gitignore` prevents test artifacts from being committed.
## Addendum: Planned Service Layer (Upcoming)

These services are planned to reduce duplication and improve testability. They will be introduced incrementally and documented here for early reference.

### QuotesService (planned)
Centralizes Finnhub quote/search calls and API key handling from Settings (stored locally).

- getApiKey(): string
- setApiKey(key: string): void
- fetchQuote(ticker: string): Promise<{ price: number|null, raw: any }>
- searchSymbol(query: string): Promise<any>

Notes:
- Reads API key from localStorage (e.g., `pf_api_key_finnhub`).
- Handles HTTP errors and rate limits consistently.
- No API keys are committed to the repository.

### ColorService (planned)
Provides consistent, persistent color assignment for chart series across modules.

- getColorForKey(key: string): string
- reset(): void

Notes:
- Persists an internal map in localStorage so the same ticker/entity keeps the same color across sessions.
- Uses a shared palette with deterministic HSL fallback.
- For more details, see [RULES.md](RULES.md).
