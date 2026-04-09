const QuotesService = (function() {
    const LS_KEY = 'pf_api_key_finnhub';
    const BASE_URL = 'https://finnhub.io/api/v1';
    const EXCEPTION_KEY = 'finnhub_exceptions';
    const LOCAL_QUOTE_URL = '/api/quote';
    const FMP_EXCEPTION_KEY = 'fmp_exceptions';
    const YFINANCE_EXCEPTION_KEY = 'yfinance_exceptions';
    const CACHE_TTL_MS = 60 * 1000; // 1 minute
    const quoteCache = {};

    // Tickers routed to the local yfinance backend instead of Finnhub.
    // Keys are user-facing ticker symbols; values are the yfinance symbols to fetch with.
    const YFINANCE_SYMBOL_MAP = {
        'BITCOIN': 'BTC-USD',
        'XAU':     'GC=F',
        'VUSA':    'VUSA.L',
        'VUSA.L':  'VUSA.L',
        'XLKQ':    'XLKQ.L',
        'XLKQ.L':  'XLKQ.L',
    };
    const storage = StorageUtils.getStorage();
    function getToday() {
        return new Date().toISOString().split('T')[0];
    }
    function loadExceptions() {
        try {
            const data = storage.getItem(EXCEPTION_KEY);
            if (data) return JSON.parse(data);
        } catch (e) {}
        return { date: '', tickers: [] };
    }
    function saveExceptions(obj) {
        try { storage.setItem(EXCEPTION_KEY, JSON.stringify(obj)); } catch (e) {}
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
    function loadYFinanceExceptions() {
        try {
            const data = storage.getItem(YFINANCE_EXCEPTION_KEY);
            if (data) return JSON.parse(data);
        } catch (e) {}
        return { date: '', tickers: [] };
    }
    function saveYFinanceExceptions(obj) {
        try { storage.setItem(YFINANCE_EXCEPTION_KEY, JSON.stringify(obj)); } catch (e) {}
    }
    function isYFinanceExcluded(ticker) {
        const list = loadYFinanceExceptions();
        return list.date === getToday() && list.tickers.includes(String(ticker || '').toUpperCase());
    }
    function addYFinanceException(ticker) {
        const today = getToday();
        const list = loadYFinanceExceptions();
        if (list.date !== today) {
            list.date = today;
            list.tickers = [];
        }
        const t = String(ticker || '').toUpperCase();
        if (t && !list.tickers.includes(t)) {
            list.tickers.push(t);
            saveYFinanceExceptions(list);
        }
    }
    function loadFmpExceptions() {
        try {
            const data = storage.getItem(FMP_EXCEPTION_KEY);
            if (data) return JSON.parse(data);
        } catch (e) {}
        return { date: '', tickers: [] };
    }
    function saveFmpExceptions(obj) {
        try { storage.setItem(FMP_EXCEPTION_KEY, JSON.stringify(obj)); } catch (e) {}
    }
    function isFmpExcluded(ticker) {
        const list = loadFmpExceptions();
        return list.date === getToday() && list.tickers.includes(String(ticker || '').toUpperCase());
    }
    function addFmpException(ticker) {
        const today = getToday();
        const list = loadFmpExceptions();
        if (list.date !== today) {
            list.date = today;
            list.tickers = [];
        }
        const t = String(ticker || '').toUpperCase();
        if (t && !list.tickers.includes(t)) {
            list.tickers.push(t);
            saveFmpExceptions(list);
        }
    }
    async function fetchFmpQuote(ticker) {
        const t = String(ticker).toUpperCase();
        const now = Date.now();
        if (isFmpExcluded(ticker)) {
            return { price: null, raw: null };
        }
        const url = LOCAL_QUOTE_URL + '?ticker=' + encodeURIComponent(ticker);
        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error('HTTP ' + res.status);
            const raw = await res.json();
            if (!raw || typeof raw.c !== 'number' || raw.c === 0 || raw.error) {
                addFmpException(ticker);
                return { price: null, raw: null };
            }
            quoteCache[t] = { price: raw.c, raw, time: now };
            return { price: raw.c, raw };
        } catch (err) {
            addFmpException(ticker);
            return { price: null, raw: null };
        }
    }






    async function fetchYFinanceQuote(ticker, ySymbol) {
        const cached = quoteCache[ticker];
        if (cached && (Date.now() - cached.time) < CACHE_TTL_MS) {
            return { price: cached.price, raw: cached.raw, excluded: false };
        }
        if (isYFinanceExcluded(ticker)) {
            // yfinance circuit-broken for today — try FMP as a fallback before giving up
            const fallback = await fetchFmpQuote(ticker);
            if (fallback.price !== null) return { price: fallback.price, raw: fallback.raw, excluded: false };
            return { price: null, raw: null, allZero: true };
        }
        try {
            const res = await fetch('/api/price?tickers=' + encodeURIComponent(ySymbol));
            if (!res.ok) {
                if (res.status === 429 || res.status === 503) addYFinanceException(ticker);
                // Not an API-key failure — treat like a closed-market response so callers don't toast
                return { price: null, raw: null, allZero: true };
            }
            const data = await res.json();
            const quote = (data.prices || {})[ySymbol] ?? null;
            const price = (quote !== null && typeof quote === 'object') ? quote.c ?? null : null;
            if (price === null && data.errors && data.errors[ySymbol]) {
                addYFinanceException(ticker);
            }
            if (price !== null) {
                quoteCache[ticker] = { price, raw: quote, time: Date.now() };
                return { price, raw: quote, excluded: false };
            }
            // Null price with no explicit error — market likely closed, suppress toast
            return { price: null, raw: null, allZero: true };
        } catch {
            // Network/parse error — suppress toast, let the circuit-breaker handle retries
            return { price: null, raw: null, allZero: true };
        }
    }

    function getApiKey() {
        try { return storage.getItem(LS_KEY) || ''; } catch (e) { return ''; }
    }
    function setApiKey(key) {
        try { storage.setItem(LS_KEY, key || ''); } catch (e) {}
    }
    async function fetchJson(url) {
        const res = await fetch(url);
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
    }
    async function fetchQuote(ticker) {
        if (!ticker) throw new Error('Ticker required');
        const t = String(ticker).toUpperCase();
        const ySymbol = YFINANCE_SYMBOL_MAP[t];
        if (ySymbol) return fetchYFinanceQuote(t, ySymbol);
        const token = getApiKey();
        const now = Date.now();
        const cached = quoteCache[t];
        if (cached && (now - cached.time) < CACHE_TTL_MS) {
            return { price: cached.price, raw: cached.raw };
        }
        if (isTickerExcluded(ticker)) {
            return fetchFmpQuote(ticker);
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
            if (allZero) {
                addTickerException(ticker);
                const fallback = await fetchFmpQuote(ticker);
                // If FMP also has no data, preserve allZero:true so callers
                // don't count this as an API key failure (market may be closed)
                if (fallback.price !== null) return fallback;
                return { price: null, raw: null, allZero: true };
            }
            return { price, raw: data };
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
