const PriceUpdater = (function() {
    let timer = null;

    function checkAndUpdate() {
        if (MarketStatus.isMarketOpen && MarketStatus.isMarketOpen()) {
            PortfolioManager.fetchLastPrices();
            StockTracker.fetchLatestPrices();
        }
    }

    function start() {
        checkAndUpdate();
        timer = setInterval(checkAndUpdate, 60000); // every minute
    }

    function init() {
        start();
    }

    return { init };
})();
