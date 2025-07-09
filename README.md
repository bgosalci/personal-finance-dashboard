# Personal Finance Dashboard

A comprehensive single-page web application for managing personal finances, tracking investments, and performing financial calculations.

## Features

### 📊 Portfolio Management
- Add, edit, and delete investment positions
- Real-time profit/loss calculations
- Visual charts showing portfolio performance
- Investment summary with total values and returns

### 🧮 Financial Calculators
- **Loan Calculator**: Monthly payments, total interest, amortization schedules
- **Investment Calculator**: Future value projections with compound interest
- **CAGR Calculator**: Compound Annual Growth Rate analysis
- **Fair Value Calculator**: Stock valuation using P/E ratios

### 📈 Stock Performance Tracker
- Multi-year stock price tracking
- Growth percentage calculations
- Historical performance visualization
- Comparative analysis tools

### 💾 Data Persistence
- Client-side storage using localStorage
- Automatic data backup and restore
- Export/import functionality

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Charts**: Chart.js for data visualization
- **Icons**: Ionicons
- **Storage**: Browser localStorage API
- **Architecture**: Modular JavaScript with IIFE pattern

## Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- No server setup required - runs entirely in the browser

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/bgosalci/personal-finance-dashboard.git
   ```

2. Open `app/financial_dashboard.html` in your web browser

That's it! The application runs entirely client-side.

## Usage

### Portfolio Management
1. Navigate to the "Portfolio" tab
2. Click "Add Investment" to create new positions
3. Enter stock symbol, quantity, and purchase price
4. View real-time calculations and charts

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
│   ├── financial_dashboard.html    # Main application file
│   └── index.html                  # Landing page
└── README.md                  # This documentation
```

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly in multiple browsers
5. Submit a pull request

### Running Tests

The unit tests are located in the `__tests__` folder. Run them with:

```bash
cd app/js && npm test
```

## License

This project is open source and available under the MIT License.

## Support

For issues or questions, please create an issue in the GitHub repository.

## Development Notes

This repository has been verified for development access and functionality.
