# Development Guide

## Development Environment Setup

### Prerequisites
- Modern web browser with developer tools
- Text editor or IDE (VS Code, Sublime Text, etc.)
- Basic knowledge of HTML, CSS, and JavaScript
- Understanding of financial concepts (helpful but not required)

### Local Development
1. Clone the repository
2. Open `app/index.html` in your preferred editor
3. Open the file in a web browser for testing
4. Use browser developer tools for debugging

### Recommended Tools
- **Browser**: Chrome or Firefox with developer tools
- **Editor**: VS Code with extensions:
  - HTML CSS Support
  - JavaScript (ES6) code snippets
  - Prettier for code formatting
  - Live Server for auto-refresh during development

## Code Structure and Organization

### File Organization
```
personal-finance-dashboard/
├── app/
│   └── index.html                  # Main application file
├── README.md                  # Project overview
├── TECHNICAL_DOCUMENTATION.md # Technical details
├── API_REFERENCE.md          # API documentation
├── USER_GUIDE.md             # User instructions
└── DEVELOPMENT_GUIDE.md      # This file
```

### Code Sections in index.html
1. **HTML Structure** (lines 1-773)
   - Document head with meta tags and title
   - Main application layout
   - Tab navigation structure
   - Form templates and modals

2. **CSS Styles** (lines 8-773)
   - CSS custom properties (variables)
   - Responsive design rules
   - Component-specific styles
   - Animation and transition effects

3. **JavaScript Modules** (lines 774-2429)
   - External library imports (Chart.js, Ionicons)
   - Core application modules
   - Utility functions
   - Event handlers and initialization

## Architecture Patterns

### Module Pattern (IIFE)
The application uses the Immediately Invoked Function Expression (IIFE) pattern to create isolated modules:

```javascript
const ModuleName = (function() {
    // Private variables and functions
    let privateVariable = 'value';
    
    function privateFunction() {
        // Private implementation
    }
    
    // Public API
    return {
        publicMethod: function() {
            // Public implementation
        },
        
        publicProperty: 'value'
    };
})();
```

### Benefits of This Pattern
- **Encapsulation**: Private variables and functions are not accessible from outside
- **Namespace Management**: Prevents global namespace pollution
- **Dependency Management**: Clear module dependencies and interfaces
- **Maintainability**: Easier to understand and modify individual modules

### Event-Driven Architecture
Modules communicate through a custom event system:

```javascript
// Emit an event
EventBus.emit('portfolio:updated', portfolioData);

// Listen for events
EventBus.on('portfolio:updated', function(data) {
    // Handle the event
});
```

## Core Modules Deep Dive

### TabManager Module
**Purpose**: Handles navigation between application sections

**Key Responsibilities**:
- Tab switching logic
- URL hash management (if implemented)
- Active tab state management
- Tab-specific initialization

**Development Notes**:
- Keep tab switching logic simple and fast
- Ensure proper cleanup when switching tabs
- Consider lazy loading for heavy tabs

### PortfolioManager Module
**Purpose**: Manages investment portfolio operations

**Key Responsibilities**:
- CRUD operations for investments
- Portfolio calculations (totals, gains/losses)
- Data validation and sanitization
- Chart generation and updates
- Data persistence to localStorage

**Development Notes**:
- Always validate input data before processing
- Use consistent data structures for investments
- Implement proper error handling for calculations
- Consider performance for large portfolios

**Data Structure**:
```javascript
const investment = {
    id: generateUniqueId(),
    symbol: 'AAPL',
    quantity: 100,
    purchasePrice: 150.00,
    currentPrice: 175.00,
    purchaseDate: '2024-01-15',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
};
```

### Calculator Module
**Purpose**: Provides financial calculation tools

**Key Responsibilities**:
- Loan payment calculations
- Investment growth projections
- CAGR calculations
- Fair value estimations
- Input validation and error handling

**Development Notes**:
- Use precise decimal arithmetic for financial calculations
- Validate all numeric inputs thoroughly
- Provide clear error messages for invalid inputs
- Consider edge cases (zero values, negative numbers)

**Calculation Accuracy**:
```javascript
// Use parseFloat and toFixed for precision
function calculateMonthlyPayment(principal, rate, term) {
    const monthlyRate = rate / 100 / 12;
    const numPayments = term * 12;
    
    const payment = principal * 
        (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
        (Math.pow(1 + monthlyRate, numPayments) - 1);
    
    return parseFloat(payment.toFixed(2));
}
```

