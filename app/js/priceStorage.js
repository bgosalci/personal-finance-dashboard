const PriceStorage = (function() {
    const PRICE_STORAGE_KEY = 'latestPrices';

    function save(ticker, price) {
        if (!ticker) return;
        let map = {};
        try {
            map = JSON.parse(localStorage.getItem(PRICE_STORAGE_KEY)) || {};
        } catch (e) {}
        map[ticker] = { price, time: Date.now() };
        try {
            localStorage.setItem(PRICE_STORAGE_KEY, JSON.stringify(map));
        } catch (e) {}
    }

    function get(ticker) {
        if (!ticker) return null;
        return getAll()[ticker] || null;
    }

    function getAll() {
        try {
            return JSON.parse(localStorage.getItem(PRICE_STORAGE_KEY)) || {};
        } catch (e) {
            return {};
        }
    }

    return { save, get, getAll };
})();
