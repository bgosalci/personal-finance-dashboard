import { renderPortfolios, addPortfolio, addHolding, updatePrices } from './portfolio.js';
import { renderPensions, addPension } from './pension.js';
import { initCalculator, switchCalculator } from './calculator.js';

// Add event listeners and initialize modules
document.addEventListener('DOMContentLoaded', function() {
    // Navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
            document.getElementById(btn.dataset.tab).classList.add('active');
        });
    });

    // Calculator navigation
    document.querySelectorAll('.calc-tab').forEach(btn => {
        btn.addEventListener('click', () => switchCalculator(btn.dataset.calc));
    });

    // Portfolio actions
    document.getElementById('add-portfolio').addEventListener('click', () => {
        const name = prompt("Enter portfolio name:");
        if (name && name.trim()) {
            addPortfolio(name.trim());
        }
    });

    document.getElementById('portfolios-container').addEventListener('click', e => {
        if (e.target.closest('.btn.btn-primary[data-portfolio-id]')) {
            const portfolioId = e.target.closest('.btn').dataset.portfolioId;
            const symbol = prompt("Enter stock symbol:")?.toUpperCase().trim();
            const shares = parseFloat(prompt("Enter number of shares:"));
            const avgPrice = parseFloat(prompt("Enter average price per share:"));
            if (symbol && shares > 0 && avgPrice > 0) {
                addHolding(portfolioId, symbol, shares, avgPrice);
            }
        }
    });

    // Pension actions
    document.getElementById('add-pension').addEventListener('click', () => {
        const name = prompt("Enter pension name:");
        const currentValue = parseFloat(prompt("Enter current value:"));
        const monthlyContribution = parseFloat(prompt("Enter your monthly contribution:"));
        const employerMatch = parseFloat(prompt("Enter employer match (or 0):")) || 0;
        if (name && name.trim() && currentValue >= 0 && monthlyContribution >= 0) {
            addPension({
                name: name.trim(),
                currentValue,
                monthlyContribution,
                employerMatch
            });
        }
    });

    // Initialize modules
    initCalculator();
    renderPortfolios();
    renderPensions();

    // Start price updates
    setInterval(updatePrices, 5000);
});