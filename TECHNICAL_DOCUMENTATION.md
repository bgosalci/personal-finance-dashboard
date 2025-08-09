# Technical Documentation

## Architecture Overview

The Personal Finance Dashboard is built as a single-page application (SPA) using vanilla JavaScript with a modular architecture pattern. The application follows the IIFE (Immediately Invoked Function Expression) pattern to create isolated modules and prevent global namespace pollution.

## Core Modules

### 1. TabManager
**Location**: Lines 1279-1315
**Purpose**: Manages navigation between different sections of the application

```javascript
const TabManager = (function() {
    // Private variables and methods
    let currentTab = 'portfolio';
    
    // Public API
    return {
        switchTab: function(tabName) { /* ... */ },
        getCurrentTab: function() { /* ... */ }
    };
})();
```

**Key Methods**:
- `switchTab(tabName)`: Switches to the specified tab and updates UI
- `getCurrentTab()`: Returns the currently active tab
- `initializeTabs()`: Sets up event listeners for tab navigation

### 2. PortfolioManager
**Location**: Lines 1318-1606
**Purpose**: Handles all portfolio-related operations including CRUD operations and calculations

```javascript
const PortfolioManager = (function() {
    let investments = [];
    
    return {
        addInvestment: function(investment) { /* ... */ },
        updateInvestment: function(id, data) { /* ... */ },
        deleteInvestment: function(id) { /* ... */ },
        calculateTotalValue: function() { /* ... */ },
        generateChart: function() { /* ... */ }
    };
})();
```

**Key Features**:
- Investment CRUD operations
- Real-time P&L calculations
- Portfolio value aggregation
- Chart generation using Chart.js
- Data persistence to localStorage

**Data Structure**:
```javascript
const investment = {
    id: 'unique-id',
    symbol: 'AAPL',
    quantity: 100,
    purchasePrice: 150.00,
    currentPrice: 175.00,
    purchaseDate: '2024-01-15'
};
```

### PortfolioColumns
**Purpose**: Manages customizable labels for portfolio table columns.

**Key Methods**:
- `init()`: Applies saved column labels on load.
- `getLabels()`: Retrieves current label mapping.
- `setLabels(obj)`: Persists new labels and updates the table header.

### 3. Calculator
**Location**: Lines 1609-1977
**Purpose**: Provides various financial calculation tools

**Available Calculators**:

#### Loan Calculator
- Monthly payment calculation
- Total interest computation
- Amortization schedule generation

#### Investment Calculator
- Future value projections
- Compound interest calculations
- Time-based growth analysis

#### CAGR Calculator
- Compound Annual Growth Rate
- Performance comparison tools

#### Fair Value Calculator
- Stock valuation using P/E ratios
- Market comparison analysis

### 4. StockTracker
**Location**: Lines 1980-2429
**Purpose**: Tracks stock performance over time with historical data analysis

**Key Features**:
- Multi-year price tracking
- Growth percentage calculations
- Historical performance charts
- Comparative analysis tools

## Data Management

### LocalStorage Schema
The application uses browser localStorage for data persistence with the following keys:

```javascript
// Portfolio positions
localStorage.setItem('portfolio_positions', JSON.stringify(portfolioPositions));

// Portfolio value snapshots
localStorage.setItem('portfolio_snapshots', JSON.stringify(portfolioSnapshots));
```

Legacy portfolio data stored under `portfolioData` is migrated automatically. Additional keys remain:

```javascript
localStorage.setItem('calculator_history', JSON.stringify(calculations));
localStorage.setItem('stock_tracker_data', JSON.stringify(stockData));
localStorage.setItem('user_preferences', JSON.stringify(preferences));
```

### Backup and Export
Use `PortfolioStorage.exportData()` to generate a JSON backup of all portfolio
positions and snapshots. Save this string to a file periodically to avoid data
loss.

### Quota Management
`PortfolioStorage` monitors total localStorage usage. If stored data exceeds
90% of the browser's ~5MB limit the module automatically removes the oldest
snapshots before saving new ones.

### Data Validation
All user inputs are validated using custom validation functions:

```javascript
function validateInvestmentData(data) {
    const errors = [];
    
    if (!data.symbol || data.symbol.length < 1) {
        errors.push('Stock symbol is required');
    }
    
    if (!data.quantity || data.quantity <= 0) {
        errors.push('Quantity must be greater than 0');
    }
    
    if (!data.purchasePrice || data.purchasePrice <= 0) {
        errors.push('Purchase price must be greater than 0');
    }
    
    return errors;
}
```

