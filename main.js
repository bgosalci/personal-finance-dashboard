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