### StockTracker Module
**Purpose**: Tracks stock performance over time

**Key Responsibilities**:
- Historical data management
- Performance calculations
- Chart generation for trends
- Comparative analysis tools

**Development Notes**:
- Optimize for large datasets
- Implement efficient data structures for time series
- Consider data compression for storage
- Provide multiple visualization options

### PensionManager Module
**Purpose**: Oversees pension account tracking and analytics

**Key Responsibilities**:
- Manage contributions and balances for multiple pension plans
- Render pension growth charts and summary views
- Import, export, and delete pension data
- Integrate with `PortfolioManager` for total net worth calculations
- Persist data using `localStorage`

**Development Notes**:
- Optimize for long-term datasets
- Respect base-currency settings when aggregating values

## Development Best Practices

### Code Style Guidelines

#### JavaScript
- Use `const` for constants, `let` for variables
- Use descriptive variable and function names
- Keep functions small and focused
- Use consistent indentation (2 or 4 spaces)
- Add JSDoc comments for complex functions

```javascript
/**
 * Calculates the compound annual growth rate
 * @param {number} beginValue - Starting value
 * @param {number} endValue - Ending value
 * @param {number} years - Number of years
 * @returns {number} CAGR as percentage
 */
function calculateCAGR(beginValue, endValue, years) {
    if (beginValue <= 0 || endValue <= 0 || years <= 0) {
        throw new Error('All values must be positive');
    }
    
    return ((Math.pow(endValue / beginValue, 1 / years) - 1) * 100);
}
```

#### CSS
- Use CSS custom properties for theming
- Follow BEM methodology for class naming
- Group related styles together
- Use meaningful class names

```css
/* CSS Custom Properties */
:root {
    --primary-color: #2c3e50;
    --secondary-color: #3498db;
    --success-color: #27ae60;
}

/* BEM Methodology */
.portfolio-card {
    /* Block */
}

.portfolio-card__header {
    /* Element */
}

.portfolio-card--highlighted {
    /* Modifier */
}
```

#### HTML
- Use semantic HTML elements
- Include proper ARIA attributes for accessibility
- Validate HTML structure
- Keep markup clean and organized

### Error Handling

#### Input Validation
Always validate user inputs before processing:

```javascript
function validateInvestmentData(data) {
    const errors = [];
    
    if (!data.symbol || typeof data.symbol !== 'string') {
        errors.push('Stock symbol is required and must be a string');
    }
    
    if (!data.quantity || data.quantity <= 0) {
        errors.push('Quantity must be a positive number');
    }
    
    if (!data.purchasePrice || data.purchasePrice <= 0) {
        errors.push('Purchase price must be a positive number');
    }
    
    return errors;
}
```

#### Error Display
Provide clear, user-friendly error messages:

```javascript
function showError(message, field = null) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    if (field) {
        const fieldElement = document.getElementById(field);
        fieldElement.parentNode.appendChild(errorDiv);
        fieldElement.classList.add('error');
    }
}
```

### Performance Optimization

#### Lazy Loading
Load heavy components only when needed:

```javascript
let chartInstance = null;

function getChart() {
    if (!chartInstance) {
        chartInstance = new Chart(ctx, chartConfig);
    }
    return chartInstance;
}
```

#### Debouncing
Prevent excessive function calls during user input:

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

