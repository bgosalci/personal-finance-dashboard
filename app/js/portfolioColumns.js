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

    function getDefaultLabels() {
        const labels = {};
        Object.keys(DEFAULT_LABELS).forEach(key => {
            labels[key] = (typeof I18n !== 'undefined' ? I18n.t('portfolio.table.' + key) : null) || DEFAULT_LABELS[key];
        });
        return labels;
    }

    function loadStored() {
        try {
            const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
            if (data && typeof data === 'object') {
                return data;
            }
        } catch (e) {}
        return {};
    }

    function load() {
        const defaults = getDefaultLabels();
        const stored = loadStored();
        const filtered = {};
        Object.keys(stored).forEach(key => {
            if (stored[key] !== defaults[key]) {
                filtered[key] = stored[key];
            }
        });
        return { ...defaults, ...filtered };
    }

    function save(labels) {
        try {
            if (Object.keys(labels).length) {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(labels));
            } else {
                localStorage.removeItem(STORAGE_KEY);
            }
        } catch (e) {}
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
        const defaults = getDefaultLabels();
        const stored = loadStored();
        const updated = { ...stored };
        Object.keys(newLabels).forEach(key => {
            const val = newLabels[key];
            if (val && val !== defaults[key]) {
                updated[key] = val;
            } else {
                delete updated[key];
            }
        });
        save(updated);
        apply({ ...defaults, ...updated });
    }

    return { init, getLabels, setLabels, DEFAULT_LABELS, apply, getDefaultLabels };
})();
