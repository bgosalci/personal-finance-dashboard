const I18n = (function() {
    'use strict';
    const LOCALE_KEY = 'pf_locale';
    const RTL_KEY = 'pf_rtl';
    const isFileProtocol = typeof location !== 'undefined' && location.protocol === 'file:';
    let currentLocale = 'en';
    let translations = {};
    let availableLocales = [];
    let allTranslations = {};
    const LOCALES_KEY = 'pf_locales';

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

    async function loadLocales() {
        if (Object.keys(allTranslations).length) return;
        const cached = localStorage.getItem(LOCALES_KEY);
        if (cached) {
            allTranslations = JSON.parse(cached);
            availableLocales = Object.keys(allTranslations);
            return;
        }
        if (typeof fetch === 'function' && !isFileProtocol) {
            try {
                const resp = await fetch('locales/locale.json');
                if (!resp.ok) throw new Error('Failed to fetch');
                const data = await resp.json();
                allTranslations = data.locales || {};
                availableLocales = Object.keys(allTranslations);
                localStorage.setItem(LOCALES_KEY, JSON.stringify(allTranslations));
                return;
            } catch (e) {
                console.warn('Failed to load locales', e);
            }
        }
        allTranslations = { en: DEFAULT_TRANSLATIONS };
        availableLocales = ['en'];
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
        const en = allTranslations.en || DEFAULT_TRANSLATIONS;
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
        await loadLocales();
        if (locale === 'pseudo') {
            const base = allTranslations.en || DEFAULT_TRANSLATIONS;
            translations = pseudolocalizeObject(base);
            currentLocale = 'pseudo';
        } else {
            translations = allTranslations[locale] || DEFAULT_TRANSLATIONS;
            currentLocale = allTranslations[locale] ? locale : 'en';
        }
        localStorage.setItem(LOCALE_KEY, currentLocale);
        apply();
    }

    async function init() {
        const locale = getLocale();
        await setLocale(locale);
        if (!availableLocales.includes('pseudo')) {
            availableLocales.push('pseudo');
        }
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
                allTranslations[obj.locale] = obj.translations;
                localStorage.setItem(LOCALES_KEY, JSON.stringify(allTranslations));
                availableLocales = Object.keys(allTranslations);
                if (!availableLocales.includes('pseudo')) {
                    availableLocales.push('pseudo');
                }
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
