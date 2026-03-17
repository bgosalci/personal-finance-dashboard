const ForexData = (function() {
    'use strict';
    const LS_API_KEY = 'pf_api_key_exchangerate';
    const STORAGE_KEY = 'pf_forex_data';
    let data = null;
    let timerId = null;

    function getApiKey() {
        try { return localStorage.getItem(LS_API_KEY) || ''; } catch (e) { return ''; }
    }
    function setApiKey(key) {
        try { localStorage.setItem(LS_API_KEY, key || ''); } catch (e) {}
    }

    function load() {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                if (parsed && parsed.time_next_update_utc) {
                    data = parsed;
                }
            } catch(e) {
                data = null;
            }
        }
    }

    function save() {
        if (data) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        }
    }

    async function fetchRates() {
        const apiKey = getApiKey();
        if (!apiKey) return; // silently skip if no key configured
        try {
            const url = `https://v6.exchangerate-api.com/v6/${encodeURIComponent(apiKey)}/latest/USD`;
            const res = await fetch(url);
            const json = await res.json();
            if (json && json.time_next_update_utc) {
                data = json;
                save();
            }
        } catch(e) {
            // ignore fetch errors
        }
    }

    function scheduleNextFetch() {
        if (timerId) {
            clearTimeout(timerId);
        }
        const now = new Date();
        const next = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
        const msUntilNext = next.getTime() - now.getTime();
        timerId = setTimeout(async function() {
            await getRates();
            scheduleNextFetch();
        }, msUntilNext);
    }

    async function getRates() {
        const now = Date.now();
        if (!data || Date.parse(data.time_next_update_utc) <= now) {
            await fetchRates();
        }
        return data;
    }

    function init() {
        load();
        if (!data || Date.parse(data.time_next_update_utc) <= Date.now()) {
            fetchRates();
        }
        scheduleNextFetch();
    }

    return { init, getRates, getApiKey, setApiKey };
})();
