const PriceUpdater = (function() {
    let timer = null;

    function fetchAll() {
        PortfolioManager.fetchLastPrices();
        WatchlistManager.fetchLastPrices();
        StockTracker.fetchLatestPrices();
    }

    function checkAndUpdate() {
        if (MarketStatus.isMarketOpen && MarketStatus.isMarketOpen()) {
            fetchAll();
        }
    }

    function start() {
        fetchAll(); // always fetch on page load regardless of market status
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
