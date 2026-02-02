# Personal Finance Dashboard

A comprehensive single-page web application for managing personal finances, tracking investments, and performing financial calculations. The app runs entirely in the browser with client-side storage, plus optional integrations for live market data.

## Overview

The Personal Finance Dashboard is a client-side HTML application that loads modular JavaScript files under `app/js/`. It uses the IIFE (Immediately Invoked Function Expression) pattern to keep modules isolated and maintainable while minimizing global namespace usage.

**Key Characteristics:**
- **No build step**: Static files served directly in the browser.
- **Privacy-first**: Core data stays in browser storage.
- **Modular**: Each feature lives in its own JavaScript module.
- **Responsive**: Designed for desktop and mobile layouts.
- **Optional live data**: Market status, FX rates, and quotes load from external APIs when available.

## Features

### 📊 Portfolio Management
- Multiple portfolios with per-portfolio visibility in the summary.
- Add, edit, and delete positions with P&L tracking.
- Combined totals with automatic base-currency conversion.
- Interactive charts, CAGR stats, and ticker-level performance.
- Drag-and-drop reordering for portfolio positions.
- Transaction history view with persistence.

### 👀 Watchlist
- Track watchlist tickers with price, change, and range.
- Optional real-time updates via Finnhub WebSocket (API key required).
- Manual quote refresh for on-demand updates.

### 🧓 Pension Tracking
- Record pension entries over time.
- Summary cards for total value, CAGR, and best/worst periods.
- Chart view to visualize growth.
- Export/import and bulk delete support.

### 🧮 Financial Calculators
- **Loan Calculator**
- **Investment Calculator**
- **CAGR Calculator**
- **Mortgage Calculator**
- **Salary Calculator**
- **Dividend & CGT (UK) Calculator**

### 📈 Stock Performance Tracker
- Track multi-year prices and compute growth metrics.
- Compare tickers across time horizons.
- Export/import support for historical data.

### ⚙️ Settings & Customization
- Base currency selector with daily FX rate updates.
- Theme preference (system/light/dark).
- Font scaling controls.
- Language selection with optional RTL toggle.
- Optional Finnhub API key stored locally for real-time quotes.
- Export/import and delete controls for portfolios, watchlist, pensions, salaries, and stock tracker data.

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Charts**: Chart.js
- **Icons**: Ionicons
- **Storage**: Browser localStorage with a memory fallback
- **Architecture**: Modular IIFE pattern
- **Testing**: Jest with JSDOM
- **Deployment**: GitHub Pages via GitHub Actions

## Getting Started

### Prerequisites
- Modern web browser (Chrome 60+, Firefox 55+, Safari 12+, Edge 79+)
- JavaScript enabled
- Optional network access for market data features

### Quick Start
1. Clone the repository:
   ```bash
   git clone https://github.com/bgosalci/personal-finance-dashboard.git
   cd personal-finance-dashboard
   ```

2. Open the application:
   ```bash
   # Option 1: Direct file access
   open app/index.html

   # Option 2: Local server (recommended for development)
   python3 -m http.server 8000
   # Then navigate to http://localhost:8000/app/
   ```

3. Start using the application:
   - Navigate between tabs (Portfolio, Watchlist, Pension, Calculators, Stock Tracker, Settings).
   - Add your first investment or watchlist entry.
   - Configure base currency, theme, and language in Settings.

### Development Setup
1. Install test dependencies:
   ```bash
   cd app/js
   npm install
   ```

2. Run tests:
   ```bash
   npm test
   ```

3. Development workflow:
   - Edit `app/index.html` for structure changes.
   - Modify modules in `app/js/` for behavior.
   - Update `app/css/style.css` for styling.

## File Structure

```
personal-finance-dashboard/
├── app/
│   ├── index.html               # Main application shell
│   ├── css/
│   │   └── style.css            # Application styles
│   └── js/
│       ├── core/
│       │   ├── main.js           # App bootstrap
│       │   ├── settings.js       # Settings UI logic
│       │   ├── i18n.js           # Internationalization
│       │   ├── themeManager.js   # Theme preference handling
│       │   ├── tabManager.js     # Tab navigation
│       │   └── ...               # Supporting core utilities
│       ├── data/
│       │   ├── portfolioStorage.js # Portfolio storage helpers
│       │   └── priceStorage.js     # Quote cache
│       ├── features/
│       │   ├── financialDashboard.js # Module orchestration
│       │   ├── portfolioManager.js   # Portfolio workflows
│       │   ├── watchlistManager.js   # Watchlist workflows
│       │   ├── pensionManager.js     # Pension workflows
│       │   ├── stockTracker.js       # Performance tracking
│       │   └── calculator.js         # Financial calculators
│       └── services/
│           ├── quotesService.js  # Finnhub API wrapper
│           ├── forexData.js      # FX rate service
│           ├── marketStatus.js   # Market status service
│           └── priceUpdater.js   # Automated refresh
├── __tests__/                   # Jest tests
├── README.md                    # Project overview
├── DEVELOPMENT_GUIDE.md         # Contributor workflow
├── TECHNICAL_DOCUMENTATION.md   # Architecture details
├── API_REFERENCE.md             # Module APIs
├── USER_GUIDE.md                # End-user instructions
├── I18N_README.md               # Localization guide
└── DOCUMENTATION_SUMMARY.md     # Documentation index
```

## Testing

```bash
cd app/js
npm test
```

## Browser Compatibility

| Browser | Minimum Version | Notes |
|---------|----------------|-------|
| Chrome | 60+ | Full feature support |
| Firefox | 55+ | Full feature support |
| Safari | 12+ | Full feature support |
| Edge | 79+ | Full feature support |

**Required Features:**
- ES6+ JavaScript support
- localStorage API
- Canvas API (for Chart.js)
- CSS Grid and Flexbox

## Contributing

We welcome contributions! Please follow these guidelines:

1. **Fork the repository** on GitHub.
2. **Clone your fork** locally.
3. **Create a feature branch**.
4. **Follow** the coding standards in [agent.md](agent.md).
5. **Run tests** (`npm test` in `app/js`).
6. **Update documentation** as needed.

For detailed guidelines, see [DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md) and [RULES.md](RULES.md).

## Deployment

The application is deployed to GitHub Pages via GitHub Actions:
- **Live Demo**: https://bgosalci.github.io/personal-finance-dashboard/app/
- **Hosting**: Static hosting compatible

## Support

- **Issues**: https://github.com/bgosalci/personal-finance-dashboard/issues
- **Discussions**: GitHub Discussions

## Acknowledgments

- **Chart.js** - Charts and visualizations
- **Ionicons** - Iconography
- **Finnhub** - Quotes and financial statements
- **Polygon.io** - Market status
- **ExchangeRate-API** - FX conversion data
