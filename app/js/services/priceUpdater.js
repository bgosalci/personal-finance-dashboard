const PriceUpdater = (function() {
    let timer = null;

    function checkAndUpdate() {
        if (MarketStatus.isMarketOpen && MarketStatus.isMarketOpen()) {
            PortfolioManager.fetchLastPrices();
            WatchlistManager.fetchLastPrices();
            StockTracker.fetchLatestPrices();
        }
    }

    function start() {
        checkAndUpdate();
        timer = setInterval(checkAndUpdate, 60000); // every minute
    }

    function stop() {
        if (timer) {
            clearInterval(timer);
            timer = null;
        }
    }

    function init() {
        start();
    }

    return { init, stop };
})();

if (typeof module !== 'undefined') module.exports = PriceUpdater;
