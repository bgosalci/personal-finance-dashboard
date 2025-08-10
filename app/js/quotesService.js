const QuotesService = (function() {
    const LS_KEY = 'pf_api_key_finnhub';
    const BASE_URL = 'https://finnhub.io/api/v1';
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
        const url = BASE_URL + '/quote?symbol=' + encodeURIComponent(ticker) + (token ? '&token=' + encodeURIComponent(token) : '');
        const data = await fetchJson(url);
        const price = typeof data?.c === 'number' ? parseFloat(data.c) : null;
        return { price, raw: data };
    }
    async function searchSymbol(query) {
        const token = getApiKey();
        const url = BASE_URL + '/search?q=' + encodeURIComponent(query) + (token ? '&token=' + encodeURIComponent(token) : '');
        return fetchJson(url);
    }
    return { getApiKey, setApiKey, fetchQuote, searchSymbol };
})();
