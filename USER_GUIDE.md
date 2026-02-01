# User Guide - Personal Finance Dashboard

## Getting Started

### Opening the Application
1. Download or clone the repository.
2. Open `app/index.html` in any modern web browser.
3. (Optional) Use a local server for best API compatibility:
   ```bash
   python3 -m http.server 8000
   # Then visit http://localhost:8000/app/
   ```

## Navigation

The dashboard is organized into these tabs:

- **Portfolio** - Track investments and portfolio summaries.
- **Watchlist** - Monitor tickers with optional real-time updates.
- **Pension** - Record pension contributions and growth.
- **Calculators** - Loan, investment, CAGR, mortgage, salary, and fair value tools.
- **Stock Performance Tracker** - Track multi-year prices and growth.
- **Stock Finance Performance** - View financial statements and ratios.
- **Settings** - Configure base currency, theme, language, data import/export, and API keys.

## Portfolio Management

### Add Investments
1. Go to **Portfolio**.
2. Click **Add Investment**.
3. Enter ticker, quantity, purchase price, date, last price, and currency.
4. Save the entry. If a ticker already exists, you can combine or keep separate records.

### Manage Portfolios
- Use **Add Portfolio** to create multiple portfolios.
- Use **Remove Portfolio** to delete the currently selected portfolio.
- Toggle **Show in Summary** to include/exclude a portfolio from totals.

### Update Prices
- Click **Get The Last Price** to fetch quotes (requires network access and optional Finnhub API key).

### Review Charts & Stats
- Use the charts to view allocation and P&L.
- View CAGR and best-performing tickers in the stats panel.

## Watchlist

### Add a Watchlist Ticker
1. Go to **Watchlist**.
2. Click **Add Stock**.
3. Enter ticker, name, and currency.
4. Save.

### Real-Time Updates (Optional)
- Add a Finnhub API key in **Settings** to enable live price updates.
- If no key is provided, you can still use **Get The Last Price** for manual refresh.

## Pension Tracking

### Add Pension Data
1. Go to **Pension**.
2. Click **Add Pension** to create a new plan.
3. Use **Add Entry** to record payments or growth values.
4. Toggle **Show in Summary** to include/exclude a pension in the summary.

### Charts & Summaries
- Use **View Chart** to visualize pension growth.
- Summary cards show total value, CAGR, and best/worst periods.

## Financial Calculators

All calculators display results in your selected base currency (except the salary calculator, which uses GBP).

### Loan Calculator
Calculate monthly payments and total interest for loans.

### Investment Calculator
Project future value of investments with compound interest and monthly contributions.

### CAGR Calculator
Compute compound annual growth rate for an investment.

### Mortgage Calculator
Estimate monthly payments and interest portions based on property price and deposit.

### Salary Calculator
Model take-home pay with allowances, pension, student loan, and deductions. You can save multiple salary profiles.

### Fair Value Calculator
Estimate intrinsic value using earnings, growth, and market multipliers.

## Stock Performance Tracker

### Add and Update Data
1. Go to **Stock Performance Tracker**.
2. Add a ticker and fill in yearly prices.
3. Use **Get The Last Price** to fetch the latest quote.

### Analyze Performance
- View growth metrics by year.
- Compare tickers side-by-side.

## Stock Finance Performance

- Enter a ticker and time frame.
- Fetch income statements, balance sheets, and cash flow data.
- Review financial ratios shown alongside tables.

## Settings

### Base Currency
- Select your base currency for totals and calculations.
- FX rates update daily when network access is available.

### Display
- Adjust font size.
- Choose theme (system, light, dark).

### Language
- Select a language and toggle RTL layout if needed.

### Quotes API
- Add a Finnhub API key to enable real-time quotes for portfolio and watchlist.

### Data Export/Import
You can export, import, or delete data for:
- Portfolios
- Watchlist
- Pensions
- Salary entries
- Stock tracker data

### About
- View the current web app version.

## Data Privacy

- All data is stored locally in your browser.
- API keys are stored locally and used only for direct API calls.
- The app does not send personal data to any server.

## Troubleshooting

- **Quotes not updating**: Verify your Finnhub API key and network access.
- **Market status unavailable**: Network access is required for Polygon.io.
- **Base currency not updating**: Ensure ExchangeRate-API is reachable.
