const FmpService = (() => {
    const STORAGE_KEY = 'pf_api_key_fmp';
    const CACHE_PREFIX = 'pf_eod_cache_';
    const storage = StorageUtils.getStorage();

    function getApiKey() {
        return storage.getItem(STORAGE_KEY) || '';
    }

    function setApiKey(key) {
        storage.setItem(STORAGE_KEY, key);
    }

    function getToday() {
        return new Date().toISOString().slice(0, 10);
    }

    function getCacheKey(symbol) {
        return CACHE_PREFIX + symbol.toUpperCase();
    }

    function readCache(symbol) {
        try {
            const raw = storage.getItem(getCacheKey(symbol));
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            return null;
        }
    }

    function writeCache(symbol, from, to, data) {
        try {
            storage.setItem(getCacheKey(symbol), JSON.stringify({
                from,
                to,
                cachedAt: getToday(),
                data
            }));
        } catch (e) {
            // Storage full or unavailable — silently ignore
        }
    }

    function mergeIntoCache(symbol, newData) {
        const existing = readCache(symbol);
        const allRecords = existing ? [...existing.data, ...newData] : [...newData];
        // Deduplicate by date, keeping the most recent fetch's record
        const byDate = {};
        allRecords.forEach(d => { byDate[d.date] = d; });
        const sorted = Object.values(byDate).sort((a, b) => (a.date < b.date ? -1 : 1));
        if (sorted.length === 0) return;
        writeCache(symbol, sorted[0].date, sorted[sorted.length - 1].date, sorted);
    }

    async function fetchHistoricalEOD(symbol, from, to) {
        const apiKey = getApiKey();
        if (!apiKey) throw new Error('FMP API key not set');

        const today = getToday();
        const cache = readCache(symbol);

        // Use cache if:
        //   - it covers the requested `from` date, AND
        //   - either it was fetched today (market data won't exceed the last trading day)
        //     or it fully covers the requested range
        if (cache && cache.from <= from) {
            if (cache.cachedAt === today || cache.to >= to) {
                return cache.data.filter(d => d.date >= from && d.date <= to);
            }
        }

        // Fetch from API; fall back to cache on network failure
        const url = `https://financialmodelingprep.com/stable/historical-price-eod/full?symbol=${encodeURIComponent(symbol)}&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&apikey=${encodeURIComponent(apiKey)}`;
        let data;
        try {
            const resp = await fetch(url);
            if (!resp.ok) throw new Error(`FMP API error: ${resp.status}`);
            data = await resp.json();
        } catch (err) {
            // Network unavailable — serve from cache if we have anything covering `from`
            if (cache && cache.from <= from) {
                return cache.data.filter(d => d.date >= from && d.date <= to);
            }
            throw err;
        }

        // Persist to cache (merge with any existing data)
        if (Array.isArray(data) && data.length > 0) {
            mergeIntoCache(symbol, data);
        }

        return data;
    }

    return { getApiKey, setApiKey, fetchHistoricalEOD };
})();