const debouncedSearch = debounce(performSearch, 300);
```

#### Memory Management
Clean up event listeners and references:

```javascript
function cleanup() {
    // Remove event listeners
    document.removeEventListener('click', handleClick);
    
    // Clear intervals/timeouts
    clearInterval(updateInterval);
    
    // Destroy chart instances
    if (chartInstance) {
        chartInstance.destroy();
        chartInstance = null;
    }
}
```

## Testing Strategy

### Manual Testing Checklist

#### Portfolio Management
- [ ] Add new investment with valid data
- [ ] Add investment with invalid data (should show errors)
- [ ] Edit existing investment
- [ ] Delete investment
- [ ] Calculate portfolio totals correctly
- [ ] Generate portfolio chart
- [ ] Data persists after page refresh

#### Calculators
- [ ] Loan calculator with various inputs
- [ ] Investment calculator with compound interest
- [ ] CAGR calculator with different time periods
- [ ] Fair value calculator with P/E ratios
- [ ] Error handling for invalid inputs
- [ ] Results display correctly formatted

#### Stock Tracker
- [ ] Add stock with historical data
- [ ] Update stock prices
- [ ] Generate performance charts
- [ ] Calculate growth percentages
- [ ] Compare multiple stocks

#### General Functionality
- [ ] Tab navigation works smoothly
- [ ] Data saves and loads correctly
- [ ] Responsive design on different screen sizes
- [ ] Error messages are clear and helpful
- [ ] Charts render correctly
- [ ] Performance is acceptable with large datasets

### Browser Testing
Test in multiple browsers:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

### Responsive Testing
Test on different screen sizes:
- Desktop (1920x1080, 1366x768)
- Tablet (768x1024, 1024x768)
- Mobile (375x667, 414x896)

## Debugging Techniques

### Browser Developer Tools
- **Console**: Check for JavaScript errors and log outputs
- **Network**: Monitor any external requests (Chart.js, Ionicons)
- **Application**: Inspect localStorage data
- **Elements**: Debug CSS and HTML structure
- **Sources**: Set breakpoints and step through code

### Common Debugging Scenarios

#### Data Not Saving
1. Check browser console for localStorage errors
2. Verify data structure before saving
3. Test in incognito mode (clean localStorage)
4. Check browser storage limits

#### Calculations Incorrect
1. Add console.log statements to trace values
2. Test with known inputs and expected outputs
3. Check for floating-point precision issues
4. Verify formula implementation

#### Charts Not Rendering
1. Check Chart.js library loading
2. Verify canvas element exists
3. Check data format passed to Chart.js
4. Look for JavaScript errors in console

### Debugging Tools

#### Console Logging
```javascript
function debugLog(message, data = null) {
    if (DEBUG_MODE) {
        console.log(`[DEBUG] ${message}`, data);
    }
}

// Usage
debugLog('Portfolio calculation started', portfolioData);
```

#### Error Tracking
```javascript
window.addEventListener('error', function(event) {
    console.error('Global error:', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
    });
});
```

## Adding New Features

### Feature Development Process
1. **Plan the feature**: Define requirements and user stories
2. **Design the API**: Plan module interfaces and data structures
3. **Implement core logic**: Write the main functionality
4. **Add UI components**: Create forms, displays, and interactions
5. **Integrate with existing modules**: Connect to the main application
6. **Test thoroughly**: Manual testing and edge cases
7. **Update documentation**: Add to API reference and user guide

### Example: Adding a New Calculator

1. **Plan**: Create a retirement calculator
2. **Design API**:
```javascript
Calculator.calculateRetirement = function(currentAge, retirementAge, currentSavings, monthlyContribution, expectedReturn) {
    // Implementation
    return {
        totalSavings: number,
        monthlyIncome: number,
        yearsToRetirement: number
    };
};
```

3. **Implement Logic**:
```javascript
calculateRetirement: function(currentAge, retirementAge, currentSavings, monthlyContribution, expectedReturn) {
    const yearsToRetirement = retirementAge - currentAge;
    const monthsToRetirement = yearsToRetirement * 12;
    const monthlyReturn = expectedReturn / 100 / 12;
    
    // Future value of current savings
    const futureCurrentSavings = currentSavings * Math.pow(1 + monthlyReturn, monthsToRetirement);
    
    // Future value of monthly contributions
    const futureContributions = monthlyContribution * 
        ((Math.pow(1 + monthlyReturn, monthsToRetirement) - 1) / monthlyReturn);
    
    const totalSavings = futureCurrentSavings + futureContributions;
    
    return {
        totalSavings: parseFloat(totalSavings.toFixed(2)),
        monthlyIncome: parseFloat((totalSavings * 0.04 / 12).toFixed(2)), // 4% rule
        yearsToRetirement: yearsToRetirement
    };
}
```

4. **Add UI Components**:
```html
<div class="calculator-section" id="retirement-calculator">
    <h3>Retirement Calculator</h3>
    <form id="retirement-form">
        <div class="form-group">
            <label for="current-age">Current Age</label>
            <input type="number" id="current-age" min="18" max="100" required>
        </div>
        <!-- More form fields -->
        <button type="submit">Calculate</button>
    </form>
    <div id="retirement-results" class="results-section"></div>
