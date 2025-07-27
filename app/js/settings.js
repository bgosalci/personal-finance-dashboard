const Settings = (function() {
    'use strict';

    const STORAGE_KEY = 'pf_base_currency';

    function load() {
        return localStorage.getItem(STORAGE_KEY) || 'USD';
    }

    function save(value) {
        localStorage.setItem(STORAGE_KEY, value);
    }

    function getBaseCurrency() {
        return load();
    }

    function setBaseCurrency(value) {
        save(value);
    }

    function init() {
        const select = document.getElementById('base-currency-select');
        if (!select) return;
        select.value = load();
        select.addEventListener('change', () => {
            save(select.value);
        });
    }

    return { init, getBaseCurrency, setBaseCurrency };
})();
