const I18n = (function() {
    'use strict';
    const LOCALE_KEY = 'pf_locale';
    const RTL_KEY = 'pf_rtl';
    const isFileProtocol = typeof location !== 'undefined' && location.protocol === 'file:';
    let currentLocale = 'en';
    let translations = {};
    let availableLocales = ['en', 'es', 'fr', 'de', 'it', 'sq'];

    const DEFAULT_TRANSLATIONS = {
        "en": {
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
        },
        "sq": {
            "header": {
                "title": "Pult Financiar",
                "tagline": "Mjet për Ndjekjen e Investimeve Personale & Planifikimin Financiar"
            },
            "market": {
                "pre": "Para Hapjes së Tregut",
                "status": "Statusi i Tregut",
                "after": "Pas Mbylljes së Tregut"
            },
            "nav": {
                "portfolio": "Portofoli",
                "pension": "Pensioni",
                "calculators": "Kalkulatorë",
                "stockTracker": "Ndjekësi i Performancës së Aksioneve",
                "stockFinance": "Performanca Financiare e Aksioneve",
                "settings": "Cilësimet"
            },
            "portfolio": {
                "actions": {
                "addInvestment": "Shto Investim",
                "getLastPrice": "Merr Çmimin e Fundit",
                "transactionHistory": "Historia e Transaksioneve",
                "addPortfolio": "Shto Portofol",
                "removePortfolio": "Hiq Portofol",
                "showInSummary": "Shfaq në Përmbledhje"
                },
                "table": {
                "ticker": "Simboli",
                "currency": "Monedha",
                "name": "Emri",
                "purchasePrice": "Çmimi i Blerjes",
                "principal": "Kapitali",
                "quantity": "Sasia",
                "lastPrice": "Çmimi i Fundit",
                "value": "Vlera",
                "pl": "Fitimi/Humbja",
                "plPct": "Fitimi/Humbja %",
                "actions": "Veprimet"
                },
                "total": "Totali",
                "charts": {
                "investmentSpread": "Shpërndarja e Investimeve",
                "plpct": "Fitimi/Humbja %",
                "stats": "Statistikat e Portofolit",
                "cagr": "CAGR",
                "bestTicker": "Simboli Më i Mirë",
                "tickerCAGR": "CAGR i Simbolit",
                "years": "Vitet"
                }
            },
            "settings": {
                "title": "Cilësimet",
                "baseCurrency": "Monedha Bazë",
                "baseCurrencyHint": "Kursi i këmbimit rifreskohet një herë në ditë për të mbajtur totalet të sakta.",
                "sectionTitles": {
                "language": "Gjuha",
                "pension": "Pensioni",
                "portfolio": "Portofoli",
                "stockTracker": "Ndjekësi i Performancës së Aksioneve",
                "about": "Rreth"
                },
                "exportPensions": "Eksporto Pensionet",
                "importPensions": "Importo Pensionet",
                "deletePensions": "Fshi Pensionet",
                "exportPortfolio": "Eksporto Portofolin",
                "importPortfolio": "Importo Portofolin",
                "editColumnLabels": "Ndrysho Etiketat e Kolonave",
                "deletePortfolio": "Fshi Portofolin",
                "exportStock": "Eksporto të Dhënat e Aksioneve",
                "importStock": "Importo të Dhënat e Aksioneve",
                "deleteStock": "Fshi të Dhënat",
                "versionLabel": "Versioni i Aplikacionit Web",
                "languageLabel": "Gjuha",
                "exportLang": "Eksporto Gjuhën",
                "importLang": "Importo Gjuhën",
                "rtlToggle": "Aktivizo RTL"
            },
            "common": {
                "format": "Formati",
                "file": "Skedari",
                "cancel": "Anulo",
                "import": "Importo",
                "export": "Eksporto"
            }
        },
        "fr": {
            "header": {
                "title": "Tableau de Bord Financier",
                "tagline": "Outil de Suivi des Investissements Personnels et de Planification Financière"
            },
            "market": {
                "pre": "Avant-Marché",
                "status": "Statut du Marché",
                "after": "Après-Marché"
            },
            "nav": {
                "portfolio": "Portefeuille",
                "pension": "Pension",
                "calculators": "Calculatrices",
                "stockTracker": "Suivi de Performance des Actions",
                "stockFinance": "Performance Financière des Actions",
                "settings": "Paramètres"
            },
            "portfolio": {
                "actions": {
                "addInvestment": "Ajouter un Investissement",
                "getLastPrice": "Obtenir le Dernier Prix",
                "transactionHistory": "Historique des Transactions",
                "addPortfolio": "Ajouter un Portefeuille",
                "removePortfolio": "Supprimer le Portefeuille",
                "showInSummary": "Afficher dans le Résumé"
                },
                "table": {
                "ticker": "Symbole",
                "currency": "Devise",
                "name": "Nom",
                "purchasePrice": "Prix d'Achat",
                "principal": "Capital",
                "quantity": "Quantité",
                "lastPrice": "Dernier Prix",
                "value": "Valeur",
                "pl": "P&L",
                "plPct": "P&L %",
                "actions": "Actions"
                },
                "total": "Total",
                "charts": {
                "investmentSpread": "Répartition des Investissements",
                "plpct": "P&L %",
                "stats": "Statistiques du Portefeuille",
                "cagr": "TCAM",
                "bestTicker": "Meilleur Symbole",
                "tickerCAGR": "TCAM par Symbole",
                "years": "Années"
                }
            },
            "settings": {
                "title": "Paramètres",
                "baseCurrency": "Devise de Base",
                "baseCurrencyHint": "Les taux de change sont mis à jour une fois par jour pour maintenir des totaux précis.",
                "sectionTitles": {
                "language": "Langue",
                "pension": "Pension",
                "portfolio": "Portefeuille",
                "stockTracker": "Suivi de Performance des Actions",
                "about": "À propos"
                },
                "exportPensions": "Exporter les Pensions",
                "importPensions": "Importer les Pensions",
                "deletePensions": "Supprimer les Pensions",
                "exportPortfolio": "Exporter le Portefeuille",
                "importPortfolio": "Importer le Portefeuille",
                "editColumnLabels": "Modifier les Étiquettes de Colonnes",
                "deletePortfolio": "Supprimer le Portefeuille",
                "exportStock": "Exporter les Données d'Actions",
                "importStock": "Importer les Données d'Actions",
                "deleteStock": "Supprimer les Données",
                "versionLabel": "Version de l’Application Web",
                "languageLabel": "Langue",
                "exportLang": "Exporter la Langue",
                "importLang": "Importer la Langue",
                "rtlToggle": "Activer RTL"
            },
            "common": {
                "format": "Format",
                "file": "Fichier",
                "cancel": "Annuler",
                "import": "Importer",
                "export": "Exporter"
            }
        },
        "de": {
            "header": {
                "title": "Finanz-Dashboard",
                "tagline": "Tool zur Verfolgung persönlicher Investitionen und Finanzplanung"
            },
            "market": {
                "pre": "Vorbörslich",
                "status": "Marktstatus",
                "after": "Nachbörslich"
            },
            "nav": {
                "portfolio": "Portfolio",
                "pension": "Rente",
                "calculators": "Rechner",
                "stockTracker": "Aktien-Performance-Tracker",
                "stockFinance": "Finanzielle Aktienperformance",
                "settings": "Einstellungen"
            },
            "portfolio": {
                "actions": {
                "addInvestment": "Investition hinzufügen",
                "getLastPrice": "Letzten Preis abrufen",
                "transactionHistory": "Transaktionshistorie",
                "addPortfolio": "Portfolio hinzufügen",
                "removePortfolio": "Portfolio entfernen",
                "showInSummary": "In Zusammenfassung anzeigen"
                },
                "table": {
                "ticker": "Ticker",
                "currency": "Währung",
                "name": "Name",
                "purchasePrice": "Kaufpreis",
                "principal": "Kapital",
                "quantity": "Menge",
                "lastPrice": "Letzter Preis",
                "value": "Wert",
                "pl": "Gewinn/Verlust",
                "plPct": "Gewinn/Verlust %",
                "actions": "Aktionen"
                },
                "total": "Gesamt",
                "charts": {
                "investmentSpread": "Investitionsverteilung",
                "plpct": "Gewinn/Verlust %",
                "stats": "Portfolio-Statistiken",
                "cagr": "CAGR",
                "bestTicker": "Bester Ticker",
                "tickerCAGR": "Ticker-CAGR",
                "years": "Jahre"
                }
            },
            "settings": {
                "title": "Einstellungen",
                "baseCurrency": "Basiswährung",
                "baseCurrencyHint": "Wechselkurse werden einmal täglich aktualisiert, um genaue Summen sicherzustellen.",
                "sectionTitles": {
                "language": "Sprache",
                "pension": "Rente",
                "portfolio": "Portfolio",
                "stockTracker": "Aktien-Performance-Tracker",
                "about": "Über"
                },
                "exportPensions": "Renten exportieren",
                "importPensions": "Renten importieren",
                "deletePensions": "Renten löschen",
                "exportPortfolio": "Portfolio exportieren",
                "importPortfolio": "Portfolio importieren",
                "editColumnLabels": "Spaltenbezeichnungen bearbeiten",
                "deletePortfolio": "Portfolio löschen",
                "exportStock": "Aktien-Daten exportieren",
                "importStock": "Aktien-Daten importieren",
                "deleteStock": "Daten löschen",
                "versionLabel": "Web-App-Version",
                "languageLabel": "Sprache",
                "exportLang": "Sprache exportieren",
                "importLang": "Sprache importieren",
                "rtlToggle": "RTL aktivieren"
            },
            "common": {
                "format": "Format",
                "file": "Datei",
                "cancel": "Abbrechen",
                "import": "Importieren",
                "export": "Exportieren"
            }
        },
        "es": {
            "header": {
                "title": "Panel Financiero",
                "tagline": "Herramienta de Seguimiento de Inversiones Personales y Planificación Financiera"
            },
            "market": {
                "pre": "Preapertura",
                "status": "Estado del Mercado",
                "after": "Postmercado"
            },
            "nav": {
                "portfolio": "Cartera",
                "pension": "Pensión",
                "calculators": "Calculadoras",
                "stockTracker": "Rastreador de Rendimiento de Acciones",
                "stockFinance": "Rendimiento Financiero de Acciones",
                "settings": "Configuración"
            },
            "portfolio": {
                "actions": {
                "addInvestment": "Agregar Inversión",
                "getLastPrice": "Obtener el Último Precio",
                "transactionHistory": "Historial de Transacciones",
                "addPortfolio": "Agregar Cartera",
                "removePortfolio": "Eliminar Cartera",
                "showInSummary": "Mostrar en el Resumen"
                },
                "table": {
                "ticker": "Símbolo",
                "currency": "Moneda",
                "name": "Nombre",
                "purchasePrice": "Precio de Compra",
                "principal": "Capital",
                "quantity": "Cantidad",
                "lastPrice": "Último Precio",
                "value": "Valor",
                "pl": "Ganancia/Pérdida",
                "plPct": "Ganancia/Pérdida %",
                "actions": "Acciones"
                },
                "total": "Total",
                "charts": {
                "investmentSpread": "Distribución de Inversiones",
                "plpct": "Ganancia/Pérdida %",
                "stats": "Estadísticas de la Cartera",
                "cagr": "CAGR",
                "bestTicker": "Mejor Símbolo",
                "tickerCAGR": "CAGR por Símbolo",
                "years": "Años"
                }
            },
            "settings": {
                "title": "Configuración",
                "baseCurrency": "Moneda Base",
                "baseCurrencyHint": "Los tipos de cambio se actualizan una vez al día para mantener totales precisos.",
                "sectionTitles": {
                "language": "Idioma",
                "pension": "Pensión",
                "portfolio": "Cartera",
                "stockTracker": "Rastreador de Rendimiento de Acciones",
                "about": "Acerca de"
                },
                "exportPensions": "Exportar Pensiones",
                "importPensions": "Importar Pensiones",
                "deletePensions": "Eliminar Pensiones",
                "exportPortfolio": "Exportar Cartera",
                "importPortfolio": "Importar Cartera",
                "editColumnLabels": "Editar Etiquetas de Columnas",
                "deletePortfolio": "Eliminar Cartera",
                "exportStock": "Exportar Datos de Acciones",
                "importStock": "Importar Datos de Acciones",
                "deleteStock": "Eliminar Datos",
                "versionLabel": "Versión de la Aplicación Web",
                "languageLabel": "Idioma",
                "exportLang": "Exportar Idioma",
                "importLang": "Importar Idioma",
                "rtlToggle": "Habilitar RTL"
            },
            "common": {
                "format": "Formato",
                "file": "Archivo",
                "cancel": "Cancelar",
                "import": "Importar",
                "export": "Exportar"
            }
        },
        "it": {
            "header": {
                "title": "Cruscotto Finanziario",
                "tagline": "Strumento per il Monitoraggio degli Investimenti Personali e la Pianificazione Finanziaria"
            },
            "market": {
                "pre": "Pre-Mercato",
                "status": "Stato del Mercato",
                "after": "Post-Mercato"
            },
            "nav": {
                "portfolio": "Portafoglio",
                "pension": "Pensione",
                "calculators": "Calcolatrici",
                "stockTracker": "Tracker delle Prestazioni Azionarie",
                "stockFinance": "Prestazioni Finanziarie delle Azioni",
                "settings": "Impostazioni"
            },
            "portfolio": {
                "actions": {
                "addInvestment": "Aggiungi Investimento",
                "getLastPrice": "Ottieni l'Ultimo Prezzo",
                "transactionHistory": "Storico delle Transazioni",
                "addPortfolio": "Aggiungi Portafoglio",
                "removePortfolio": "Rimuovi Portafoglio",
                "showInSummary": "Mostra nel Riepilogo"
                },
                "table": {
                "ticker": "Simbolo",
                "currency": "Valuta",
                "name": "Nome",
                "purchasePrice": "Prezzo di Acquisto",
                "principal": "Capitale",
                "quantity": "Quantità",
                "lastPrice": "Ultimo Prezzo",
                "value": "Valore",
                "pl": "Utile/Perdita",
                "plPct": "Utile/Perdita %",
                "actions": "Azioni"
                },
                "total": "Totale",
                "charts": {
                "investmentSpread": "Distribuzione degli Investimenti",
                "plpct": "Utile/Perdita %",
                "stats": "Statistiche del Portafoglio",
                "cagr": "CAGR",
                "bestTicker": "Miglior Simbolo",
                "tickerCAGR": "CAGR per Simbolo",
                "years": "Anni"
                }
            },
            "settings": {
                "title": "Impostazioni",
                "baseCurrency": "Valuta Base",
                "baseCurrencyHint": "I tassi di cambio si aggiornano una volta al giorno per mantenere totali accurati.",
                "sectionTitles": {
                "language": "Lingua",
                "pension": "Pensione",
                "portfolio": "Portafoglio",
                "stockTracker": "Tracker delle Prestazioni Azionarie",
                "about": "Informazioni"
                },
                "exportPensions": "Esporta Pensioni",
                "importPensions": "Importa Pensioni",
                "deletePensions": "Elimina Pensioni",
                "exportPortfolio": "Esporta Portafoglio",
                "importPortfolio": "Importa Portafoglio",
                "editColumnLabels": "Modifica Etichette delle Colonne",
                "deletePortfolio": "Elimina Portafoglio",
                "exportStock": "Esporta Dati Azionari",
                "importStock": "Importa Dati Azionari",
                "deleteStock": "Elimina Dati",
                "versionLabel": "Versione Web App",
                "languageLabel": "Lingua",
                "exportLang": "Esporta Lingua",
                "importLang": "Importa Lingua",
                "rtlToggle": "Abilita RTL"
            },
            "common": {
                "format": "Formato",
                "file": "File",
                "cancel": "Annulla",
                "import": "Importa",
                "export": "Esporta"
            }
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