</div>
```

5. **Integrate**: Add event listeners and connect to the main calculator interface

### Code Review Checklist
Before submitting changes:
- [ ] Code follows style guidelines
- [ ] All functions have proper error handling
- [ ] Input validation is implemented
- [ ] Changes are tested in multiple browsers
- [ ] Documentation is updated
- [ ] No console.log statements left in production code
- [ ] Performance impact is considered
- [ ] Accessibility guidelines are followed

## Deployment and Distribution

### Preparation for Deployment
1. **Code Review**: Ensure all code meets quality standards
2. **Testing**: Complete thorough testing across browsers and devices
3. **Optimization**: Minify CSS and JavaScript if needed
4. **Documentation**: Update all documentation files
5. **Version Control**: Tag the release version

### Deployment Options

#### Static Hosting
The application can be deployed to any static hosting service:
- **GitHub Pages**: Free hosting for public repositories
- **Netlify**: Easy deployment with continuous integration
- **Vercel**: Fast deployment with preview URLs
- **AWS S3 + CloudFront**: Scalable cloud hosting

#### Local Distribution
For offline use:
1. Package all files in a ZIP archive
2. Include setup instructions
3. Test on clean systems
4. Provide troubleshooting guide

### Maintenance and Updates

#### Regular Maintenance Tasks
- Update external libraries (Chart.js, Ionicons)
- Test with new browser versions
- Monitor for security vulnerabilities
- Optimize performance as needed
- Update documentation

#### Version Control Strategy
- Use semantic versioning (MAJOR.MINOR.PATCH)
- Tag releases in git
- Maintain changelog
- Keep backward compatibility when possible

## Contributing Guidelines

### Getting Started
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Pull Request Process
1. Ensure all tests pass
2. Update documentation as needed
3. Follow code style guidelines
4. Provide clear commit messages
5. Include description of changes

### Code Standards
- Follow existing code patterns
- Write clear, self-documenting code
- Include error handling
- Test edge cases
- Update documentation

This development guide should help you understand the codebase structure, development patterns, and best practices for maintaining and extending the Personal Finance Dashboard application.

## Latest Changes
- Pension tracking with charts and summary view.
- Portfolio export/import and deletion options.
- Portfolio and stock tracker price refresh during pre-, regular, and after-market sessions.
- Base-currency calculations and sticky table improvements.
- Automatic input focus in dialog and edit modals.
- JavaScript modules refactored across `app/js`.
- `.gitignore` updated to ignore Node modules and coverage files.
- Additional rules available in [RULES.md](RULES.md).
- Internationalization support with language switcher and locale files.
- Watchlist now supports real-time price updates via Finnhub WebSocket trades.
## Addendum: Eventing, Testing Mocks, i18n, and API Key Setup

### Eventing Pattern in Practice
- Current code uses DOM CustomEvent:
  - Emit: `document.dispatchEvent(new CustomEvent('event-name', { detail }))`
  - Listen: `document.addEventListener('event-name', handler)`
- Recommended naming: `domain:action` (e.g., `settings:currency-changed`, `portfolio:updated`).
- If a small EventBus wrapper is introduced later, update this section with its API and examples.

### Testing: Mocking fetch and DOM
- Mock network:
  ```js
  beforeEach(() => { global.fetch = jest.fn(); });
  afterEach(() => { jest.resetAllMocks(); });
  test('quotes service returns price', async () => {
    fetch.mockResolvedValueOnce(new Response(JSON.stringify({ c: 123.45 }), { status: 200 }));
    // call service and assert
  });
  ```
- JSDOM: render minimal DOM snippets and query/update them to verify module behavior.
- For Chart.js-dependent code, guard creation behind feature flags or mock the Chart constructor.

### i18n Coverage Checklist
- All visible strings appear via i18n with `data-i18n`.
- Add new keys to `i18n.js` and verify pluralization/number formatting where relevant.
- Manually test at least one RTL locale to confirm layout/mirroring.

### API Key in Settings (User-Configurable)
- Add a Settings UI field for Finnhub API key (stored in localStorage key `pf_api_key_finnhub`).
- Read the key in the shared QuotesService.
- Never log or export the key; do not commit keys to the repo.
