const PortfolioColumns = (function() {
    'use strict';
    const STORAGE_KEY = 'pf_portfolio_columns';
    const DEFAULT_LABELS = {
        ticker: 'Ticker',
        currency: 'Currency',
        name: 'Name',
        purchasePrice: 'Purchase Price',
        principal: 'Principal',
        quantity: 'Quantity',
        lastPrice: 'Last Price',
        value: 'Value',
        pl: 'P&L',
        plPct: 'P&L %',
        actions: 'Actions'
    };

    function load() {
        try {
            const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
            if (data && typeof data === 'object') {
                const labels = { ...DEFAULT_LABELS, ...data };
                // save merged labels to ensure migration of new keys
                save(labels);
                return labels;
            }
        } catch (e) {}
        return { ...DEFAULT_LABELS };
    }

    function save(labels) {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(labels)); } catch (e) {}
    }

    function apply(labels) {
        const lbls = labels || load();
        const map = {
            ticker: 'col-ticker',
            currency: 'col-currency',
            name: 'col-name',
            purchasePrice: 'col-purchasePrice',
            principal: 'col-principal',
            quantity: 'col-quantity',
            lastPrice: 'col-lastPrice',
            value: 'col-value',
            pl: 'col-pl',
            plPct: 'col-plPct',
            actions: 'col-actions'
        };
        Object.keys(map).forEach(key => {
            const el = document.getElementById(map[key]);
            if (el) el.textContent = lbls[key];
        });
    }

    function init() {
        apply();
    }

    function getLabels() {
        return load();
    }

    function setLabels(newLabels) {
        const labels = { ...load(), ...newLabels };
        save(labels);
        apply(labels);
    }

    return { init, getLabels, setLabels, DEFAULT_LABELS };
})();
