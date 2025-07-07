import { saveToStorage, loadFromStorage } from './storage.js';

let portfolios = loadFromStorage('portfolios') || [
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

function generateId() {
    return Date.now() + Math.random().toString(36).substr(2, 9);
}

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

export function renderPortfolios() {
    const container = document.getElementById('portfolios-container');
    if (portfolios.length === 0) {
        container.innerHTML = '<div class="empty-state">No portfolios yet. Add your first portfolio to get started!</div>';
        return;
    }
    container.innerHTML = portfolios.map(portfolio => {
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
                <button class="btn btn-primary" data-portfolio-id="${portfolio.id}" style="margin-top: 15px;">
                    ➕ Add Holding
                </button>
            </div>
        `;
    }).join('');
}

export function addPortfolio(name) {
    const newPortfolio = {
        id: generateId(),
        name: name,
        holdings: []
    };
    portfolios.push(newPortfolio);
    saveToStorage('portfolios', portfolios);
    renderPortfolios();
}

export function addHolding(portfolioId, symbol, shares, avgPrice) {
    const portfolio = portfolios.find(p => p.id == portfolioId);
    if (portfolio) {
        portfolio.holdings.push({
            symbol: symbol.toUpperCase(),
            shares: shares,
            avgPrice: avgPrice,
            currentPrice: avgPrice
        });
        saveToStorage('portfolios', portfolios);
        renderPortfolios();
    }
}

export function updatePrices() {
    portfolios.forEach(portfolio => {
        portfolio.holdings.forEach(holding => {
            holding.currentPrice = Math.max(1, holding.currentPrice + (Math.random() - 0.5) * 2);
        });
    });
    renderPortfolios();
}