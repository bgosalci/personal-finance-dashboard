import { TabManager } from './tab-manager.js';
import { PortfolioManager } from './portfolio-manager.js';
import { Calculator } from './calculator.js';
import { StockTracker } from './stock-tracker.js';

const FinancialDashboard = (function() {
    'use strict';

    function init() {
        TabManager.init();
        PortfolioManager.init();
        Calculator.init();
        StockTracker.init();
    }

    function removeTicker(ticker) {
        StockTracker.removeTicker(ticker);
    }

    return {
        init,
        removeTicker
    };
})();

document.addEventListener('DOMContentLoaded', function() {
    FinancialDashboard.init();

    const header = document.querySelector('.header');
    const nav = document.querySelector('.nav-tabs');

    function updateNavOffset() {
        if (header && nav) {
            nav.style.top = header.offsetHeight + 'px';
        }
    }

    updateNavOffset();
    window.addEventListener('resize', updateNavOffset);
});

window.FinancialDashboard = FinancialDashboard;
