const I18n = (function() {
    'use strict';
    const LOCALE_KEY = 'pf_locale';
    const RTL_KEY = 'pf_rtl';
    const isFileProtocol = typeof location !== 'undefined' && location.protocol === 'file:';
    let currentLocale = 'en';
    let translations = {};
    const availableLocales = ['en', 'es', 'fr', 'de', 'sq', 'pseudo'];

    const DEFAULT_TRANSLATIONS = {
        "header": {
            "title": "Financial Dashboard",
            "tagline": "Personal Investment Tracking & Financial Planning Tool"
        },
        "market": {
            "pre": "Pre Market",
            "status": "Market Status",
            "after": "After Market"
        },
        "nav": {
            "portfolio": "Portfolio",
            "pension": "Pension",
            "calculators": "Calculators",
            "stockTracker": "Stock Performance Tracker",
            "stockFinance": "Stock Finance Performance",
            "settings": "Settings"
        },
        "portfolio": {
            "actions": {
                "addInvestment": "Add Investment",
                "getLastPrice": "Get The Last Price",
                "transactionHistory": "Transaction History",
                "addPortfolio": "Add Portfolio",
                "removePortfolio": "Remove Portfolio",
                "showInSummary": "Show in Summary"
            },
            "table": {
                "ticker": "Ticker",
                "currency": "Currency",
                "name": "Name",
                "purchasePrice": "Purchase Price",
                "principal": "Principal",
                "quantity": "Quantity",
                "lastPrice": "Last Price",
                "value": "Value",
                "pl": "P&L",
                "plPct": "P&L %",
                "actions": "Actions"
            },
            "total": "Total",
            "charts": {
                "investmentSpread": "Investment Spread",
                "plpct": "P&L%",
                "stats": "Portfolio Stats",
                "cagr": "CAGR",
                "bestTicker": "Best Ticker",
                "tickerCAGR": "Ticker CAGR",
                "years": "Years"
            }
        },
        "settings": {
            "title": "Settings",
            "baseCurrency": "Base Currency",
            "baseCurrencyHint": "Exchange rates refresh once a day to keep totals accurate.",
            "sectionTitles": {
                "language": "Language",
                "pension": "Pension",
                "portfolio": "Portfolio",
                "stockTracker": "Stock Performance Tracker",
                "about": "About"
            },
            "exportPensions": "Export Pensions",
            "importPensions": "Import Pensions",
            "deletePensions": "Delete Pensions",
            "exportPortfolio": "Export Portfolio",
            "importPortfolio": "Import Portfolio",
            "editColumnLabels": "Edit Column Labels",
            "deletePortfolio": "Delete Portfolio",
            "exportStock": "Export Stock Data",
            "importStock": "Import Stock Data",
            "deleteStock": "Delete Data",
            "versionLabel": "Web App Version",
            "languageLabel": "Language",
            "exportLang": "Export Language",
            "importLang": "Import Language",
            "rtlToggle": "Enable RTL"
        },
        "common": {
            "format": "Format",
            "file": "File",
            "cancel": "Cancel",
            "import": "Import",
            "export": "Export"
        }
    };

    function getLocale() {
        return localStorage.getItem(LOCALE_KEY) || 'en';
    }

    function getCurrentLocale() {
        return currentLocale;
    }

    async function loadLocale(locale) {
        const storeKey = 'locale-' + locale;
        const cached = localStorage.getItem(storeKey);
        if (cached) {
            translations = JSON.parse(cached);
            currentLocale = locale;
            return;
        }

        if (typeof fetch === 'function' && !isFileProtocol) {
            try {
                const resp = await fetch('locales/' + locale + '.json');
                if (!resp.ok) throw new Error('Failed to fetch');
                translations = await resp.json();
                localStorage.setItem(storeKey, JSON.stringify(translations));
                currentLocale = locale;
                return;
            } catch (e) {
                console.warn('Failed to load locale', locale, e);
            }
        }

        if (locale === 'en') {
            translations = DEFAULT_TRANSLATIONS;
            localStorage.setItem(storeKey, JSON.stringify(translations));
            currentLocale = 'en';
        } else {
            await loadLocale('en');
        }
    }

    function t(key) {
        const parts = key.split('.');
        let obj = translations;
        for (const p of parts) {
            if (obj && Object.prototype.hasOwnProperty.call(obj, p)) {
                obj = obj[p];
            } else {
                obj = null;
                break;
            }
        }
        if (typeof obj === 'string') return obj;
        // fallback to en
        const en = JSON.parse(localStorage.getItem('locale-en') || '{}');
        obj = en;
        for (const p of parts) {
            if (obj && Object.prototype.hasOwnProperty.call(obj, p)) {
                obj = obj[p];
            } else {
                obj = null;
                break;
            }
        }
        return typeof obj === 'string' ? obj : key;
    }

    function apply() {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            el.textContent = t(key);
        });
    }

    function pseudolocalize(str) {
        const map = { a:'ā', e:'ē', i:'ī', o:'ō', u:'ū', A:'Ā', E:'Ē', I:'Ī', O:'Ō', U:'Ū' };
        return str.split('').map(ch => map[ch] || ch).join('');
    }

    function pseudolocalizeObject(obj) {
        const res = {};
        Object.keys(obj).forEach(k => {
            if (typeof obj[k] === 'string') {
                res[k] = '[' + pseudolocalize(obj[k]) + ']';
            } else if (typeof obj[k] === 'object') {
                res[k] = pseudolocalizeObject(obj[k]);
            }
        });
        return res;
    }

    async function setLocale(locale) {
        if (locale === 'pseudo') {
            const enStore = localStorage.getItem('locale-en');
            let base = enStore ? JSON.parse(enStore) : null;
            if (!base) {
                if (typeof fetch === 'function' && !isFileProtocol) {
                    try {
                        const resp = await fetch('locales/en.json');
                        if (resp.ok) {
                            base = await resp.json();
                        }
                    } catch (e) {
                        console.warn('Failed to fetch base locale for pseudo', e);
                    }
                }
                if (!base) base = DEFAULT_TRANSLATIONS;
                localStorage.setItem('locale-en', JSON.stringify(base));
            }
            translations = pseudolocalizeObject(base);
            currentLocale = 'pseudo';
        } else {
            await loadLocale(locale);
        }
        localStorage.setItem(LOCALE_KEY, locale);
        apply();
    }

    async function init() {
        const locale = getLocale();
        await setLocale(locale);
    }

    function formatNumber(num, options = {}) {
        return new Intl.NumberFormat(currentLocale === 'pseudo' ? 'en' : currentLocale, options).format(num);
    }

    function formatCurrency(num, currency = 'USD') {
        return new Intl.NumberFormat(currentLocale === 'pseudo' ? 'en' : currentLocale, {
            style: 'currency',
            currency
        }).format(num);
    }

    function formatDate(dateStr) {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return new Intl.DateTimeFormat(currentLocale === 'pseudo' ? 'en' : currentLocale, {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric'
        }).format(d);
    }

    function toggleDir(rtl) {
        document.documentElement.dir = rtl ? 'rtl' : 'ltr';
        localStorage.setItem(RTL_KEY, rtl ? 'rtl' : 'ltr');
    }

    function initDir() {
        const dir = localStorage.getItem(RTL_KEY) === 'rtl';
        toggleDir(dir);
        const rtlToggle = document.getElementById('rtl-toggle');
        if (rtlToggle) rtlToggle.checked = dir;
    }

    function exportLocale() {
        return JSON.stringify({ locale: currentLocale, translations }, null, 2);
    }

    function importLocale(data) {
        try {
            const obj = JSON.parse(data);
            if (obj.locale && obj.translations) {
                localStorage.setItem('locale-' + obj.locale, JSON.stringify(obj.translations));
                if (obj.locale === currentLocale) {
                    translations = obj.translations;
                    apply();
                }
            }
        } catch (e) {
            console.error('Invalid locale import', e);
        }
    }

    return {
        init,
        setLocale,
        t,
        apply,
        formatNumber,
        formatCurrency,
        formatDate,
        toggleDir,
        initDir,
        availableLocales,
        exportLocale,
        importLocale,
        getLocale: getLocale,
        getCurrentLocale
    };
})();
