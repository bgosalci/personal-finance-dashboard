const FinancialDashboard = (function() {
    'use strict';

    function init() {
        TabManager.init();
        Settings.init();
        PortfolioManager.init();
        WatchlistManager.init();
        PensionManager.init();
        Calculator.init();
        StockTracker.init();
        StockFinance.init();
    }

    function removeTicker(ticker) {
        StockTracker.removeTicker(ticker);
    }

    return { init, removeTicker };
})();
