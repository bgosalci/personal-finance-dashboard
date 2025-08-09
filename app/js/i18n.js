const I18n = (function() {
    'use strict';
    const LOCALE_KEY = 'pf_locale';
    const RTL_KEY = 'pf_rtl';
    const isFileProtocol = typeof location !== 'undefined' && location.protocol === 'file:';
    let currentLocale = 'en';
    let translations = {};

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
            "pension": {
                "title": "Pension",
                "actions": {
                    "addEntry": "Add Entry",
                    "addPension": "Add Pension",
                    "removePension": "Remove Pension",
                    "viewChart": "View Chart",
                    "showInSummary": "Show in Summary"
                },
                "table": {
                    "date": "Date",
                    "payment": "Payment",
                    "totalPayments": "Total Payments",
                    "currentValue": "Current Value",
                    "monthlyPL": "Monthly P&L",
                    "monthlyPct": "Monthly %",
                    "ytdPL": "YTD P&L",
                    "ytdPct": "YTD %",
                    "totalPL": "Total P&L",
                    "totalPct": "Total %",
                    "actions": "Actions"
                },
                "summaryCards": {
                    "currentCAGR": "Current CAGR",
                    "bestMonth": "Best Month",
                    "worstMonth": "Worst Month",
                    "bestYear": "Best Year",
                    "worstYear": "Worst Year"
                }
            },
            "calculators": {
                "title": "Financial Calculators",
                "tabs": {
                    "loan": "Loan Calculator",
                    "investment": "Investment Calculator",
                    "cagr": "CAGR Calculator",
                    "fairValue": "Fair Value Calculator"
                }
            },
            "stockTracker": {
                "title": "Stock Performance Tracker",
                "actions": {
                    "edit": "Edit",
                    "getLastPrice": "Get The Last Price",
                    "addTicker": "Add Ticker",
                    "generateTable": "Generate Table"
                },
                "labels": {
                    "addStockTicker": "Add Stock Ticker",
                    "startYear": "Starting Year"
                },
                "table": {
                    "year": "Year",
                    "totalGrowth": "Total Growth",
                    "cagr": "CAGR",
                    "chart": "Chart"
                },
                "summary": {
                    "investment": "Investment Analysis",
                    "best": "Best Performer",
                    "worst": "Worst Performer",
                    "consistent": "Most Consistent"
                },
                "chart": {
                    "price": "Price",
                    "growth": "Growth"
                }
            },
            "stockFinance": {
                "title": "Stock Finance Performance",
                "labels": {
                    "ticker": "Ticker",
                    "reportsFrom": "Reports starting from",
                    "timeframe": "Timeframe",
                    "getReports": "Get Reports",
                    "timeframes": {
                        "quarterly": "Quarterly",
                        "annual": "Annual",
                        "ttm": "TTM"
                    }
                },
                "tabs": {
                    "income": "Income Statement",
                    "balance": "Balance Sheet",
                    "cash": "Cash Flow",
                    "stats": "Statistics"
                },
                "table": {
                    "label": "Label"
                },
                "messages": {
                    "noData": "No data available",
                    "loadFailed": "Failed to load data"
                },
                "zeroInfo": "Values trimmed by removing 6 trailing zeros (\"000,000\")",
                "stats": {
                    "peRatio": "PE Ratio",
                    "grossMargin": "Gross Margin",
                    "netMargin": "Net Margin"
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
                "export": "Export",
                "summary": "Summary"
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
            "pension": {
                "title": "Pensioni",
                "actions": {
                    "addEntry": "Shto Regjistrim",
                    "addPension": "Shto Pension",
                    "removePension": "Hiq Pension",
                    "viewChart": "Shiko Grafik",
                    "showInSummary": "Shfaq në Përmbledhje"
                },
                "table": {
                    "date": "Data",
                    "payment": "Pagesa",
                    "totalPayments": "Pagesat Totale",
                    "currentValue": "Vlera Aktuale",
                    "monthlyPL": "Fitimi/Humbja Mujore",
                    "monthlyPct": "% Mujore",
                    "ytdPL": "Fitimi/Humbja YTD",
                    "ytdPct": "% YTD",
                    "totalPL": "Fitimi/Humbja Totale",
                    "totalPct": "% Totale",
                    "actions": "Veprimet"
                },
                "summaryCards": {
                    "currentCAGR": "CAGR Aktual",
                    "bestMonth": "Muaji Më i Mirë",
                    "worstMonth": "Muaji Më i Keq",
                    "bestYear": "Viti Më i Mirë",
                    "worstYear": "Viti Më i Keq"
                }
            },
            "calculators": {
                "title": "Kalkulatorë financiarë",
                "tabs": {
                    "loan": "Kalkulator i huasë",
                    "investment": "Kalkulator investimesh",
                    "cagr": "Kalkulator CAGR",
                    "fairValue": "Kalkulator i vlerës së drejtë"
                }
            },
            "stockTracker": {
                "title": "Gjurmues i performancës së aksioneve",
                "actions": {
                    "edit": "Redakto",
                    "getLastPrice": "Merr çmimin e fundit",
                    "addTicker": "Shto Ticker",
                    "generateTable": "Gjenero Tabelën"
                },
                "labels": {
                    "addStockTicker": "Shto Ticker Aksionesh",
                    "startYear": "Viti i fillimit"
                },
                "table": {
                    "year": "Vit",
                    "totalGrowth": "Rritje totale",
                    "cagr": "CAGR",
                    "chart": "Grafik"
                },
                "summary": {
                    "investment": "Analiza e investimeve",
                    "best": "Performuesi më i mirë",
                    "worst": "Performuesi më i keq",
                    "consistent": "Më i qëndrueshëm"
                },
                "chart": {
                    "price": "Çmim",
                    "growth": "Rritje"
                }
            },
            "stockFinance": {
                "title": "Performanca e financave të aksioneve",
                "labels": {
                    "ticker": "Ticker",
                    "reportsFrom": "Raportet duke filluar nga",
                    "timeframe": "Afat kohor",
                    "getReports": "Merr Raporte",
                    "timeframes": {
                        "quarterly": "Tremujor",
                        "annual": "Vjetor",
                        "ttm": "TTM"
                    }
                },
                "tabs": {
                    "income": "Pasqyrë e të ardhurave",
                    "balance": "Bilanc",
                    "cash": "Fluksi i parave",
                    "stats": "Statistika"
                },
                "table": {
                    "label": "Etiketë"
                },
                "messages": {
                    "noData": "Asnjë të dhënë në dispozicion",
                    "loadFailed": "Dështoi të ngarkojë të dhënat"
                },
                "zeroInfo": "Vlerat u shkurtohen duke hequr 6 zero në fund (\"000,000\")",
                "stats": {
                    "peRatio": "Raporti P/E",
                    "grossMargin": "Marzha bruto",
                    "netMargin": "Marzha neto"
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
                "export": "Eksporto",
                "summary": "Përmbledhje"
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
            "pension": {
                "title": "Pension",
                "actions": {
                    "addEntry": "Ajouter une Entrée",
                    "addPension": "Ajouter une Pension",
                    "removePension": "Supprimer la Pension",
                    "viewChart": "Voir le Graphique",
                    "showInSummary": "Afficher dans le Résumé"
                },
                "table": {
                    "date": "Date",
                    "payment": "Paiement",
                    "totalPayments": "Paiements Totaux",
                    "currentValue": "Valeur Actuelle",
                    "monthlyPL": "P&L Mensuel",
                    "monthlyPct": "% Mensuel",
                    "ytdPL": "P&L YTD",
                    "ytdPct": "% YTD",
                    "totalPL": "P&L Total",
                    "totalPct": "% Total",
                    "actions": "Actions"
                },
                "summaryCards": {
                    "currentCAGR": "CAGR Actuel",
                    "bestMonth": "Meilleur Mois",
                    "worstMonth": "Pire Mois",
                    "bestYear": "Meilleure Année",
                    "worstYear": "Pire Année"
                }
            },
            "calculators": {
                "title": "Calculatrices financières",
                "tabs": {
                    "loan": "Calculateur de prêt",
                    "investment": "Calculateur d'investissement",
                    "cagr": "Calculateur de TCAC",
                    "fairValue": "Calculateur de juste valeur"
                }
            },
            "stockTracker": {
                "title": "Suivi de performance des actions",
                "actions": {
                    "edit": "Modifier",
                    "getLastPrice": "Obtenir le dernier prix",
                    "addTicker": "Ajouter le ticker",
                    "generateTable": "Générer une table"
                },
                "labels": {
                    "addStockTicker": "Ajouter un ticker d'actions",
                    "startYear": "Année de départ"
                },
                "table": {
                    "year": "Année",
                    "totalGrowth": "Croissance totale",
                    "cagr": "TCAC",
                    "chart": "Graphique"
                },
                "summary": {
                    "investment": "Analyse des investissements",
                    "best": "Meilleur interprète",
                    "worst": "Pire interprète",
                    "consistent": "Le plus cohérent"
                },
                "chart": {
                    "price": "Prix",
                    "growth": "Croissance"
                }
            },
            "stockFinance": {
                "title": "Performance financière des actions",
                "labels": {
                    "ticker": "Ticker",
                    "reportsFrom": "Rapports à partir de",
                    "timeframe": "Période",
                    "getReports": "Obtenir des rapports",
                    "timeframes": {
                        "quarterly": "Trimestriel",
                        "annual": "Annuel",
                        "ttm": "TTM"
                    }
                },
                "tabs": {
                    "income": "Compte de résultat",
                    "balance": "Bilan",
                    "cash": "Flux de trésorerie",
                    "stats": "Statistiques"
                },
                "table": {
                    "label": "Étiquette"
                },
                "messages": {
                    "noData": "Aucune donnée disponible",
                    "loadFailed": "Échec du chargement des données"
                },
                "zeroInfo": "Valeurs raccourcies en supprimant 6 zéros finaux (\"000 000\")",
                "stats": {
                    "peRatio": "Ratio P/E",
                    "grossMargin": "Marge brute",
                    "netMargin": "Marge nette"
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
                "export": "Exporter",
                "summary": "Résumé"
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
            "pension": {
                "title": "Rente",
                "actions": {
                    "addEntry": "Eintrag hinzufügen",
                    "addPension": "Rente hinzufügen",
                    "removePension": "Rente entfernen",
                    "viewChart": "Diagramm anzeigen",
                    "showInSummary": "In Zusammenfassung anzeigen"
                },
                "table": {
                    "date": "Datum",
                    "payment": "Zahlung",
                    "totalPayments": "Gesamtzahlungen",
                    "currentValue": "Aktueller Wert",
                    "monthlyPL": "Monatlicher G&V",
                    "monthlyPct": "Monatlich %",
                    "ytdPL": "G&V seit Jahresbeginn",
                    "ytdPct": "YTD %",
                    "totalPL": "Gesamt G&V",
                    "totalPct": "Gesamt %",
                    "actions": "Aktionen"
                },
                "summaryCards": {
                    "currentCAGR": "Aktueller CAGR",
                    "bestMonth": "Bester Monat",
                    "worstMonth": "Schlechtester Monat",
                    "bestYear": "Bestes Jahr",
                    "worstYear": "Schlechtestes Jahr"
                }
            },
            "calculators": {
                "title": "Finanzrechner",
                "tabs": {
                    "loan": "Kreditrechner",
                    "investment": "Investmentrechner",
                    "cagr": "CAGR-Rechner",
                    "fairValue": "Fair-Value-Rechner"
                }
            },
            "stockTracker": {
                "title": "Aktien-Performance-Tracker",
                "actions": {
                    "edit": "Bearbeiten",
                    "getLastPrice": "Letzten Preis abrufen",
                    "addTicker": "Ticker hinzufügen",
                    "generateTable": "Tabelle erzeugen"
                },
                "labels": {
                    "addStockTicker": "Aktien-Ticker hinzufügen",
                    "startYear": "Startjahr"
                },
                "table": {
                    "year": "Jahr",
                    "totalGrowth": "Gesamtwachstum",
                    "cagr": "CAGR",
                    "chart": "Diagramm"
                },
                "summary": {
                    "investment": "Investitionsanalyse",
                    "best": "Bester Performer",
                    "worst": "Schlechtester Performer",
                    "consistent": "Am beständigsten"
                },
                "chart": {
                    "price": "Preis",
                    "growth": "Wachstum"
                }
            },
            "stockFinance": {
                "title": "Finanzielle Aktienperformance",
                "labels": {
                    "ticker": "Ticker",
                    "reportsFrom": "Berichte ab",
                    "timeframe": "Zeitrahmen",
                    "getReports": "Berichte abrufen",
                    "timeframes": {
                        "quarterly": "Vierteljährlich",
                        "annual": "Jährlich",
                        "ttm": "TTM"
                    }
                },
                "tabs": {
                    "income": "Gewinn- und Verlustrechnung",
                    "balance": "Bilanz",
                    "cash": "Cashflow",
                    "stats": "Statistiken"
                },
                "table": {
                    "label": "Etikett"
                },
                "messages": {
                    "noData": "Keine Daten verfügbar",
                    "loadFailed": "Daten konnten nicht geladen werden"
                },
                "zeroInfo": "Werte gekürzt, indem 6 nachgestellte Nullen (\"000.000\") entfernt wurden",
                "stats": {
                    "peRatio": "P/E-Verhältnis",
                    "grossMargin": "Bruttomarge",
                    "netMargin": "Nettomarge"
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
                "export": "Exportieren",
                "summary": "Zusammenfassung"
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
            "pension": {
                "title": "Pensión",
                "actions": {
                    "addEntry": "Agregar Entrada",
                    "addPension": "Agregar Pensión",
                    "removePension": "Eliminar Pensión",
                    "viewChart": "Ver Gráfico",
                    "showInSummary": "Mostrar en el Resumen"
                },
                "table": {
                    "date": "Fecha",
                    "payment": "Pago",
                    "totalPayments": "Pagos Totales",
                    "currentValue": "Valor Actual",
                    "monthlyPL": "P&L Mensual",
                    "monthlyPct": "% Mensual",
                    "ytdPL": "P&L YTD",
                    "ytdPct": "% YTD",
                    "totalPL": "P&L Total",
                    "totalPct": "% Total",
                    "actions": "Acciones"
                },
                "summaryCards": {
                    "currentCAGR": "CAGR Actual",
                    "bestMonth": "Mejor Mes",
                    "worstMonth": "Peor Mes",
                    "bestYear": "Mejor Año",
                    "worstYear": "Peor Año"
                }
            },
            "calculators": {
                "title": "Calculadoras financieras",
                "tabs": {
                    "loan": "Calculadora de préstamos",
                    "investment": "Calculadora de inversiones",
                    "cagr": "Calculadora CAGR",
                    "fairValue": "Calculadora de valor razonable"
                }
            },
            "stockTracker": {
                "title": "Rastreador de rendimiento de acciones",
                "actions": {
                    "edit": "Editar",
                    "getLastPrice": "Obtener el último precio",
                    "addTicker": "Agregar ticker",
                    "generateTable": "Generar tabla"
                },
                "labels": {
                    "addStockTicker": "Agregar ticker de acciones",
                    "startYear": "Año inicial"
                },
                "table": {
                    "year": "Año",
                    "totalGrowth": "Crecimiento total",
                    "cagr": "CAGR",
                    "chart": "Gráfico"
                },
                "summary": {
                    "investment": "Análisis de inversiones",
                    "best": "Mejor desempeño",
                    "worst": "Peor desempeño",
                    "consistent": "Más consistente"
                },
                "chart": {
                    "price": "Precio",
                    "growth": "Crecimiento"
                }
            },
            "stockFinance": {
                "title": "Rendimiento financiero de acciones",
                "labels": {
                    "ticker": "Ticker",
                    "reportsFrom": "Informes que comienzan desde",
                    "timeframe": "Período de tiempo",
                    "getReports": "Obtener informes",
                    "timeframes": {
                        "quarterly": "Trimestral",
                        "annual": "Anual",
                        "ttm": "TTM"
                    }
                },
                "tabs": {
                    "income": "Estado de resultados",
                    "balance": "Balance",
                    "cash": "Flujo de efectivo",
                    "stats": "Estadísticas"
                },
                "table": {
                    "label": "Etiqueta"
                },
                "messages": {
                    "noData": "No hay datos disponibles",
                    "loadFailed": "Error al cargar los datos"
                },
                "zeroInfo": "Valores recortados eliminando 6 ceros finales (\"000,000\")",
                "stats": {
                    "peRatio": "Relación P/E",
                    "grossMargin": "Margen bruto",
                    "netMargin": "Margen neto"
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
                "export": "Exportar",
                "summary": "Resumen"
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
            "pension": {
                "title": "Pensione",
                "actions": {
                    "addEntry": "Aggiungi Voce",
                    "addPension": "Aggiungi Pensione",
                    "removePension": "Rimuovi Pensione",
                    "viewChart": "Visualizza Grafico",
                    "showInSummary": "Mostra nel Riepilogo"
                },
                "table": {
                    "date": "Data",
                    "payment": "Pagamento",
                    "totalPayments": "Pagamenti Totali",
                    "currentValue": "Valore Attuale",
                    "monthlyPL": "Utile/Perdita Mensile",
                    "monthlyPct": "% Mensile",
                    "ytdPL": "Utile/Perdita YTD",
                    "ytdPct": "% YTD",
                    "totalPL": "Utile/Perdita Totale",
                    "totalPct": "% Totale",
                    "actions": "Azioni"
                },
                "summaryCards": {
                    "currentCAGR": "CAGR Attuale",
                    "bestMonth": "Mese Migliore",
                    "worstMonth": "Mese Peggiore",
                    "bestYear": "Anno Migliore",
                    "worstYear": "Anno Peggiore"
                }
            },
            "calculators": {
                "title": "Calcolatori finanziari",
                "tabs": {
                    "loan": "Calcolatore del prestito",
                    "investment": "Calcolatore di investimento",
                    "cagr": "Calcolatore CAGR",
                    "fairValue": "Calcolatore del valore equo"
                }
            },
            "stockTracker": {
                "title": "Tracker delle prestazioni azionarie",
                "actions": {
                    "edit": "Modifica",
                    "getLastPrice": "Ottieni l'ultimo prezzo",
                    "addTicker": "Aggiungi ticker",
                    "generateTable": "Genera tabella"
                },
                "labels": {
                    "addStockTicker": "Aggiungi ticker azionario",
                    "startYear": "Anno di partenza"
                },
                "table": {
                    "year": "Anno",
                    "totalGrowth": "Crescita totale",
                    "cagr": "CAGR",
                    "chart": "Grafico"
                },
                "summary": {
                    "investment": "Analisi degli investimenti",
                    "best": "Miglior performer",
                    "worst": "Peggior performer",
                    "consistent": "Più coerente"
                },
                "chart": {
                    "price": "Prezzo",
                    "growth": "Crescita"
                }
            },
            "stockFinance": {
                "title": "Prestazioni finanziarie delle azioni",
                "labels": {
                    "ticker": "Ticker",
                    "reportsFrom": "Report a partire da",
                    "timeframe": "Periodo di riferimento",
                    "getReports": "Ottieni rapporti",
                    "timeframes": {
                        "quarterly": "Trimestrale",
                        "annual": "Annuale",
                        "ttm": "TTM"
                    }
                },
                "tabs": {
                    "income": "Conto economico",
                    "balance": "Bilancio",
                    "cash": "Flusso di cassa",
                    "stats": "Statistiche"
                },
                "table": {
                    "label": "Etichetta"
                },
                "messages": {
                    "noData": "Nessun dato disponibile",
                    "loadFailed": "Impossibile caricare i dati"
                },
                "zeroInfo": "Valori ridotti rimuovendo 6 zeri finali (\"000,000\")",
                "stats": {
                    "peRatio": "Rapporto P/E",
                    "grossMargin": "Margine lordo",
                    "netMargin": "Margine netto"
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
                "export": "Esporta",
                "summary": "Riepilogo"
            }
        }
    };

    function mergeDeep(target, source) {
        Object.keys(source).forEach(key => {
            const src = source[key];
            if (src && typeof src === 'object' && !Array.isArray(src)) {
                if (!target[key]) target[key] = {};
                mergeDeep(target[key], src);
            } else {
                target[key] = src;
            }
        });
        return target;
    }

    const availableLocales = Object.keys(DEFAULT_TRANSLATIONS);
    availableLocales.push('pseudo');

    function getLocale() {
        return localStorage.getItem(LOCALE_KEY) || 'en';
    }

    function getCurrentLocale() {
        return currentLocale;
    }

    async function loadLocale(locale) {
        const storeKey = 'locale-' + locale;
        let loaded = null;
        const cached = localStorage.getItem(storeKey);
        if (cached) {
            try { loaded = JSON.parse(cached); } catch {}
        }
        if (!loaded && typeof fetch === 'function' && !isFileProtocol) {
            try {
                const resp = await fetch('locales/' + locale + '.json');
                if (resp.ok) {
                    loaded = await resp.json();
                }
            } catch (e) {
                console.warn('Failed to load locale', locale, e);
            }
        }
        if (!loaded && DEFAULT_TRANSLATIONS[locale]) {
            loaded = DEFAULT_TRANSLATIONS[locale];
        }
        if (!loaded) {
            await loadLocale('en');
            return;
        }
        const base = DEFAULT_TRANSLATIONS[locale] ? JSON.parse(JSON.stringify(DEFAULT_TRANSLATIONS[locale])) : {};
        translations = mergeDeep(base, loaded);
        localStorage.setItem(storeKey, JSON.stringify(translations));
        currentLocale = locale;
        if (locale !== 'en' && !localStorage.getItem('locale-en')) {
            localStorage.setItem('locale-en', JSON.stringify(DEFAULT_TRANSLATIONS.en));
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
        if (typeof PortfolioColumns !== 'undefined' && PortfolioColumns.apply) {
            PortfolioColumns.apply();
        }
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
                if (!base) base = DEFAULT_TRANSLATIONS.en;
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
        return new Intl.NumberFormat('en', options).format(num);
    }

    function formatCurrency(num, currency = 'USD') {
        return new Intl.NumberFormat('en', {
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