## UI Components

### Chart Integration
The application uses Chart.js for data visualization:

```javascript
function createPortfolioChart(data) {
    const ctx = document.getElementById('portfolioChart').getContext('2d');
    
    return new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: data.labels,
            datasets: [{
                data: data.values,
                backgroundColor: data.colors
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}
```

### Form Handling
Dynamic form generation and validation:

```javascript
function createInvestmentForm() {
    const form = document.createElement('form');
    form.innerHTML = `
        <div class="form-group">
            <label for="symbol">Stock Symbol</label>
            <input type="text" id="symbol" required>
        </div>
        <div class="form-group">
            <label for="quantity">Quantity</label>
            <input type="number" id="quantity" min="1" required>
        </div>
        <div class="form-group">
            <label for="price">Purchase Price</label>
            <input type="number" id="price" min="0.01" step="0.01" required>
        </div>
    `;
    
    return form;
}
```

## CSS Architecture

### Custom Properties
The application uses CSS custom properties for theming:

```css
:root {
    --primary-color: #2c3e50;
    --secondary-color: #3498db;
    --success-color: #27ae60;
    --danger-color: #e74c3c;
    --warning-color: #f39c12;
    --background-color: #ecf0f1;
    --text-color: #2c3e50;
    --border-color: #bdc3c7;
}
```

### Responsive Design
Mobile-first approach with breakpoints:

```css
/* Mobile styles (default) */
.container {
    padding: 1rem;
}

/* Tablet styles */
@media (min-width: 768px) {
    .container {
        padding: 2rem;
    }
}

/* Desktop styles */
@media (min-width: 1024px) {
    .container {
        max-width: 1200px;
        margin: 0 auto;
    }
}
```

## Performance Considerations

### Lazy Loading
Charts and heavy calculations are loaded on-demand:

```javascript
function loadChart(tabName) {
    if (!chartInstances[tabName]) {
        chartInstances[tabName] = createChart(tabName);
    }
    return chartInstances[tabName];
}
```

### Debounced Input Handling
User input is debounced to prevent excessive calculations:

```javascript
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

const debouncedCalculate = debounce(calculateResults, 300);
```

## Error Handling

### Global Error Handler
```javascript
window.addEventListener('error', function(event) {
    console.error('Global error:', event.error);
    showNotification('An unexpected error occurred', 'error');
});
```

### Validation Errors
```javascript
function handleValidationErrors(errors) {
    errors.forEach(error => {
        showFieldError(error.field, error.message);
    });
}
```

## Testing Considerations

### Manual Testing Checklist
1. Portfolio operations (add, edit, delete investments)
2. Calculator accuracy across all tools
3. Data persistence across browser sessions
4. Responsive design on different screen sizes
5. Chart rendering and interactions
6. Form validation and error handling

### Browser Testing
- Test in Chrome, Firefox, Safari, and Edge
- Verify localStorage functionality
- Check Chart.js compatibility
- Validate responsive design

## Security Considerations

### Input Sanitization
All user inputs are sanitized before processing:

```javascript
function sanitizeInput(input) {
    return input.toString()
        .replace(/[<>]/g, '')
        .trim();
}
```

### Data Validation
Server-side style validation on client-side:

```javascript
function validateNumericInput(value, min = 0, max = Infinity) {
    const num = parseFloat(value);
    return !isNaN(num) && num >= min && num <= max;
}
```

## Deployment

### Static Hosting
The application can be deployed to any static hosting service:
- GitHub Pages
- Netlify
- Vercel
- AWS S3 + CloudFront

### Build Process
No build process required - the application runs directly in the browser.

## Future Enhancements

### Potential Improvements
1. Real-time stock price API integration
2. Export to CSV/PDF functionality
3. Advanced charting options
4. Multi-currency support
5. Backup/sync to cloud storage
6. Mobile app version
7. Advanced portfolio analytics
8. Tax calculation tools

### Technical Debt
1. Consider migrating to a modern framework (React/Vue)
2. Implement proper testing framework
3. Add TypeScript for better type safety
4. Optimize bundle size and loading performance
5. Implement proper state management

## Latest Changes
- Portfolio column labels are customizable with new PortfolioColumns module.
- Pension tracking with charts and summary view.
- Portfolio export/import and deletion options.
- Portfolio-wide price refresh capability.
- Base-currency calculations and sticky table improvements.
- Automatic input focus in dialog and edit modals.
- Module structure clarified with separate files.
- `.gitignore` updated for cleaner repos.
- Refer to [RULES.md](RULES.md) for coding standards.
