// Main Application Module using Closure for Data Privacy
        const FinanceDashboard = (function() {
            // Private data - completely encapsulated
            let _portfolios = [
                {
                    id: 1,
                    name: "Main Portfolio",
                    holdings: [
                        { symbol: "AAPL", shares: 50, avgPrice: 150, currentPrice: 175 },
                        { symbol: "GOOGL", shares: 25, avgPrice: 120, currentPrice: 140 },
                        { symbol: "MSFT", shares: 30, avgPrice: 280, currentPrice: 305 }
                    ]
                }
            ];

            let _pensions = [
                {
                    id: 1,
                    name: "Company Pension",
                    currentValue: 85000,
                    monthlyContribution: 500,
                    employerMatch: 250,
                    expectedReturn: 7,
                    targetRetirement: new Date('2055-01-01')
                }
            ];

            let _stocks = ["AAPL", "NVDA", "MSFT", "META", "GOOGL", "AMZN", "TSLA", "PLTR", "SPY", "QQQ"];
            let _activeTab = 'portfolios';
            let _activeCalculator = 'loan';

            // Private utility functions
            function _saveToStorage(key, data) {
                try {
                    localStorage.setItem(key, JSON.stringify(data));
                } catch (e) {
                    console.warn('Could not save to localStorage:', e);
                }
            }

            function _loadFromStorage(key, defaultValue = null) {
                try {
                    const stored = localStorage.getItem(key);
                    return stored ? JSON.parse(stored) : defaultValue;
                } catch (e) {
                    console.warn('Could not load from localStorage:', e);
                    return defaultValue;
                }
            }

            function _generateId() {
                return Date.now() + Math.random().toString(36).substr(2, 9);
            }

            // Portfolio Management Module
            const PortfolioManager = (function() {
                function calculatePortfolioValue(portfolio) {
                    return portfolio.holdings.reduce((total, holding) => 
                        total + (holding.shares * holding.currentPrice), 0
                    );
                }

                function calculatePortfolioGainLoss(portfolio) {
                    const totalValue = calculatePortfolioValue(portfolio);
                    const totalCost = portfolio.holdings.reduce((total, holding) => 
                        total + (holding.shares * holding.avgPrice), 0
                    );
                    return totalValue - totalCost;
                }

                function render() {
                    const container = document.getElementById('portfolios-container');
                    
                    if (_portfolios.length === 0) {
                        container.innerHTML = '<div class="empty-state">No portfolios yet. Add your first portfolio to get started!</div>';
                        return;
                    }

                    container.innerHTML = _portfolios.map(portfolio => {
                        const totalValue = calculatePortfolioValue(portfolio);
                        const gainLoss = calculatePortfolioGainLoss(portfolio);
                        const totalCost = totalValue - gainLoss;
                        const gainLossPercent = totalCost > 0 ? (gainLoss / totalCost) * 100 : 0;

                        return `
                            <div class="card">
                                <div class="portfolio-header">
                                    <div class="portfolio-name">${portfolio.name}</div>
                                    <div class="portfolio-stats">
                                        <div class="total-value">£${totalValue.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                        <div class="gain-loss ${gainLoss >= 0 ? 'positive' : 'negative'}">
                                            ${gainLoss >= 0 ? '+' : ''}£${Math.abs(gainLoss).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} 
                                            (${gainLossPercent >= 0 ? '+' : ''}${gainLossPercent.toFixed(2)}%)
                                        </div>
                                    </div>
                                </div>
                                
                                ${portfolio.holdings.length > 0 ? `
                                    <div class="table-wrapper" style="max-height: 300px;">
                                        <table class="sticky-table">
                                            <thead>
                                                <tr>
                                                    <th>Symbol</th>
                                                    <th class="text-right">Shares</th>
                                                    <th class="text-right">Avg Price</th>
                                                    <th class="text-right">Current Price</th>
                                                    <th class="text-right">Market Value</th>
                                                    <th class="text-right">Gain/Loss</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                ${portfolio.holdings.map(holding => {
                                                    const marketValue = holding.shares * holding.currentPrice;
                                                    const cost = holding.shares * holding.avgPrice;
                                                    const holdingGainLoss = marketValue - cost;
                                                    const holdingGainLossPercent = cost > 0 ? (holdingGainLoss / cost) * 100 : 0;

                                                    return `
                                                        <tr>
                                                            <td><strong>${holding.symbol}</strong></td>
                                                            <td class="text-right">${holding.shares}</td>
                                                            <td class="text-right">£${holding.avgPrice.toFixed(2)}</td>
                                                            <td class="text-right">£${holding.currentPrice.toFixed(2)}</td>
                                                            <td class="text-right">£${marketValue.toFixed(2)}</td>
                                                            <td class="text-right ${holdingGainLoss >= 0 ? 'positive' : 'negative'}">
                                                                ${holdingGainLoss >= 0 ? '+' : ''}£${Math.abs(holdingGainLoss).toFixed(2)} 
                                                                (${holdingGainLossPercent >= 0 ? '+' : ''}${holdingGainLossPercent.toFixed(2)}%)
                                                            </td>
                                                        </tr>
                                                    `;
                                                }).join('')}
                                            </tbody>
                                        </table>
                                    </div>
                                ` : '<div class="empty-state">No holdings in this portfolio</div>'}
                                
                                <button class="btn btn-primary" onclick="FinanceDashboard.addHolding(${portfolio.id})" style="margin-top: 15px;">
                                    ➕ Add Holding
                                </button>
                            </div>
                        `;
                    }).join('');
                }

                return {
                    render,
                    add: function(name) {
                        const newPortfolio = {
                            id: _generateId(),
                            name: name,
                            holdings: []
                        };
                        _portfolios.push(newPortfolio);
                        _saveToStorage('portfolios', _portfolios);
                        render();
                    },
                    addHolding: function(portfolioId, symbol, shares, avgPrice) {
                        const portfolio = _portfolios.find(p => p.id == portfolioId);
                        if (portfolio) {
                            portfolio.holdings.push({
                                symbol: symbol.toUpperCase(),
                                shares: shares,
                                avgPrice: avgPrice,
                                currentPrice: avgPrice
                            });
                            _saveToStorage('portfolios', _portfolios);
                            render();
                        }
                    },
                    updatePrices: function() {
                        _portfolios.forEach(portfolio => {
                            portfolio.holdings.forEach(holding => {
                                holding.currentPrice = Math.max(1, holding.currentPrice + (Math.random() - 0.5) * 2);
                            });
                        });
                        render();
                    }
                };
            })();

            // Pension Management Module
            const PensionManager = (function() {
                function calculatePensionProjection(pension) {
                    const yearsToRetirement = (pension.targetRetirement - new Date()) / (1000 * 60 * 60 * 24 * 365);
                    const monthlyReturn = pension.expectedReturn / 100 / 12;
                    const monthsToRetirement = yearsToRetirement * 12;
                    
                    const futureValueCurrent = pension.currentValue * Math.pow(1 + pension.expectedReturn / 100, yearsToRetirement);
                    const monthlyTotal = pension.monthlyContribution + pension.employerMatch;
                    const futureValueContributions = monthlyTotal * 
                        ((Math.pow(1 + monthlyReturn, monthsToRetirement) - 1) / monthlyReturn);
                    
                    return futureValueCurrent + futureValueContributions;
                }

                function render() {
                    const container = document.getElementById('pensions-container');
                    
                    if (_pensions.length === 0) {
                        container.innerHTML = '<div class="empty-state">No pensions tracked yet. Add your first pension to get started!</div>';
                        return;
                    }

                    container.innerHTML = _pensions.map(pension => {
                        const yearsToRetirement = Math.max(0, (pension.targetRetirement - new Date()) / (1000 * 60 * 60 * 24 * 365));
                        const monthlyTotal = pension.monthlyContribution + pension.employerMatch;
                        const projectedValue = calculatePensionProjection(pension);

                        return `
                            <div class="card">
                                <h3 style="margin-bottom: 25px; color: #2c3e50; font-size: 1.5rem;">${pension.name}</h3>
                                
                                <div class="metrics-grid">
                                    <div class="metric-card">
                                        <div class="metric-label">Current Value</div>
                                        <div class="metric-value">£${pension.currentValue.toLocaleString()}</div>
                                    </div>
                                    
                                    <div class="metric-card green">
                                        <div class="metric-label">Monthly Contribution</div>
                                        <div class="metric-value">£${monthlyTotal.toLocaleString()}</div>
                                        <div class="metric-sub">You: £${pension.monthlyContribution} + Employer: £${pension.employerMatch}</div>
                                    </div>
                                    
                                    <div class="metric-card purple">
                                        <div class="metric-label">Expected Return</div>
                                        <div class="metric-value">${pension.expectedReturn}%</div>
                                    </div>
                                    
                                    <div class="metric-card orange">
                                        <div class="metric-label">Years to Retirement</div>
                                        <div class="metric-value">${yearsToRetirement.toFixed(1)}</div>
                                    </div>
                                </div>

                                <div class="projection-card">
                                    <div class="projection-label">Projected Retirement Value</div>
                                    <div class="projection-value">£${projectedValue.toLocaleString('en-GB', { maximumFractionDigits: 0 })}</div>
                                    <div class="projection-sub">Growth of £${(projectedValue - pension.currentValue).toLocaleString('en-GB', { maximumFractionDigits: 0 })} from current value</div>
                                </div>
                            </div>
                        `;
                    }).join('');
                }

                return {
                    render,
                    add: function(pensionData) {
                        const newPension = {
                            id: _generateId(),
                            ...pensionData,
                            expectedReturn: pensionData.expectedReturn || 7,
                            targetRetirement: pensionData.targetRetirement || new Date('2055-01-01')
                        };
                        _pensions.push(newPension);
                        _saveToStorage('pensions', _pensions);
                        render();
                    }
                };
            })();

            // Calculator Module
            const Calculator = (function() {
                function setupInvestmentYears() {
                    const select = document.getElementById('invest-years');
                    for (let i = 1; i <= 50; i++) {
                        const option = document.createElement('option');
                        option.value = i;
                        option.textContent = `${i} year${i === 1 ? '' : 's'}`;
                        if (i === 25) option.selected = true;
                        select.appendChild(option);
                    }
                }

                function calculateLoan() {
                    const amount = parseFloat(document.getElementById('loan-amount').value) || 0;
                    const rate = parseFloat(document.getElementById('loan-rate').value) || 0;
                    const term = parseFloat(document.getElementById('loan-term').value) || 0;

                    if (amount > 0 && rate > 0 && term > 0) {
                        const monthlyRate = rate / 100 / 12;
                        const numPayments = term * 12;
                        const payment = amount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                                       (Math.pow(1 + monthlyRate, numPayments) - 1);
                        const totalInterest = (payment * numPayments) - amount;

                        document.getElementById('loan-payment').textContent = 
                            `£${payment.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                        document.getElementById('loan-interest').textContent = 
                            `Total Interest: £${totalInterest.toLocaleString('en-GB', { maximumFractionDigits: 0 })}`;
                    } else {
                        document.getElementById('loan-payment').textContent = '£0.00';
                        document.getElementById('loan-interest').textContent = 'Enter loan details to calculate';
                    }
                }

                function calculateInvestment() {
                    const amount = parseFloat(document.getElementById('invest-amount').value) || 0;
                    const rate = parseFloat(document.getElementById('invest-rate').value) || 0;
                    const years = parseInt(document.getElementById('invest-years').value) || 25;

                    document.getElementById('invest-period').textContent = 
                        `Value After ${years} Year${years === 1 ? '' : 's'}`;

                    if (amount > 0 && rate > 0) {
                        const futureValue = amount * Math.pow(1 + rate / 100, years);
                        const totalGain = futureValue - amount;

                        document.getElementById('invest-value').textContent = 
                            `£${futureValue.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                        document.getElementById('invest-gain').textContent = 
                            `Total Gain: £${totalGain.toLocaleString('en-GB', { maximumFractionDigits: 0 })}`;

                        renderGrowthTable(amount, rate, years);
                    } else {
                        document.getElementById('invest-value').textContent = '£0.00';
                        document.getElementById('invest-gain').textContent = 'Enter investment details to calculate';
                        document.getElementById('growth-table-content').innerHTML = 
                            '<div class="empty-state">Enter investment amount and return rate to see projections</div>';
                    }
                }

                function renderGrowthTable(amount, rate, years) {
                    const html = `
                        <table class="sticky-table">
                            <thead>
                                <tr>
                                    <th>Year</th>
                                    <th class="text-right">Value</th>
                                    <th class="text-right">Annual Gain</th>
                                    <th class="text-right">Total Gain</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${Array.from({length: years}, (_, i) => {
                                    const year = i + 1;
                                    const currentValue = amount * Math.pow(1 + rate / 100, year);
                                    const previousValue = amount * Math.pow(1 + rate / 100, year - 1);
                                    const annualGain = currentValue - previousValue;
                                    const totalGain = currentValue - amount;

                                    return `
                                        <tr>
                                            <td><strong>${year}</strong></td>
                                            <td class="text-right">£${currentValue.toLocaleString('en-GB', { maximumFractionDigits: 0 })}</td>
                                            <td class="text-right positive">£${annualGain.toLocaleString('en-GB', { maximumFractionDigits: 0 })}</td>
                                            <td class="text-right" style="color: #3498db; font-weight: 600;">£${totalGain.toLocaleString('en-GB', { maximumFractionDigits: 0 })}</td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    `;
                    document.getElementById('growth-table-content').innerHTML = html;
                }

                function setupListeners() {
                    // Loan calculator listeners
                    ['loan-amount', 'loan-rate', 'loan-term'].forEach(id => {
                        document.getElementById(id).addEventListener('input', calculateLoan);
                    });

                    // Investment calculator listeners
                    ['invest-amount', 'invest-rate', 'invest-years'].forEach(id => {
                        document.getElementById(id).addEventListener('input', calculateInvestment);
                    });
                }

                return {
                    init: function() {
                        setupInvestmentYears();
                        setupListeners();
                    },
                    switchCalculator: function(calc) {
                        _activeCalculator = calc;
                        
                        // Update nav buttons
                        document.querySelectorAll('.calc-tab').forEach(tab => tab.classList.remove('active'));
                        document.querySelector(`[data-calc="${calc}"]`).classList.add('active');

                        // Show selected calculator
                        document.querySelectorAll('.calculator').forEach(calculator => calculator.classList.remove('active'));
                        document.getElementById(calc + '-calc').classList.add('active');
                    }
                };
            })();

            // Stock Performance Module with Alpha Vantage Integration
            const StockManager = (function() {
                async function fetchAlphaVantageData(symbol, startYear) {
                    const cacheKey = `stockData_${symbol}_${startYear}`;
                    const cachedData = _loadFromStorage(cacheKey);
                    
                    if (cachedData) {
                        const cacheAge = Date.now() - cachedData.timestamp;
                        if (cacheAge < 24 * 60 * 60 * 1000) {
                            console.log(`Using cached data for ${symbol}`);
                            return cachedData.data;
                        }
                    }
                    
                    try {
                        const apiKey = _loadFromStorage('alphaVantageApiKey') || 'demo';
                        const url = `https://www.alphavantage.co/query?function=TIME_SERIES_YEARLY&symbol=${symbol}&apikey=${apiKey}`;
                        
                        const response = await fetch(url);
                        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                        
                        const data = await response.json();
                        
                        if (data['Error Message']) {
                            throw new Error(`API Error: ${data['Error Message']}`);
                        }
                        
                        if (data['Note']) {
                            throw new Error('API rate limit exceeded');
                        }
                        
                        const timeSeries = data['Annual Time Series'];
                        if (!timeSeries) {
                            throw new Error('No time series data found');
                        }
                        
                        const processedData = processAlphaVantageData(timeSeries, startYear);
                        
                        _saveToStorage(cacheKey, {
                            data: processedData,
                            timestamp: Date.now()
                        });
                        
                        console.log(`Fetched fresh Alpha Vantage data for ${symbol}`);
                        return processedData;
                        
                    } catch (error) {
                        console.warn(`Failed to fetch real data for ${symbol}:`, error.message);
                        return generateSimulatedData(symbol, startYear);
                    }
                }

                function processAlphaVantageData(timeSeries, startYear) {
                    const currentYear = new Date().getFullYear();
                    const yearlyData = [];
                    
                    for (const [date, values] of Object.entries(timeSeries)) {
                        const year = parseInt(date.split('-')[0]);
                        if (year >= startYear && year <= currentYear) {
                            yearlyData.push({
                                year: year,
                                price: parseFloat(values['4. close']),
                                adjustedPrice: parseFloat(values['5. adjusted close'])
                            });
                        }
                    }
                    
                    yearlyData.sort((a, b) => a.year - b.year);
                    
                    if (yearlyData.length === 0) {
                        throw new Error('No data available for the selected time period');
                    }
                    
                    const processedData = [];
                    const startPrice = yearlyData[0].adjustedPrice;
                    
                    processedData.push({
                        year: 0,
                        price: startPrice,
                        value: 10000,
                        return: 0
                    });
                    
                    for (let i = 1; i < yearlyData.length; i++) {
                        const currentPrice = yearlyData[i].adjustedPrice;
                        const previousPrice = yearlyData[i - 1].adjustedPrice;
                        
                        if (currentPrice && previousPrice && previousPrice > 0) {
                            const yearlyReturn = (currentPrice - previousPrice) / previousPrice;
                            const newValue = processedData[i - 1].value * (1 + yearlyReturn);
                            
                            processedData.push({
                                year: i,
                                price: currentPrice,
                                value: newValue,
                                return: yearlyReturn
                            });
                        }
                    }
                    
                    return processedData;
                }

                function generateSimulatedData(symbol, startYear) {
                    const currentYear = new Date().getFullYear();
                    const years = currentYear - startYear;
                    const patterns = {
                        'AAPL': { base: 0.15, volatility: 0.3, seed: 1.2 },
                        'NVDA': { base: 0.25, volatility: 0.5, seed: 2.1 },
                        'MSFT': { base: 0.12, volatility: 0.2, seed: 1.5 },
                        'META': { base: 0.08, volatility: 0.4, seed: 1.8 },
                        'GOOGL': { base: 0.11, volatility: 0.25, seed: 1.3 },
                        'AMZN': { base: 0.13, volatility: 0.35, seed: 1.7 },
                        'TSLA': { base: 0.20, volatility: 0.6, seed: 2.5 },
                        'PLTR': { base: 0.05, volatility: 0.4, seed: 1.1 },
                        'SPY': { base: 0.08, volatility: 0.15, seed: 1.0 },
                        'QQQ': { base: 0.11, volatility: 0.2, seed: 1.4 }
                    };
                    
                    const pattern = patterns[symbol] || { base: 0.08, volatility: 0.2, seed: 1.0 };
                    const data = [];
                    
                    data.push({
                        year: 0,
                        price: 100 + Math.random() * 200,
                        value: 10000,
                        return: 0
                    });
                    
                    for (let year = 1; year <= years; year++) {
                        const seedValue = (symbol.charCodeAt(0) * pattern.seed + year * 137) % 1000;
                        const randomFactor = (Math.sin(seedValue) * pattern.volatility);
                        const cyclicalFactor = Math.cos(year * 0.8) * 0.05;
                        const yearlyReturn = Math.max(-0.6, Math.min(1.2, pattern.base + randomFactor + cyclicalFactor));
                        
                        const newValue = data[year - 1].value * (1 + yearlyReturn);
                        data.push({
                            year: year,
                            price: data[year - 1].price * (1 + yearlyReturn),
                            value: newValue,
                            return: yearlyReturn
                        });
                    }
                    
                    return data;
                }

                function calculateCAGR(initialValue, finalValue, years) {
                    if (years === 0) return 0;
                    return Math.pow(finalValue / initialValue, 1 / years) - 1;
                }

                function setupYearSelector() {
                    const currentYear = new Date().getFullYear();
                    const select = document.getElementById('start-year-select');
                    
                    for (let year = 2000; year <= currentYear - 1; year++) {
                        const option = document.createElement('option');
                        option.value = year;
                        option.textContent = year;
                        if (year === 2020) option.selected = true;
                        select.appendChild(option);
                    }
                    
                    const savedStartYear = _loadFromStorage('stockAnalysisStartYear');
                    if (savedStartYear) {
                        select.value = savedStartYear;
                    }
                    
                    select.addEventListener('change', function() {
                        _saveToStorage('stockAnalysisStartYear', this.value);
                        render();
                    });
                }

                async function render() {
                    const startYear = parseInt(document.getElementById('start-year-select').value);
                    const currentYear = new Date().getFullYear();
                    const years = currentYear - startYear;
                    const container = document.getElementById('stock-performance-table');
                    
                    // Show loading state
                    container.innerHTML = `
                        <div class="loading-state">
                            <div class="icon">📊</div>
                            <div style="font-size: 1.2rem; color: #7f8c8d; margin-bottom: 10px;">Loading stock data...</div>
                            <div style="font-size: 0.9rem; color: #95a5a6;">Fetching data from Alpha Vantage API</div>
                        </div>
                    `;
                    
                    try {
                        const allStockData = {};
                        const fetchPromises = _stocks.map(async (ticker) => {
                            const data = await fetchAlphaVantageData(ticker, startYear);
                            allStockData[ticker] = data;
                        });
                        
                        await Promise.all(fetchPromises);
                        
                        // Build table with PROPER sticky headers
                        let tableHTML = `
                            <table class="sticky-table">
                                <thead>
                                    <tr>
                                        <th>Year</th>
                                        ${_stocks.map(ticker => 
                                            `<th class="text-right"><strong>${ticker}</strong></th>`
                                        ).join('')}
                                    </tr>
                                </thead>
                                <tbody>
                        `;
                        
                        // Initial investment row
                        tableHTML += `
                            <tr style="background: #f1f5f9; font-weight: bold;">
                                <td><strong>${startYear} (Start)</strong></td>
                                ${_stocks.map(() => '<td class="text-right"><strong>£10,000</strong><br><span style="font-size: 0.8em; color: #64748b;">Initial Investment</span></td>').join('')}
                            </tr>
                        `;
                        
                        // Yearly progression rows
                        for (let year = 1; year <= years; year++) {
                            const displayYear = startYear + year;
                            tableHTML += `
                                <tr>
                                    <td><strong>${displayYear}</strong></td>
                                    ${_stocks.map(ticker => {
                                        const stockData = allStockData[ticker];
                                        if (stockData && stockData[year]) {
                                            const value = stockData[year].value;
                                            const yearReturn = stockData[year].return;
                                            const colorClass = yearReturn >= 0 ? 'positive' : 'negative';
                                            return `<td class="text-right">
                                                <div style="font-weight: 600;">£${value.toLocaleString('en-GB', { maximumFractionDigits: 0 })}</div>
                                                <div class="${colorClass}" style="font-size: 0.8em;">
                                                    ${yearReturn >= 0 ? '+' : ''}${(yearReturn * 100).toFixed(1)}%
                                                </div>
                                            </td>`;
                                        } else {
                                            return '<td class="text-right" style="color: #94a3b8;">N/A</td>';
                                        }
                                    }).join('')}
                                </tr>
                            `;
                        }
                        
                        // Add CAGR row
                        tableHTML += `
                            <tr style="background: #34495e; color: black; font-weight: bold;">
                                <td><strong>CAGR</strong></td>
                                ${_stocks.map(ticker => {
                                    const stockData = allStockData[ticker];
                                    if (stockData && stockData[years]) {
                                        const finalValue = stockData[years].value;
                                        const cagr = calculateCAGR(10000, finalValue, years);
                                        return `<td class="text-right" style="color: ${cagr >= 0 ? '#10b981' : '#ef4444'};">
                                            <strong>${cagr >= 0 ? '+' : ''}${(cagr * 100).toFixed(1)}%</strong>
                                            <br><span style="font-size: 0.8em; opacity: 0.8;">Annual</span>
                                        </td>`;
                                    } else {
                                        return '<td class="text-right" style="color: #94a3b8;">N/A</td>';
                                    }
                                }).join('')}
                            </tr>
                        `;
                        
                        // Add total return row
                        tableHTML += `
                            <tr style="background: #34495e; color: black; font-weight: bold;">
                                <td><strong>Final Results</strong></td>
                                ${_stocks.map(ticker => {
                                    const stockData = allStockData[ticker];
                                    if (stockData && stockData[years]) {
                                        const finalValue = stockData[years].value;
                                        const totalReturn = (finalValue - 10000) / 10000;
                                        return `<td class="text-right">
                                            <div style="font-size: 1.1em; margin-bottom: 2px;">£${finalValue.toLocaleString('en-GB', { maximumFractionDigits: 0 })}</div>
                                            <div style="color: ${totalReturn >= 0 ? '#10b981' : '#ef4444'}; font-size: 0.9em;">
                                                ${totalReturn >= 0 ? '+' : ''}${(totalReturn * 100).toFixed(1)}% Total
                                            </div>
                                        </td>`;
                                    } else {
                                        return '<td class="text-right" style="color: #94a3b8;">N/A</td>';
                                    }
                                }).join('')}
                            </tr>
                        `;
                        
                        tableHTML += '</tbody></table>';
                        container.innerHTML = tableHTML;
                        
                        // Render summary sections
                        renderSummary(allStockData, years, startYear, currentYear);
                        
                    } catch (error) {
                        console.error('Error rendering stock performance:', error);
                        container.innerHTML = `
                            <div style="text-align: center; padding: 60px; color: #ef4444;">
                                <div style="font-size: 2rem; margin-bottom: 20px;">⚠️</div>
                                <div style="font-size: 1.2rem; margin-bottom: 10px;">Error Loading Data</div>
                                <div style="font-size: 0.9rem; color: #94a3b8;">Please try refreshing or check your API settings</div>
                            </div>
                        `;
                        document.getElementById('stock-summary').innerHTML = '';
                    }
                }

                function renderSummary(allStockData, years, startYear, currentYear) {
                    const validStockData = _stocks.filter(ticker => allStockData[ticker] && allStockData[ticker][years]);
                    
                    if (validStockData.length === 0) {
                        document.getElementById('stock-summary').innerHTML = '';
                        return;
                    }

                    const allFinalValues = validStockData.map(ticker => allStockData[ticker][years].value);
                    const avgFinalValue = allFinalValues.reduce((sum, val) => sum + val, 0) / allFinalValues.length;
                    const avgCAGR = calculateCAGR(10000, avgFinalValue, years);
                    
                    // Find best and worst performers
                    const performance = validStockData.map(ticker => ({
                        ticker,
                        finalValue: allStockData[ticker][years].value,
                        totalReturn: (allStockData[ticker][years].value - 10000) / 10000,
                        cagr: calculateCAGR(10000, allStockData[ticker][years].value, years)
                    }));
                    
                    performance.sort((a, b) => b.totalReturn - a.totalReturn);
                    const bestPerformer = performance[0];
                    const worstPerformer = performance[performance.length - 1];
                    
                    // Find most consistent performer (lowest volatility)
                    const volatilities = validStockData.map(ticker => {
                        const returns = [];
                        for (let year = 1; year <= years; year++) {
                            if (allStockData[ticker][year]) {
                                returns.push(allStockData[ticker][year].return);
                            }
                        }
                        if (returns.length > 0) {
                            const avgReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
                            const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / returns.length;
                            const volatility = Math.sqrt(variance);
                            return { ticker, volatility, avgReturn };
                        }
                        return null;
                    }).filter(v => v !== null);
                    
                    volatilities.sort((a, b) => a.volatility - b.volatility);
                    const mostConsistent = volatilities[0];
                    
                    // Data source indicator
                    const apiKey = _loadFromStorage('alphaVantageApiKey');
                    const dataSourceText = validStockData.length > 0 ? "📈 Alpha Vantage Data" : "🎲 Simulated Data";
                    const dataSourceSubtext = (apiKey && apiKey !== 'demo') ? 
                        "Real market data • Cached for 24 hours" : 
                        "Demo mode • Get API key for real data";
                    
                    const summaryHTML = `
                        <div class="summary-grid">
                            <div style="grid-column: 1 / -1; text-align: center; margin-bottom: 15px;">
                                <h4 style="font-size: 1.3rem; margin-bottom: 8px;">Investment Analysis: ${startYear} - ${currentYear} (${years} Years)</h4>
                                <div style="opacity: 0.9;">
                                    <div style="font-size: 0.9rem;">${dataSourceText}</div>
                                    <div style="font-size: 0.8rem; opacity: 0.8;">${dataSourceSubtext}</div>
                                </div>
                            </div>
                            
                            <div class="summary-card">
                                <div class="summary-label">Portfolio Average</div>
                                <div class="summary-value">£${avgFinalValue.toLocaleString('en-GB', { maximumFractionDigits: 0 })}</div>
                                <div class="summary-sub">${avgCAGR >= 0 ? '+' : ''}${(avgCAGR * 100).toFixed(1)}% CAGR</div>
                            </div>
                            
                            <div class="summary-card">
                                <div class="summary-label">Best Performer</div>
                                <div class="summary-value">${bestPerformer.ticker}</div>
                                <div class="summary-sub">+${(bestPerformer.totalReturn * 100).toFixed(1)}% • ${(bestPerformer.cagr * 100).toFixed(1)}% CAGR</div>
                            </div>
                            
                            <div class="summary-card">
                                <div class="summary-label">Worst Performer</div>
                                <div class="summary-value">${worstPerformer.ticker}</div>
                                <div class="summary-sub">${worstPerformer.totalReturn >= 0 ? '+' : ''}${(worstPerformer.totalReturn * 100).toFixed(1)}% • ${(worstPerformer.cagr * 100).toFixed(1)}% CAGR</div>
                            </div>
                            
                            ${mostConsistent ? `
                            <div class="summary-card">
                                <div class="summary-label">Most Consistent</div>
                                <div class="summary-value">${mostConsistent.ticker}</div>
                                <div class="summary-sub">Lowest volatility • Steady growth</div>
                            </div>
                            ` : ''}
                        </div>
                    `;
                    
                    document.getElementById('stock-summary').innerHTML = summaryHTML;
                }

                return {
                    init: function() {
                        setupYearSelector();
                        render();
                    },
                    render,
                    refreshData: async function() {
                        const startYear = parseInt(document.getElementById('start-year-select').value);
                        
                        // Clear cache
                        _stocks.forEach(symbol => {
                            const cacheKey = `stockData_${symbol}_${startYear}`;
                            localStorage.removeItem(cacheKey);
                        });
                        
                        await render();
                    },
                    showApiDialog: function() {
                        const currentKey = _loadFromStorage('alphaVantageApiKey') || '';
                        const newKey = prompt(
                            'Enter your Alpha Vantage API Key:\n\n' +
                            'Get a free API key at: https://www.alphavantage.co/support/#api-key\n' +
                            '(Free tier: 5 requests/minute, 500/day)\n\n' +
                            'Leave empty to use demo mode (limited functionality):',
                            currentKey
                        );
                        
                        if (newKey !== null) {
                            if (newKey.trim() === '') {
                                localStorage.removeItem('alphaVantageApiKey');
                                alert('API key removed. Using demo mode.');
                            } else {
                                _saveToStorage('alphaVantageApiKey', newKey.trim());
                                alert('API key saved! Click refresh to fetch real data.');
                            }
                        }
                    }
                };
            })();

            // Navigation Module
            const Navigation = (function() {
                function switchTab(tab) {
                    _activeTab = tab;
                    
                    // Update navigation
                    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
                    document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
                    
                    // Update content
                    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
                    document.getElementById(tab).classList.add('active');
                }

                function setupListeners() {
                    // Main navigation
                    document.querySelectorAll('.nav-btn').forEach(btn => {
                        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
                    });

                    // Calculator navigation
                    document.querySelectorAll('.calc-tab').forEach(btn => {
                        btn.addEventListener('click', () => Calculator.switchCalculator(btn.dataset.calc));
                    });

                    // Portfolio actions
                    document.getElementById('add-portfolio').addEventListener('click', () => {
                        const name = prompt("Enter portfolio name:");
                        if (name && name.trim()) {
                            PortfolioManager.add(name.trim());
                        }
                    });

                    // Pension actions
                    document.getElementById('add-pension').addEventListener('click', () => {
                        const name = prompt("Enter pension name:");
                        const currentValue = parseFloat(prompt("Enter current value:"));
                        const monthlyContribution = parseFloat(prompt("Enter your monthly contribution:"));
                        const employerMatch = parseFloat(prompt("Enter employer match (or 0):")) || 0;
                        
                        if (name && name.trim() && currentValue >= 0 && monthlyContribution >= 0) {
                            PensionManager.add({
                                name: name.trim(),
                                currentValue,
                                monthlyContribution,
                                employerMatch
                            });
                        }
                    });

                    // Stock actions
                    document.getElementById('refresh-stocks').addEventListener('click', () => {
                        StockManager.refreshData();
                    });

                    document.getElementById('api-key-btn').addEventListener('click', () => {
                        StockManager.showApiDialog();
                    });
                }

                return {
                    init: setupListeners
                };
            })();

            // Public API
            return {
                init: function() {
                    // Load saved data
                    const savedPortfolios = _loadFromStorage('portfolios');
                    if (savedPortfolios) _portfolios = savedPortfolios;
                    
                    const savedPensions = _loadFromStorage('pensions');
                    if (savedPensions) _pensions = savedPensions;

                    // Initialize modules
                    Navigation.init();
                    Calculator.init();
                    PortfolioManager.render();
                    PensionManager.render();
                    StockManager.init();

                    // Start price updates
                    setInterval(() => {
                        PortfolioManager.updatePrices();
                    }, 5000);
                },
                
                // Public methods for external access
                addHolding: function(portfolioId) {
                    const symbol = prompt("Enter stock symbol:")?.toUpperCase().trim();
                    const shares = parseFloat(prompt("Enter number of shares:"));
                    const avgPrice = parseFloat(prompt("Enter average price per share:"));
                    
                    if (symbol && shares > 0 && avgPrice > 0) {
                        PortfolioManager.addHolding(portfolioId, symbol, shares, avgPrice);
                    }
                }
            };
        })();

        // Initialize the application when DOM is ready
        document.addEventListener('DOMContentLoaded', function() {
            FinanceDashboard.init();
        });