const PriceStorage = (function() {
    const PRICE_STORAGE_KEY = 'latestPrices';
    const handlers = new Set();

    function save(ticker, price) {
        if (!ticker) return;
        let map = {};
        try {
            map = JSON.parse(localStorage.getItem(PRICE_STORAGE_KEY)) || {};
        } catch (e) {}
        const entry = { price, time: Date.now() };
        map[ticker] = entry;
        try {
            localStorage.setItem(PRICE_STORAGE_KEY, JSON.stringify(map));
        } catch (e) {}
        handlers.forEach(fn => {
            try { fn(ticker, entry); } catch (e) {}
        });
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

    function onChange(fn) {
        if (typeof fn === 'function') handlers.add(fn);
    }

    function offChange(fn) {
        handlers.delete(fn);
    }

    return { save, get, getAll, onChange, offChange };
})();
