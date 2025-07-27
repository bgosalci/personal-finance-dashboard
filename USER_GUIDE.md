# User Guide - Personal Finance Dashboard

## Getting Started

### Opening the Application
1. Download or clone the repository
2. Open `app/financial_dashboard.html` in any modern web browser
3. The application will load immediately - no installation required!

## Navigation

The dashboard has five main sections accessible via tabs at the top:

- **Portfolio** - Manage your investments
- **Calculators** - Financial calculation tools  
- **Stock Tracker** - Track stock performance over time
- **Reports** - View portfolio summaries and analytics
- **Settings** - Configure application preferences

## Portfolio Management

### Adding Your First Investment

1. Click on the **Portfolio** tab
2. Click the **"Add Investment"** button
3. Fill in the investment details:
   - **Stock Symbol**: Enter the ticker symbol (e.g., AAPL, GOOGL, MSFT)
   - **Quantity**: Number of shares you own
   - **Purchase Price**: Price per share when you bought it
   - **Purchase Date**: When you bought the investment
   - **Current Price**: Current market price (optional - can be updated later)
   - *If you enter an existing ticker you'll be asked to combine it*

4. Click **"Save Investment"**

### Managing Existing Investments

#### Editing an Investment
1. Find the investment in your portfolio list
2. Click the **"Edit"** button (pencil icon)
3. Update any fields as needed
4. Click **"Save Changes"**

#### Deleting an Investment
1. Find the investment you want to remove
2. Click the **"Delete"** button (trash icon)
3. Confirm the deletion when prompted

#### Updating Current Prices
1. Click the **"Update Prices"** button to refresh all current prices
2. Or edit individual investments to update specific prices

### Understanding Your Portfolio

#### Portfolio Summary
The top section shows:
- **Total Portfolio Value**: Current worth of all investments
- **Total Gain/Loss**: How much you've made or lost
- **Gain/Loss Percentage**: Your overall return percentage
- All totals are displayed in your selected base currency

#### Portfolio Chart
The pie chart shows:
- Distribution of your investments by current value
- Each slice represents a different stock
- Hover over slices to see detailed information

#### Investment List
Each investment shows:
- Stock symbol and company name
- Number of shares owned
- Purchase price vs current price
- Total value and gain/loss
- Percentage return

## Financial Calculators

### Loan Calculator

Calculate monthly payments and total interest for loans.

1. Go to the **Calculators** tab
2. Select **"Loan Calculator"**
3. Enter:
   - **Loan Amount**: Total amount you want to borrow
   - **Interest Rate**: Annual interest rate (as percentage)
   - **Loan Term**: Number of years to repay
4. View results:
   - Monthly payment amount
   - Total amount paid over loan term
   - Total interest paid
   - Amortization schedule (optional)

**Example**: $300,000 loan at 4.5% for 30 years = $1,520 monthly payment

### Investment Calculator

Project future value of investments with compound interest.

1. Select **"Investment Calculator"**
2. Enter:
   - **Initial Investment**: Starting amount
   - **Monthly Contribution**: Additional monthly investments
   - **Annual Return**: Expected yearly return percentage
   - **Time Period**: Number of years to invest
3. View projections:
   - Future value of investment
   - Total contributions made
   - Total interest earned
   - Year-by-year breakdown

**Example**: $10,000 initial + $500/month at 7% for 20 years = $265,679

### CAGR Calculator

Calculate Compound Annual Growth Rate for investments.

1. Select **"CAGR Calculator"**
2. Enter:
   - **Beginning Value**: Starting investment value
   - **Ending Value**: Final investment value
   - **Number of Years**: Time period
3. Result shows annualized return percentage

**Example**: $10,000 → $20,000 over 10 years = 7.18% CAGR

### Fair Value Calculator

Estimate if a stock is fairly priced using P/E ratios.

1. Select **"Fair Value Calculator"**
2. Enter:
   - **Current Stock Price**: Market price per share
   - **Earnings Per Share (EPS)**: Company's EPS
   - **Industry P/E Ratio**: Average P/E for the industry
   - **Expected Growth Rate**: Projected annual growth
3. Get valuation recommendation:
   - Fair value estimate
   - Buy/Hold/Sell recommendation
   - Upside/downside potential

## Stock Performance Tracker

### Adding Stocks to Track

1. Go to the **Stock Tracker** tab
2. Click **"Add Stock"**
3. Enter:
   - **Stock Symbol**: Ticker symbol
   - **Historical Data**: Enter price data for different dates
4. Click **"Save Stock"**

