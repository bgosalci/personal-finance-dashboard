const QuotesService = (function() {
    const LS_KEY = 'pf_api_key_finnhub';
    const BASE_URL = 'https://finnhub.io/api/v1';
    const EXCEPTION_KEY = 'finnhub_exceptions';
    const CACHE_TTL_MS = 60 * 1000; // 1 minute
    const quoteCache = {};
    function getToday() {
        return new Date().toISOString().split('T')[0];
    }
    function loadExceptions() {
        try {
            const data = localStorage.getItem(EXCEPTION_KEY);
            if (data) return JSON.parse(data);
        } catch (e) {}
        return { date: '', tickers: [] };
    }
    function saveExceptions(obj) {
        try { localStorage.setItem(EXCEPTION_KEY, JSON.stringify(obj)); } catch (e) {}
    }
    function isTickerExcluded(ticker) {
        const list = loadExceptions();
        return list.date === getToday() && list.tickers.includes(String(ticker || '').toUpperCase());
    }
    function addTickerException(ticker) {
        const today = getToday();
        const list = loadExceptions();
        if (list.date !== today) {
            list.date = today;
            list.tickers = [];
        }
        const t = String(ticker || '').toUpperCase();
        if (t && !list.tickers.includes(t)) {
            list.tickers.push(t);
            saveExceptions(list);
        }
    }






    function getApiKey() {
        try { return localStorage.getItem(LS_KEY) || ''; } catch (e) { return ''; }
    }
    function setApiKey(key) {
        try { localStorage.setItem(LS_KEY, key || ''); } catch (e) {}
    }
    async function fetchJson(url) {
        const res = await fetch(url);
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
    }
    async function fetchQuote(ticker) {
        const token = getApiKey();
        if (!ticker) throw new Error('Ticker required');
        const t = String(ticker).toUpperCase();
        const now = Date.now();
        const cached = quoteCache[t];
        if (cached && (now - cached.time) < CACHE_TTL_MS) {
            return { price: cached.price, raw: cached.raw };
        }
        if (isTickerExcluded(ticker)) {
            return { price: null, raw: null, excluded: true };
        }
        const url = BASE_URL + '/quote?symbol=' + encodeURIComponent(ticker) + (token ? '&token=' + encodeURIComponent(token) : '');
        try {
            const data = await fetchJson(url);
            const allZero = data && ['c', 'h', 'l', 'o', 'pc', 't', 'd', 'dp']
                .every(k => typeof data[k] === 'number' && data[k] === 0);
            const price = (!allZero && typeof data?.c === 'number') ? parseFloat(data.c) : null;
            if (price === null && !allZero && data && data.error && String(data.error).toLowerCase().includes('access')) {
                addTickerException(ticker);
            }
            if (price !== null) {
                quoteCache[t] = { price, raw: data, time: now };
            }
            return { price, raw: allZero ? null : data };
        } catch (err) {
            const msg = String((err && err.message) || '');
            if (/\bHTTP (401|403|429)\b/.test(msg)) {
                addTickerException(ticker);
            }
            return { price: null, raw: null };
        }
    }
    async function searchSymbol(query) {
        const token = getApiKey();
        const url = BASE_URL + '/search?q=' + encodeURIComponent(query) + (token ? '&token=' + encodeURIComponent(token) : '');
        return fetchJson(url);
    }
    return { getApiKey, setApiKey, fetchQuote, searchSymbol };
})();
