# Personal Finance Dashboard

A comprehensive single-page web application for managing personal finances, tracking investments, and performing financial calculations. Built as a client-side application with no server dependencies, ensuring complete data privacy and portability.

## Overview

The Personal Finance Dashboard is designed as a single HTML file application that runs entirely in the browser. It uses a modular JavaScript architecture with the IIFE (Immediately Invoked Function Expression) pattern to create isolated, maintainable modules while avoiding global namespace pollution.

**Key Characteristics:**
- **Zero Dependencies**: No server setup or external services required
- **Privacy-First**: All data stored locally in browser localStorage
- **Portable**: Single file can be opened anywhere
- **Modular**: Clean separation of concerns with dedicated modules for each feature
- **Responsive**: Works seamlessly across desktop, tablet, and mobile devices

## Features

### 📊 Portfolio Management
- Manage multiple portfolios with a combined summary view
- Add, edit, and delete investment positions with detailed tracking
- Real-time profit/loss calculations with percentage gains/losses
- Interactive charts showing portfolio allocation and performance
- Investment summary with total values, returns, and transaction history
- Drag-and-drop reordering of portfolio positions

### 🧮 Financial Calculators
- **Loan Calculator**: Monthly payments, total interest, amortization schedules
- **Investment Calculator**: Future value projections with compound interest
- **CAGR Calculator**: Compound Annual Growth Rate analysis
- **Fair Value Calculator**: Advanced stock valuation using DCF, P/E ratios, and intrinsic value analysis

### 📈 Stock Performance Tracker
- Multi-year stock price tracking with historical data
- Growth percentage calculations and CAGR analysis
- Interactive performance charts and trend visualization
- Comparative analysis tools for multiple stocks
- Market status indicators with real-time session tracking

### 💾 Data Management
- Client-side storage using browser localStorage
- Automatic data backup and quota management
- Export/import functionality for data portability
- Data validation and migration for legacy formats
- Storage usage monitoring with automatic cleanup
- Configurable base currency stored locally

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Charts**: Chart.js for interactive data visualization
- **Icons**: Ionicons for consistent UI elements
- **Storage**: Browser localStorage API with quota management
- **Architecture**: Modular JavaScript with IIFE pattern
- **Testing**: Jest with JSDOM for unit testing
- **Deployment**: GitHub Actions for automated static hosting

## Getting Started

### Prerequisites
- Modern web browser (Chrome 60+, Firefox 55+, Safari 12+, Edge 79+)
- No server setup required - runs entirely in the browser
- JavaScript enabled (required for application functionality)

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
   - Navigate between tabs (Portfolio, Calculators, Stock Tracker)
   - Add your first investment in the Portfolio tab
   - Explore the various financial calculators
   - Track stock performance over time

### Development Setup
For contributors and developers:

1. **Install testing dependencies**:
   ```bash
   cd app/js
   npm install
   ```

2. **Run tests**:
   ```bash
   npm test
   ```

3. **Development workflow**:
   - Edit `app/index.html` for UI changes
   - Modify the modules in `app/js/` for functionality
   - Update `app/css/style.css` for styling
   - Test changes by refreshing the browser

## Usage

### Portfolio Management
1. Navigate to the "Portfolio" tab
2. Use "Add Portfolio" to create additional portfolios as needed
3. Click "Add Investment" to create new positions within the selected portfolio
4. Enter stock symbol, quantity, and purchase price
5. Adding a ticker that already exists prompts you to combine the positions
6. View real-time calculations and charts

### Using Calculators
1. Go to the "Calculators" tab
2. Select the desired calculator type
3. Input the required parameters
4. View instant calculations and results

### Stock Tracking
1. Access the "Stock Tracker" tab
2. Add stocks with historical price data
3. Analyze performance over different time periods
4. Compare multiple stocks side-by-side

## File Structure