### Analyzing Performance

#### Performance Charts
- View price movements over time
- Compare multiple stocks side-by-side
- Analyze trends and patterns

#### Growth Calculations
- See percentage gains/losses over different periods
- Compare performance across time frames
- Identify best and worst performing periods

#### Time Period Analysis
- 1 Year performance
- 3 Year performance  
- 5 Year performance
- All-time performance

## Data Management

### Automatic Saving
- All your data is automatically saved to your browser
- No need to manually save - changes are stored instantly
- Data persists between browser sessions

### Data Backup
Your data is stored locally in your browser. To backup:

1. Go to **Settings** tab
2. Click **"Export Data"**
3. Save the downloaded file to a safe location

### Data Restore
To restore from a backup:

1. Go to **Settings** tab
2. Click **"Import Data"**
3. Select your backup file
4. Confirm the import

### Clearing Data
To start fresh:

1. Go to **Settings** tab
2. Click **"Clear All Data"**
3. Confirm you want to delete everything

### Changing Base Currency

1. Open the **Settings** tab
2. Choose your preferred currency (USD, GBP or EUR) from the **Base Currency** dropdown
3. The selection is saved automatically and will be used across the application
4. Exchange rates refresh once a day so your totals stay accurate

## Tips for Best Results

### Portfolio Management Tips
- **Update prices regularly** for accurate tracking
- **Include all investments** for complete picture
- **Use consistent symbols** (stick to standard ticker symbols)
- **Track purchase dates** for tax planning

### Calculator Tips
- **Be realistic** with growth rate assumptions (7-10% for stocks)
- **Consider inflation** when planning long-term
- **Use current rates** for loan calculations
- **Factor in fees** and taxes for investment projections

### Stock Tracking Tips
- **Enter historical data** for better trend analysis
- **Track consistently** (same day each month/quarter)
- **Compare to benchmarks** like S&P 500
- **Look at multiple timeframes** for complete picture

## Troubleshooting

### Common Issues

#### Data Not Saving
- Check if browser allows localStorage
- Try refreshing the page
- Clear browser cache and try again

#### Charts Not Loading
- Ensure JavaScript is enabled
- Try a different browser
- Check internet connection

#### Calculations Seem Wrong
- Verify all input values are correct
- Check that percentages are entered as numbers (7, not 0.07)
 - Ensure dates are in **dd/mm/yyyy** format

#### Performance Issues
- Clear old data you no longer need
- Close other browser tabs
- Restart your browser

### Browser Compatibility
Works best with:
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

### Getting Help
- Check this user guide first
- Review error messages carefully
- Try the same action in a different browser
- Clear your browser data and start fresh

## Privacy and Security

### Data Storage
- All data stays on your computer
- Nothing is sent to external servers
- Your financial information remains private

### Recommendations
- Use on your personal computer only
- Don't use on public/shared computers
- Regularly backup your data
- Keep your browser updated for security

## Advanced Features

### Keyboard Shortcuts
- **Tab**: Navigate between form fields
- **Enter**: Submit forms
- **Escape**: Close dialogs
- **Ctrl+S**: Quick save (where applicable)

### Customization Options
- Change currency display format
- Adjust chart colors and styles
- Set default calculation parameters
- Configure automatic backup frequency

### Export Options
- Export portfolio to CSV
- Print portfolio reports
- Save charts as images
- Generate PDF summaries

## Frequently Asked Questions

**Q: Can I use this on my phone?**
A: Yes! The dashboard works on mobile browsers, though the experience is optimized for desktop.

**Q: Is my data secure?**
A: Yes, all data is stored locally on your device. Nothing is transmitted to external servers.

**Q: Can I track cryptocurrency?**
A: The portfolio manager works with any symbol you enter, including crypto tickers.

**Q: How accurate are the calculators?**
A: The calculators use standard financial formulas and are accurate for planning purposes. Always consult a financial advisor for major decisions.

**Q: Can I import data from my broker?**
A: Currently, data must be entered manually. Export/import features work with the dashboard's own format.

**Q: What happens if I clear my browser data?**
A: Your dashboard data will be lost. Always export a backup before clearing browser data.

**Q: Can multiple people use the same dashboard?**
A: Each browser stores its own data. Different users would need separate browsers or user profiles.

**Q: How often should I update my data?**
A: Update investment prices weekly or monthly for accurate tracking. More frequent updates provide better insights.

## Latest Changes
- Interface scripts reorganized into modules.
- `.gitignore` now excludes Node dependencies.
- Review [RULES.md](RULES.md) before contributing.
