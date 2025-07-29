# Agent Development Guide

This document provides development best practices and guidelines specifically for the Personal Finance Dashboard project. It serves as a companion to the [DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md) with focused, actionable guidance for contributors and maintainers.

## Table of Contents

- [Project Architecture](#project-architecture)
- [Development Principles](#development-principles)
- [Code Quality Standards](#code-quality-standards)
- [Testing Protocols](#testing-protocols)
- [Performance Guidelines](#performance-guidelines)
- [Data Management](#data-management)
- [UI/UX Patterns](#uiux-patterns)
- [Deployment Practices](#deployment-practices)
- [Code Review Checklist](#code-review-checklist)
- [Troubleshooting Guide](#troubleshooting-guide)

## Project Architecture

### Single-File Application Pattern

This project uses a unique single-file architecture where the entire application is contained within `app/index.html`. This design choice prioritizes:

- **Portability**: Application can be opened anywhere without setup
- **Simplicity**: No build process or complex tooling required
- **Privacy**: No external dependencies or data transmission
- **Maintainability**: Clear separation through modular JavaScript

### Module Organization (IIFE Pattern)

All JavaScript functionality is organized using the IIFE (Immediately Invoked Function Expression) pattern:

```javascript
const ModuleName = (function() {
    'use strict';
    
    // Private variables and functions
    let privateState = {};
    
    function privateFunction() {
        // Implementation
    }
    
    // Public API
    return {
        publicMethod: function() {
            // Public implementation
        },
        
        init: function() {
            // Module initialization
        }
    };
})();
```

**Key Benefits:**
- Prevents global namespace pollution
- Encapsulates private functionality
- Creates clear module boundaries
- Enables dependency management
- **Modular Files**: Each IIFE module resides in its own JavaScript file under `app/js/`.

### Core Modules Structure

1. **FinancialDashboard** - Main application controller
2. **TabManager** - Navigation and UI state management
3. **PortfolioManager** - Investment tracking and calculations
4. **Calculator** - Financial computation tools
5. **StockTracker** - Historical performance analysis
6. **PortfolioStorage** - Data persistence and management

## Development Principles

### 1. Privacy-First Design

- **No External APIs**: All functionality works offline
- **Local Storage Only**: Data never leaves the user's browser
- **No Tracking**: No analytics or external scripts
- **User Control**: Users own their data completely

### 2. Progressive Enhancement

- **Core Functionality First**: Basic features work without JavaScript
- **Enhanced Experience**: JavaScript adds interactivity and calculations
- **Graceful Degradation**: Application handles missing features gracefully

### 3. Responsive Design

- **Mobile-First**: Design for smallest screens first
- **Flexible Layouts**: Use CSS Grid and Flexbox
- **Touch-Friendly**: Ensure interactive elements are appropriately sized
- **Performance**: Optimize for slower mobile connections

## Code Quality Standards

### JavaScript Best Practices

#### Variable Declarations
```javascript
// Use const for constants
const STORAGE_KEY = 'portfolioData';
const COLOR_PALETTE = ['#3498db', '#e74c3c', '#2ecc71'];

// Use let for variables that change
let currentTab = 'portfolio';
let chartInstance = null;

// Avoid var completely
```

#### Function Design
```javascript
// Keep functions small and focused
function calculateTotalValue(investments) {
    return investments.reduce((total, inv) => {
        return total + (inv.quantity * inv.lastPrice);
    }, 0);
}

// Use descriptive names
function validateInvestmentData(data) {
    const errors = [];
    
    if (!data.ticker || data.ticker.trim() === '') {
        errors.push('Ticker symbol is required');
    }
    
    if (!data.quantity || data.quantity <= 0) {
        errors.push('Quantity must be greater than 0');
    }
    
    return errors;
}
```

#### Error Handling
```javascript
// Always validate inputs
function addInvestment(data) {
    try {
        const errors = validateInvestmentData(data);
        if (errors.length > 0) {
            throw new Error(errors.join(', '));
        }
        
        // Process valid data
        const investment = createInvestment(data);
        saveInvestment(investment);
        
    } catch (error) {
        console.error('Failed to add investment:', error);
        showErrorMessage(error.message);
    }
}
```

### CSS Organization

#### Custom Properties
```css
:root {
    /* Color scheme */
    --primary-color: #2c3e50;
    --secondary-color: #3498db;
    --success-color: #27ae60;
    --danger-color: #e74c3c;
    --warning-color: #f39c12;
    
    /* Layout */
    --container-max-width: 1200px;
    --border-radius: 8px;
    --box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}
```

#### Component-Based Styling
```css
/* Block */
.portfolio-card {
    background: white;
    border-radius: var(--border-radius);
    box-shadow: var(--box-shadow);
    padding: 1.5rem;
}

/* Element */
.portfolio-card__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
}

/* Modifier */
.portfolio-card--highlighted {
    border-left: 4px solid var(--primary-color);
}
```

### HTML Structure

#### Semantic Elements
```html
<!-- Use semantic HTML -->
<main class="main-content">
    <section class="portfolio-section">
        <header class="section-header">
            <h2>Portfolio Overview</h2>
        </header>
        
        <article class="investment-card">
            <h3>Investment Details</h3>
            <!-- Content -->
        </article>
    </section>
</main>
```

#### Accessibility
```html
<!-- Include ARIA attributes -->
<button 
    class="btn btn-primary" 
    aria-label="Add new investment"
    aria-describedby="add-investment-help">
    Add Investment
</button>

<div id="add-investment-help" class="sr-only">
    Opens a form to add a new investment to your portfolio
</div>
```

## Testing Protocols

### Unit Testing with Jest

#### Test Structure
```javascript
// __tests__/module.test.js
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

describe('PortfolioManager', () => {
    let dom, window, PortfolioManager;
    
    beforeEach(() => {
        // Setup DOM environment
        dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
        window = dom.window;
        
        // Load and execute all modules
        const context = vm.createContext(window);
        ['dialogManager.js', 'tabManager.js', 'portfolioStorage.js',
         'portfolioManager.js', 'calculator.js', 'stockTracker.js',
         'stockFinance.js', 'financialDashboard.js', 'marketStatus.js']
          .forEach(file => {
            const content = fs.readFileSync(
                path.resolve(__dirname, `../app/js/${file}`), 'utf8');
            vm.runInContext(content, context);
          });
        PortfolioManager = context.PortfolioManager;
    });
    
    test('should calculate total portfolio value correctly', () => {
        const investments = [
            { quantity: 100, lastPrice: 50.00 },
            { quantity: 50, lastPrice: 25.00 }
        ];
        
        const total = PortfolioManager.calculateTotal(investments);
        expect(total).toBe(6250.00);
    });
});
```

#### Testing Guidelines
- **Test public APIs**: Focus on module interfaces
- **Mock external dependencies**: Use JSDOM for DOM manipulation
- **Test edge cases**: Empty data, invalid inputs, boundary conditions
- **Verify error handling**: Ensure proper error messages and recovery

### Manual Testing Checklist

#### Portfolio Management
- [ ] Add investment with valid data
- [ ] Add investment with invalid data (verify error messages)
- [ ] Edit existing investment
- [ ] Delete investment with confirmation
- [ ] Portfolio totals calculate correctly
- [ ] Charts render and update properly
- [ ] Data persists after page refresh

#### Calculators
- [ ] Loan calculator with various interest rates
- [ ] Investment calculator with compound interest
- [ ] CAGR calculator with different time periods
- [ ] Fair value calculator with DCF analysis
- [ ] Input validation for all fields
- [ ] Results display with proper formatting

#### Cross-Browser Testing
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Guidelines

### Chart.js Optimization

```javascript
// Lazy load charts
let chartInstance = null;

function getChart() {
    if (!chartInstance) {
        chartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 300 // Reduce animation time
                }
            }
        });
    }
    return chartInstance;
}

// Destroy charts when not needed
function cleanup() {
    if (chartInstance) {
        chartInstance.destroy();
        chartInstance = null;
    }
}
```

### Input Debouncing

```javascript
// Debounce expensive calculations
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

const debouncedCalculate = debounce(updateCalculations, 300);

// Use on input events
document.getElementById('investment-quantity')
    .addEventListener('input', debouncedCalculate);
```

### Memory Management

```javascript
// Clean up event listeners
function initializeModule() {
    const handler = (event) => {
        // Handle event
    };
    
    document.addEventListener('click', handler);
    
    // Return cleanup function
    return () => {
        document.removeEventListener('click', handler);
    };
}

// Store cleanup functions
const cleanupFunctions = [];
cleanupFunctions.push(initializeModule());

// Call on page unload
window.addEventListener('beforeunload', () => {
    cleanupFunctions.forEach(cleanup => cleanup());
});
```

## Data Management

### localStorage Best Practices

#### Data Structure
```javascript
// Consistent data structure
const portfolioPosition = {
    id: generateUniqueId(),
    ticker: 'AAPL',
    name: 'Apple Inc.',
    quantity: 100,
    purchasePrice: 150.00,
    lastPrice: 175.00,
    purchaseDate: '2024-01-15',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
};
```

#### Storage Management
```javascript
const PortfolioStorage = (function() {
    const STORAGE_KEY = 'portfolio_positions';
    const SNAPSHOTS_KEY = 'portfolio_snapshots';
    const MAX_STORAGE_USAGE = 0.9; // 90% of quota
    
    function save(data) {
        try {
            // Check quota before saving
            if (getStorageUsage() > MAX_STORAGE_USAGE) {
                cleanupOldData();
            }
            
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            createSnapshot(data);
            
        } catch (error) {
            if (error.name === 'QuotaExceededError') {
                handleStorageQuotaExceeded();
            } else {
                throw error;
            }
        }
    }
    
    function load() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Failed to load data:', error);
            return [];
        }
    }
    
    return { save, load };
})();
```

#### Data Validation
```javascript
function validatePortfolioData(data) {
    if (!Array.isArray(data)) {
        throw new Error('Portfolio data must be an array');
    }
    
    return data.map(position => {
        // Validate required fields
        if (!position.ticker || typeof position.ticker !== 'string') {
            throw new Error('Invalid ticker symbol');
        }
        
        if (!position.quantity || position.quantity <= 0) {
            throw new Error('Quantity must be positive');
        }
        
        // Sanitize and normalize
        return {
            ...position,
            ticker: position.ticker.toUpperCase().trim(),
            quantity: parseFloat(position.quantity),
            purchasePrice: parseFloat(position.purchasePrice),
            lastPrice: parseFloat(position.lastPrice)
        };
    });
}
```

## UI/UX Patterns

* When implementing or updating pop-up dialogues that ask the user for text input, automatically set focus to the text input field so the user can begin typing immediately without extra clicks.
### Modal Management

```javascript
const ModalManager = (function() {
    function open(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;
        
        modal.style.display = 'flex';
        modal.setAttribute('aria-hidden', 'false');
        
        // Focus management
        const firstInput = modal.querySelector('input, button, select');
        if (firstInput) firstInput.focus();
        
        // Trap focus within modal
        trapFocus(modal);
    }
    
    function close(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;
        
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden', 'true');
        
        // Return focus to trigger element
        const trigger = document.querySelector(`[data-modal="${modalId}"]`);
        if (trigger) trigger.focus();
    }
    
    return { open, close };
})();
```

### Form Handling

```javascript
function handleFormSubmission(formId, validator, processor) {
    const form = document.getElementById(formId);
    
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        // Clear previous errors
        clearFormErrors(form);
        
        // Get form data
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        // Validate
        const errors = validator(data);
        if (errors.length > 0) {
            displayFormErrors(form, errors);
            return;
        }
        
        // Process
        try {
            await processor(data);
            form.reset();
            showSuccessMessage('Data saved successfully');
        } catch (error) {
            showErrorMessage(error.message);
        }
    });
}
```

### Responsive Tables

```javascript
function makeTableResponsive(tableId) {
    const table = document.getElementById(tableId);
    const container = table.parentElement;
    
    // Add scroll indicators
    function updateScrollIndicators() {
        const scrollLeft = container.scrollLeft;
        const scrollWidth = container.scrollWidth;
        const clientWidth = container.clientWidth;
        
        container.classList.toggle('scroll-left', scrollLeft > 0);
        container.classList.toggle('scroll-right', 
            scrollLeft < scrollWidth - clientWidth);
    }
    
    container.addEventListener('scroll', updateScrollIndicators);
    window.addEventListener('resize', updateScrollIndicators);
    updateScrollIndicators();
}
```

## Deployment Practices

### GitHub Actions Workflow

The project uses automated deployment via GitHub Actions. Key considerations:

```yaml
# .github/workflows/static.yml
name: Deploy static content to Pages

on:
  push:
    branches: ["main"]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      
      - name: Setup Pages
        uses: actions/configure-pages@v5
      
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: '.'
      
      - name: Deploy to GitHub Pages
        uses: actions/deploy-pages@v4
```

### Pre-Deployment Checklist

- [ ] All tests pass (`npm test`)
- [ ] Manual testing completed across browsers
- [ ] No console errors in production
- [ ] Performance is acceptable
- [ ] Accessibility guidelines followed
- [ ] Documentation updated
- [ ] Version tagged in git

### Static Hosting Optimization

```html
<!-- Optimize for static hosting -->
<head>
    <!-- Cache control -->
    <meta http-equiv="Cache-Control" content="public, max-age=31536000">
    
    <!-- Preload critical resources -->
    <link rel="preload" href="js/chart.umd.js" as="script">
    <link rel="preload" href="css/style.css" as="style">
    
    <!-- DNS prefetch for external resources -->
    <link rel="dns-prefetch" href="//unpkg.com">
</head>
```

## Code Review Checklist

### Before Submitting PR

#### Code Quality
- [ ] Follows IIFE module pattern
- [ ] No global variables introduced
- [ ] Proper error handling implemented
- [ ] Input validation included
- [ ] No console.log statements in production code

#### Testing
- [ ] Unit tests written for new functionality
- [ ] All existing tests pass
- [ ] Manual testing completed
- [ ] Cross-browser compatibility verified

#### Documentation
- [ ] Code is self-documenting
- [ ] Complex functions have JSDoc comments
- [ ] README updated if needed
- [ ] API changes documented
- [ ] Update `DEVELOPMENT_GUIDE.md` with any new features or architectural changes

#### Performance
- [ ] No memory leaks introduced
- [ ] Event listeners properly cleaned up
- [ ] Charts destroyed when not needed
- [ ] Debouncing used for expensive operations

#### Accessibility
- [ ] Semantic HTML used
- [ ] ARIA attributes included where needed
- [ ] Keyboard navigation works
- [ ] Color contrast meets standards

### Reviewing Others' Code

#### Focus Areas
1. **Architecture**: Does it follow the IIFE pattern?
2. **Data Flow**: Is data validation and sanitization proper?
3. **Error Handling**: Are edge cases covered?
4. **Performance**: Any potential bottlenecks?
5. **Security**: Input sanitization and XSS prevention?

#### Review Questions
- Is the code readable and maintainable?
- Does it integrate well with existing modules?
- Are there any breaking changes?
- Is the test coverage adequate?
- Does it follow the project's conventions?

## Troubleshooting Guide

### Common Issues

#### localStorage Not Working
```javascript
// Check if localStorage is available
function isLocalStorageAvailable() {
    try {
        const test = '__localStorage_test__';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
    } catch (error) {
        return false;
    }
}

// Fallback for when localStorage is not available
const storage = isLocalStorageAvailable() ? 
    localStorage : 
    new MemoryStorage();
```

#### Charts Not Rendering
```javascript
// Debug chart issues
function debugChart(chartId) {
    const canvas = document.getElementById(chartId);
    
    if (!canvas) {
        console.error(`Canvas element ${chartId} not found`);
        return;
    }
    
    if (!window.Chart) {
        console.error('Chart.js library not loaded');
        return;
    }
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error('Cannot get 2D context from canvas');
        return;
    }
    
    console.log('Chart debugging info:', {
        canvas: canvas,
        context: ctx,
        chartJs: window.Chart.version
    });
}
```

#### Performance Issues
```javascript
// Monitor performance
function measurePerformance(name, fn) {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    
    console.log(`${name} took ${end - start} milliseconds`);
    return result;
}

// Usage
const portfolioTotal = measurePerformance('Portfolio calculation', () => {
    return calculatePortfolioTotal(investments);
});
```

### Debugging Tools

#### Development Mode
```javascript
// Enable debug mode
const DEBUG_MODE = window.location.hostname === 'localhost';

function debugLog(message, data) {
    if (DEBUG_MODE) {
        console.log(`[DEBUG] ${message}`, data);
    }
}
```

#### Error Tracking
```javascript
// Global error handler
window.addEventListener('error', (event) => {
    console.error('Global error:', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
    });
    
    // Show user-friendly message
    showErrorMessage('An unexpected error occurred. Please refresh the page.');
});
```

---

This guide should be used alongside the comprehensive [DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md) for complete development information. For technical implementation details, refer to [TECHNICAL_DOCUMENTATION.md](TECHNICAL_DOCUMENTATION.md).

## Latest Changes
- Pension tracking with charts and summary view.
- Portfolio export/import and deletion options.
- Portfolio-wide price refresh capability.
- Base-currency calculations and sticky table improvements.
- Automatic input focus in dialog and edit modals.
- Documented new module architecture.
- `.gitignore` updated to keep repos clean.
- Contribution rules summarized in [RULES.md](RULES.md).
- Documentation checklist now includes updating `DEVELOPMENT_GUIDE.md` for new features or architectural changes.