```
personal-finance-dashboard/
├── app/
│   ├── index.html                  # Main application file
│   ├── css/
│   │   └── style.css              # Application styles
│   └── js/
│       ├── dialogManager.js      # Dialog utilities
│       ├── tabManager.js         # Tab navigation logic
│       ├── portfolioStorage.js   # Portfolio data persistence
│       ├── portfolioManager.js   # Portfolio calculations
│       ├── calculator.js         # Financial calculators
│       ├── stockTracker.js       # Stock performance tracker
│       ├── stockFinance.js       # Financial statements
│       ├── financialDashboard.js # Main application controller
│       ├── marketStatus.js       # Market status indicator
│       ├── main.js               # App initialization
│       ├── chart.umd.js           # Chart.js library
│       ├── storageManager.js      # Data persistence utilities
│       ├── jest.config.js         # Jest testing configuration
│       └── package.json           # Testing dependencies
├── __tests__/
│   ├── script.test.js             # JavaScript functionality tests
│   ├── html.test.js               # HTML structure tests
│   └── css.test.js                # CSS validation tests
├── .github/
│   └── workflows/
│       └── static.yml             # GitHub Pages deployment
├── README.md                      # Project overview (this file)
├── DEVELOPMENT_GUIDE.md           # Detailed development guidelines
├── TECHNICAL_DOCUMENTATION.md    # Architecture and implementation details
├── API_REFERENCE.md               # Module and function reference
├── USER_GUIDE.md                  # End-user instructions
└── DOCUMENTATION_SUMMARY.md       # Documentation index
```

## Testing

### Running Tests
The project includes comprehensive unit tests using Jest and JSDOM:

```bash
# Install testing dependencies
cd app/js
npm install

# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage
```

### Test Structure
- **`__tests__/script.test.js`**: Core JavaScript functionality
- **`__tests__/html.test.js`**: HTML structure and DOM elements
- **`__tests__/css.test.js`**: CSS class definitions and styling

### Manual Testing
For comprehensive testing, refer to the manual testing checklist in [DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md#manual-testing-checklist).

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

### Getting Started
1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/personal-finance-dashboard.git
   cd personal-finance-dashboard
   ```
3. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

### Development Process
1. **Make your changes** following the coding standards in [agent.md](agent.md)
2. **Test thoroughly**:
   ```bash
   cd app/js && npm test
   ```
3. **Test in multiple browsers** (Chrome, Firefox, Safari, Edge)
4. **Update documentation** if needed
5. **Commit your changes**:
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

### Pull Request Guidelines
- **Clear description**: Explain what your changes do and why
- **Test coverage**: Ensure all new code is tested
- **Documentation**: Update relevant documentation files
- **Code style**: Follow existing patterns and conventions
- **Browser testing**: Verify compatibility across supported browsers

### Code Standards
- Follow the IIFE module pattern for new features
- Use consistent naming conventions
- Include proper error handling and input validation
- Write clear, self-documenting code
- Add JSDoc comments for complex functions

For detailed development guidelines, see [DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md) and [agent.md](agent.md).

## Documentation

This project includes comprehensive documentation:

- **[README.md](README.md)** - Project overview and quick start (this file)
- **[agent.md](agent.md)** - Development best practices and guidelines
- **[DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md)** - Detailed development instructions
- **[TECHNICAL_DOCUMENTATION.md](TECHNICAL_DOCUMENTATION.md)** - Architecture and implementation details
- **[API_REFERENCE.md](API_REFERENCE.md)** - Module and function reference
- **[USER_GUIDE.md](USER_GUIDE.md)** - End-user instructions

## Deployment

The application is automatically deployed to GitHub Pages via GitHub Actions:

- **Live Demo**: [https://bgosalci.github.io/personal-finance-dashboard/app/](https://bgosalci.github.io/personal-finance-dashboard/app/)
- **Deployment**: Automatic on push to `main` branch
- **Hosting**: GitHub Pages (static hosting)

### Manual Deployment
For other hosting platforms:

1. **Static hosting** (Netlify, Vercel, AWS S3):
   - Upload the entire `app/` directory
   - Set `app/index.html` as the entry point

2. **Local distribution**:
   - Package the `app/` directory as a ZIP file
   - Users can extract and open `index.html` locally

## License

This project is open source and available under the MIT License.

## Support

- **Issues**: Create an issue in the [GitHub repository](https://github.com/bgosalci/personal-finance-dashboard/issues)
- **Discussions**: Use GitHub Discussions for questions and feature requests
- **Documentation**: Check the comprehensive documentation files listed above

## Acknowledgments

- **Chart.js** - For beautiful, responsive charts
- **Ionicons** - For consistent iconography
- **Jest & JSDOM** - For reliable testing infrastructure

## Latest Changes
- JavaScript modules refactored for maintainability.
- Updated `.gitignore` to exclude dependencies and build artifacts.
- See [RULES.md](RULES.md) for contribution guidelines.
