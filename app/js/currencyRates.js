const CurrencyRates = (function() {
    'use strict';
    const API_KEY = 'd1nf8h1r01qovv8iu2dgd1nf8h1r01qovv8iu2e0';
    let rates = { GBP: 1, EUR: 1 };

    async function fetchRates() {
        try {
            const url = `https://finnhub.io/api/v1/forex/rates?base=USD&token=${API_KEY}`;
            const res = await fetch(url);
            const data = await res.json();
            if (data && data.quote) {
                if (data.quote.GBP) rates.GBP = data.quote.GBP;
                if (data.quote.EUR) rates.EUR = data.quote.EUR;
            }
        } catch (e) {
            // ignore errors; keep existing rates
        }
    }

    function convertToUSD(amount, currency = 'USD') {
        if (currency === 'USD') return amount;
        const rate = rates[currency];
        if (!rate) return amount;
        return amount / rate;
    }

    async function init() {
        await fetchRates();
    }

    return { init, convertToUSD };
})();
