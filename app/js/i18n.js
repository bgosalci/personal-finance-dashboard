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
                },
                "loan": {
                    "labels": {
                        "principal": "Principal Amount",
                        "rate": "Annual Interest Rate (%)",
                        "term": "Loan Term (Years)"
                    },
                    "results": {
                        "monthlyPayment": "Monthly Payment:",
                        "totalInterest": "Total Interest:",
                        "totalAmount": "Total Amount:"
                    }
                },
                "investment": {
                    "labels": {
                        "initial": "Initial Investment",
                        "rate": "Annual Return Rate (%)",
                        "years": "Investment Period (Years)"
                    },
                    "results": {
                        "totalReturn": "Total Return (Interest):",
                        "finalValue": "Final Value:"
                    },
                    "table": {
                        "year": "Year",
                        "growth": "Growth",
                        "value": "Value",
                        "start": "Start"
                    }
                },
                "cagr": {
                    "labels": {
                        "beginning": "Beginning Value ($)",
                        "ending": "Ending Value ($)",
                        "years": "Number of Years"
                    },
                    "results": {
                        "totalReturn": "Total Return:",
                        "cagr": "Compound Annual Growth Rate (CAGR):"
                    }
                },
                "fairValue": {
                    "tabs": {
                        "dcf": "DCF Analysis",
                        "pe": "P/E Ratio Analysis",
                        "intrinsic": "Intrinsic Value"
                    },
                    "dcf": {
                        "title": "Discounted Cash Flow (DCF) Analysis",
                        "labels": {
                            "currentFCF": "Current Annual Free Cash Flow",
                            "growthRate": "Growth Rate (%)",
                            "terminalRate": "Terminal Growth Rate (%)",
                            "discountRate": "Discount Rate (WACC) (%)",
                            "years": "Projection Years",
                            "shares": "Shares Outstanding (M)"
                        },
                        "results": {
                            "enterpriseValue": "Enterprise Value:",
                            "pvCashflows": "Present Value of Cash Flows:",
                            "terminalValue": "Terminal Value:",
                            "perShare": "Intrinsic Value Per Share:"
                        }
                    },
                    "pe": {
                        "title": "P/E Ratio Analysis",
                        "labels": {
                            "currentPrice": "Current Stock Price ($)",
                            "eps": "Earnings Per Share (EPS) ($)",
                            "industryPE": "Industry Average P/E",
                            "growthRate": "Expected EPS Growth Rate (%)"
                        },
                        "results": {
                            "currentPE": "Current P/E Ratio:",
                            "fairValue": "Fair Value (Industry P/E):",
                            "pegRatio": "PEG Ratio:",
                            "valuation": "Valuation Status:"
                        }
                    },
                    "intrinsic": {
                        "title": "Intrinsic Value Analysis",
                        "labels": {
                            "bookValue": "Book Value Per Share ($)",
                            "roe": "Return on Equity (ROE) (%)",
                            "dividendYield": "Dividend Yield (%)",
                            "requiredReturn": "Required Rate of Return (%)",
                            "growthRate": "Sustainable Growth Rate (%)",
                            "eps": "Current EPS ($)"
                        },
                        "results": {
                            "graham": "Graham Number:",
                            "ddm": "Dividend Discount Model:",
                            "bookMultiple": "Book Value Multiple:",
                            "average": "Average Intrinsic Value:"
                        }
                    }
                }
            },
            "stockTracker": {
                "title": "Stock Performance Tracker",
                "actions": {
                    "edit": "Edit",
                    "getLastPrice": "Get The Last Price",
                    "addTicker": "Add Ticker",
                    "generateTable": "Generate Table",
                    "done": "Done"
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
            "dialog": {
                "yes": "Yes",
                "no": "No",
                "close": "Close",
                "delete": "Delete",
                "enterPortfolioName": "Enter portfolio name:",
                "deletePortfolio": "Delete this portfolio?",
                "tickerNotExist": "Ticker symbol does not exist",
                "enterValidTicker": "Please enter a valid ticker symbol.",
                "purchaseDateFuture": "Purchase date cannot be in the future.",
                "deleteInvestment": "Delete this investment?",
                "deletePension": "Delete this pension?",
                "deleteEntry": "Delete this entry?",
                "deleteAllPension": "Delete all pension data?",
                "deleteAllPortfolio": "Delete all portfolio data?",
                "deleteAllStock": "Delete all stock tracker data?"
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
                },

                "loan": {
                    "labels": {
                        "principal": "Shuma e kredisë",
                        "rate": "Norma vjetore e interesit (%)",
                        "term": "Afati i huasë (Vite)",
                    },
                    "results": {
                        "monthlyPayment": "Pagesa mujore:",
                        "totalInterest": "Interesi total:",
                        "totalAmount": "Shuma totale:",
                    }
                },
                "investment": {
                    "labels": {
                        "initial": "Investimi fillestar",
                        "rate": "Norma e kthimit vjetor (%)",
                        "years": "Periudha e investimit (Vite)",
                    },
                    "results": {
                        "totalReturn": "Kthimi total (Interesi):",
                        "finalValue": "Vlera përfundimtare:",
                    },
                    "table": {
                        "year": "Vit",
                        "growth": "Rritje",
                        "value": "Vlera",
                        "start": "Fillimi",
                    }
                },
                "cagr": {
                    "labels": {
                        "beginning": "Vlera fillestare ($)",
                        "ending": "Vlera përfundimtare ($)",
                        "years": "Numri i viteve",
                    },
                    "results": {
                        "totalReturn": "Kthimi total:",
                        "cagr": "Norma vjetore e rritjes së përbërë (CAGR):",
                    }
                },
                "fairValue": {
                    "tabs": {
                        "dcf": "Analiza DCF",
                        "pe": "Analiza e raportit P/E",
                        "intrinsic": "Vlera e brendshme",
                    },
                    "dcf": {
                        "title": "Analiza e fluksit të parasë së zbritur (DCF)",
                        "labels": {
                            "currentFCF": "Fluksi i lirë i parave vjetor aktual",
                            "growthRate": "Norma e rritjes (%)",
                            "terminalRate": "Norma terminale e rritjes (%)",
                            "discountRate": "Norma e zbritjes (WACC) (%)",
                            "years": "Vitet e projeksionit",
                            "shares": "Aksionet në qarkullim (M)",
                        },
                        "results": {
                            "enterpriseValue": "Vlera e ndërmarrjes:",
                            "pvCashflows": "Vlera e tashme e flukseve të parasë:",
                            "terminalValue": "Vlera terminale:",
                            "perShare": "Vlera e brendshme për aksion:",
                        }
                    },
                    "pe": {
                        "title": "Analiza e raportit P/E",
                        "labels": {
                            "currentPrice": "Çmimi aktual i aksionit ($)",
                            "eps": "Fitimi për aksion (EPS) ($)",
                            "industryPE": "P/E mesatare e industrisë",
                            "growthRate": "Norma e pritshme e rritjes së EPS (%)",
                        },
                        "results": {
                            "currentPE": "Raporti aktual P/E:",
                            "fairValue": "Vlera e drejtë (P/E i industrisë):",
                            "pegRatio": "Raporti PEG:",
                            "valuation": "Statusi i vlerësimit:",
                        }
                    },
                    "intrinsic": {
                        "title": "Analiza e vlerës së brendshme",
                        "labels": {
                            "bookValue": "Vlera kontabël për aksion ($)",
                            "roe": "Kthimi mbi kapitalin (ROE) (%)",
                            "dividendYield": "Rendimenti i dividendës (%)",
                            "requiredReturn": "Norma e kërkuar e kthimit (%)",
                            "growthRate": "Norma e qëndrueshme e rritjes (%)",
                            "eps": "EPS aktual ($)",
                        },
                        "results": {
                            "graham": "Numri i Graham:",
                            "ddm": "Modeli i zbritjes së dividendëve:",
                            "bookMultiple": "Shumëzues i vlerës kontabël:",
                            "average": "Vlera mesatare e brendshme:",
                        }
                    }
                }

            },
            "stockTracker": {
                "title": "Gjurmues i performancës së aksioneve",
                "actions": {
                    "edit": "Redakto",
                    "getLastPrice": "Merr çmimin e fundit",
                    "addTicker": "Shto Ticker",
                    "generateTable": "Gjenero Tabelën",
                    "done": "Kryer",
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
            "dialog": {
                "yes": "Po",
                "no": "Jo",
                "close": "Mbyll",
                "delete": "Fshi",
                "enterPortfolioName": "Shkruani emrin e portofolit:",
                "deletePortfolio": "Ta fshij këtë portofol?",
                "tickerNotExist": "Simboli i aksionit nuk ekziston",
                "enterValidTicker": "Ju lutemi, shkruani një simbol të vlefshëm.",
                "purchaseDateFuture": "Data e blerjes nuk mund të jetë në të ardhmen.",
                "deleteInvestment": "Ta fshij këtë investim?",
                "deletePension": "Ta fshij këtë pension?",
                "deleteEntry": "Ta fshij këtë shënim?",
                "deleteAllPension": "Të fshij të gjithë të dhënat e pensionit?",
                "deleteAllPortfolio": "Të fshij të gjitha të dhënat e portofolit?",
                "deleteAllStock": "Të fshij të gjitha të dhënat e gjurmuesit të aksioneve?"
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
                },

                "loan": {
                    "labels": {
                        "principal": "Montant du capital",
                        "rate": "Taux d'intérêt annuel (%)",
                        "term": "Durée du prêt (années)",
                    },
                    "results": {
                        "monthlyPayment": "Paiement mensuel:",
                        "totalInterest": "Intérêt total:",
                        "totalAmount": "Montant total:",
                    }
                },
                "investment": {
                    "labels": {
                        "initial": "Investissement initial",
                        "rate": "Taux de rendement annuel (%)",
                        "years": "Période d'investissement (années)",
                    },
                    "results": {
                        "totalReturn": "Rendement total (Intérêt):",
                        "finalValue": "Valeur finale:",
                    },
                    "table": {
                        "year": "Année",
                        "growth": "Croissance",
                        "value": "Valeur",
                        "start": "Début",
                    }
                },
                "cagr": {
                    "labels": {
                        "beginning": "Valeur initiale ($)",
                        "ending": "Valeur finale ($)",
                        "years": "Nombre d'années",
                    },
                    "results": {
                        "totalReturn": "Rendement total:",
                        "cagr": "Taux de croissance annuel composé (TCAC):",
                    }
                },
                "fairValue": {
                    "tabs": {
                        "dcf": "Analyse DCF",
                        "pe": "Analyse du ratio P/E",
                        "intrinsic": "Valeur intrinsèque",
                    },
                    "dcf": {
                        "title": "Analyse des flux de trésorerie actualisés (DCF)",
                        "labels": {
                            "currentFCF": "Flux de trésorerie disponible annuel actuel",
                            "growthRate": "Taux de croissance (%)",
                            "terminalRate": "Taux de croissance terminal (%)",
                            "discountRate": "Taux d'actualisation (WACC) (%)",
                            "years": "Années de projection",
                            "shares": "Actions en circulation (M)",
                        },
                        "results": {
                            "enterpriseValue": "Valeur d'entreprise:",
                            "pvCashflows": "Valeur actuelle des flux de trésorerie:",
                            "terminalValue": "Valeur terminale:",
                            "perShare": "Valeur intrinsèque par action:",
                        }
                    },
                    "pe": {
                        "title": "Analyse du ratio P/E",
                        "labels": {
                            "currentPrice": "Prix actuel de l'action ($)",
                            "eps": "Bénéfice par action (BPA) ($)",
                            "industryPE": "P/E moyen de l'industrie",
                            "growthRate": "Taux de croissance prévu du BPA (%)",
                        },
                        "results": {
                            "currentPE": "Ratio P/E actuel:",
                            "fairValue": "Juste valeur (P/E de l'industrie):",
                            "pegRatio": "Ratio PEG:",
                            "valuation": "Statut de l'évaluation:",
                        }
                    },
                    "intrinsic": {
                        "title": "Analyse de la valeur intrinsèque",
                        "labels": {
                            "bookValue": "Valeur comptable par action ($)",
                            "roe": "Rendement des capitaux propres (ROE) (%)",
                            "dividendYield": "Rendement du dividende (%)",
                            "requiredReturn": "Taux de rendement requis (%)",
                            "growthRate": "Taux de croissance durable (%)",
                            "eps": "BPA actuel ($)",
                        },
                        "results": {
                            "graham": "Nombre de Graham:",
                            "ddm": "Modèle d'actualisation des dividendes:",
                            "bookMultiple": "Multiple de la valeur comptable:",
                            "average": "Valeur intrinsèque moyenne:",
                        }
                    }
                }

            },
            "stockTracker": {
                "title": "Suivi de performance des actions",
                "actions": {
                    "edit": "Modifier",
                    "getLastPrice": "Obtenir le dernier prix",
                    "addTicker": "Ajouter le ticker",
                    "generateTable": "Générer une table",
                    "done": "Terminé",
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
            "dialog": {
                "yes": "Oui",
                "no": "Non",
                "close": "Fermer",
                "delete": "Supprimer",
                "enterPortfolioName": "Entrez le nom du portefeuille :",
                "deletePortfolio": "Supprimer ce portefeuille ?",
                "tickerNotExist": "Le symbole boursier n'existe pas",
                "enterValidTicker": "Veuillez entrer un symbole valide.",
                "purchaseDateFuture": "La date d'achat ne peut pas être dans le futur.",
                "deleteInvestment": "Supprimer cet investissement ?",
                "deletePension": "Supprimer cette pension ?",
                "deleteEntry": "Supprimer cette entrée ?",
                "deleteAllPension": "Supprimer toutes les données de retraite ?",
                "deleteAllPortfolio": "Supprimer toutes les données de portefeuille ?",
                "deleteAllStock": "Supprimer toutes les données du suivi des actions ?"
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
                },

                "loan": {
                    "labels": {
                        "principal": "Darlehensbetrag",
                        "rate": "Jährlicher Zinssatz (%)",
                        "term": "Darlehenslaufzeit (Jahre)",
                    },
                    "results": {
                        "monthlyPayment": "Monatliche Zahlung:",
                        "totalInterest": "Gesamtzins:",
                        "totalAmount": "Gesamtbetrag:",
                    }
                },
                "investment": {
                    "labels": {
                        "initial": "Anfangsinvestition",
                        "rate": "Jährliche Rendite (%)",
                        "years": "Anlagezeitraum (Jahre)",
                    },
                    "results": {
                        "totalReturn": "Gesamtrendite (Zinsen):",
                        "finalValue": "Endwert:",
                    },
                    "table": {
                        "year": "Jahr",
                        "growth": "Wachstum",
                        "value": "Wert",
                        "start": "Start",
                    }
                },
                "cagr": {
                    "labels": {
                        "beginning": "Anfangswert ($)",
                        "ending": "Endwert ($)",
                        "years": "Anzahl der Jahre",
                    },
                    "results": {
                        "totalReturn": "Gesamtrendite:",
                        "cagr": "Jährliche Wachstumsrate (CAGR):",
                    }
                },
                "fairValue": {
                    "tabs": {
                        "dcf": "DCF-Analyse",
                        "pe": "P/E-Verhältnis-Analyse",
                        "intrinsic": "Innerer Wert",
                    },
                    "dcf": {
                        "title": "Discounted Cashflow (DCF)-Analyse",
                        "labels": {
                            "currentFCF": "Aktueller jährlicher Free Cashflow",
                            "growthRate": "Wachstumsrate (%)",
                            "terminalRate": "Terminale Wachstumsrate (%)",
                            "discountRate": "Abzinsungssatz (WACC) (%)",
                            "years": "Prognosejahre",
                            "shares": "Ausstehende Aktien (M)",
                        },
                        "results": {
                            "enterpriseValue": "Unternehmenswert:",
                            "pvCashflows": "Barwert der Cashflows:",
                            "terminalValue": "Terminalwert:",
                            "perShare": "Innerer Wert je Aktie:",
                        }
                    },
                    "pe": {
                        "title": "P/E-Verhältnis-Analyse",
                        "labels": {
                            "currentPrice": "Aktueller Aktienkurs ($)",
                            "eps": "Gewinn je Aktie (EPS) ($)",
                            "industryPE": "Branchendurchschnitt P/E",
                            "growthRate": "Erwartete EPS-Wachstumsrate (%)",
                        },
                        "results": {
                            "currentPE": "Aktuelles P/E-Verhältnis:",
                            "fairValue": "Fairer Wert (Branchen-P/E):",
                            "pegRatio": "PEG-Verhältnis:",
                            "valuation": "Bewertungsstatus:",
                        }
                    },
                    "intrinsic": {
                        "title": "Analyse des inneren Wertes",
                        "labels": {
                            "bookValue": "Buchwert je Aktie ($)",
                            "roe": "Eigenkapitalrendite (ROE) (%)",
                            "dividendYield": "Dividendenrendite (%)",
                            "requiredReturn": "Erforderliche Rendite (%)",
                            "growthRate": "Nachhaltige Wachstumsrate (%)",
                            "eps": "Aktuelles EPS ($)",
                        },
                        "results": {
                            "graham": "Graham-Zahl:",
                            "ddm": "Dividenden-Discount-Modell:",
                            "bookMultiple": "Buchwert-Multiple:",
                            "average": "Durchschnittlicher innerer Wert:",
                        }
                    }
                }

            },
            "stockTracker": {
                "title": "Aktien-Performance-Tracker",
                "actions": {
                    "edit": "Bearbeiten",
                    "getLastPrice": "Letzten Preis abrufen",
                    "addTicker": "Ticker hinzufügen",
                    "generateTable": "Tabelle erzeugen",
                    "done": "Fertig",
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
            "dialog": {
                "yes": "Ja",
                "no": "Nein",
                "close": "Schließen",
                "delete": "Löschen",
                "enterPortfolioName": "Portfolionamen eingeben:",
                "deletePortfolio": "Dieses Portfolio löschen?",
                "tickerNotExist": "Tickersymbol existiert nicht",
                "enterValidTicker": "Bitte geben Sie ein gültiges Tickersymbol ein.",
                "purchaseDateFuture": "Kaufdatum darf nicht in der Zukunft liegen.",
                "deleteInvestment": "Diese Investition löschen?",
                "deletePension": "Diese Rente löschen?",
                "deleteEntry": "Diesen Eintrag löschen?",
                "deleteAllPension": "Alle Rentendaten löschen?",
                "deleteAllPortfolio": "Alle Portfoliodaten löschen?",
                "deleteAllStock": "Alle Daten des Aktien-Trackers löschen?"
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
                },

                "loan": {
                    "labels": {
                        "principal": "Monto del préstamo",
                        "rate": "Tasa de interés anual (%)",
                        "term": "Plazo del préstamo (años)",
                    },
                    "results": {
                        "monthlyPayment": "Pago mensual:",
                        "totalInterest": "Interés total:",
                        "totalAmount": "Monto total:",
                    }
                },
                "investment": {
                    "labels": {
                        "initial": "Inversión inicial",
                        "rate": "Tasa de retorno anual (%)",
                        "years": "Periodo de inversión (años)",
                    },
                    "results": {
                        "totalReturn": "Retorno total (interés):",
                        "finalValue": "Valor final:",
                    },
                    "table": {
                        "year": "Año",
                        "growth": "Crecimiento",
                        "value": "Valor",
                        "start": "Inicio",
                    }
                },
                "cagr": {
                    "labels": {
                        "beginning": "Valor inicial ($)",
                        "ending": "Valor final ($)",
                        "years": "Número de años",
                    },
                    "results": {
                        "totalReturn": "Retorno total:",
                        "cagr": "Tasa de crecimiento anual compuesta (CAGR):",
                    }
                },
                "fairValue": {
                    "tabs": {
                        "dcf": "Análisis DCF",
                        "pe": "Análisis del ratio P/E",
                        "intrinsic": "Valor intrínseco",
                    },
                    "dcf": {
                        "title": "Análisis de flujo de caja descontado (DCF)",
                        "labels": {
                            "currentFCF": "Flujo de caja libre anual actual",
                            "growthRate": "Tasa de crecimiento (%)",
                            "terminalRate": "Tasa de crecimiento terminal (%)",
                            "discountRate": "Tasa de descuento (WACC) (%)",
                            "years": "Años de proyección",
                            "shares": "Acciones en circulación (M)",
                        },
                        "results": {
                            "enterpriseValue": "Valor empresarial:",
                            "pvCashflows": "Valor presente de los flujos de caja:",
                            "terminalValue": "Valor terminal:",
                            "perShare": "Valor intrínseco por acción:",
                        }
                    },
                    "pe": {
                        "title": "Análisis del ratio P/E",
                        "labels": {
                            "currentPrice": "Precio actual de la acción ($)",
                            "eps": "Ganancias por acción (EPS) ($)",
                            "industryPE": "P/E promedio de la industria",
                            "growthRate": "Tasa de crecimiento esperada del EPS (%)",
                        },
                        "results": {
                            "currentPE": "Ratio P/E actual:",
                            "fairValue": "Valor justo (P/E de la industria):",
                            "pegRatio": "Ratio PEG:",
                            "valuation": "Estado de valoración:",
                        }
                    },
                    "intrinsic": {
                        "title": "Análisis del valor intrínseco",
                        "labels": {
                            "bookValue": "Valor en libros por acción ($)",
                            "roe": "Retorno sobre el patrimonio (ROE) (%)",
                            "dividendYield": "Rendimiento de dividendos (%)",
                            "requiredReturn": "Tasa de retorno requerida (%)",
                            "growthRate": "Tasa de crecimiento sostenible (%)",
                            "eps": "EPS actual ($)",
                        },
                        "results": {
                            "graham": "Número de Graham:",
                            "ddm": "Modelo de descuento de dividendos:",
                            "bookMultiple": "Múltiplo del valor en libros:",
                            "average": "Valor intrínseco promedio:",
                        }
                    }
                }

            },
            "stockTracker": {
                "title": "Rastreador de rendimiento de acciones",
                "actions": {
                    "edit": "Editar",
                    "getLastPrice": "Obtener el último precio",
                    "addTicker": "Agregar ticker",
                    "generateTable": "Generar tabla",
                    "done": "Listo",
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
            "dialog": {
                "yes": "Sí",
                "no": "No",
                "close": "Cerrar",
                "delete": "Eliminar",
                "enterPortfolioName": "Ingrese el nombre del portafolio:",
                "deletePortfolio": "¿Eliminar este portafolio?",
                "tickerNotExist": "El símbolo de cotización no existe",
                "enterValidTicker": "Por favor, ingrese un símbolo válido.",
                "purchaseDateFuture": "La fecha de compra no puede estar en el futuro.",
                "deleteInvestment": "¿Eliminar esta inversión?",
                "deletePension": "¿Eliminar esta pensión?",
                "deleteEntry": "¿Eliminar esta entrada?",
                "deleteAllPension": "¿Eliminar todos los datos de pensión?",
                "deleteAllPortfolio": "¿Eliminar todos los datos de portafolio?",
                "deleteAllStock": "¿Eliminar todos los datos del rastreador de acciones?"
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
                },

                "loan": {
                    "labels": {
                        "principal": "Importo del prestito",
                        "rate": "Tasso di interesse annuale (%)",
                        "term": "Durata del prestito (anni)",
                    },
                    "results": {
                        "monthlyPayment": "Rata mensile:",
                        "totalInterest": "Interessi totali:",
                        "totalAmount": "Importo totale:",
                    }
                },
                "investment": {
                    "labels": {
                        "initial": "Investimento iniziale",
                        "rate": "Tasso di rendimento annuale (%)",
                        "years": "Periodo di investimento (anni)",
                    },
                    "results": {
                        "totalReturn": "Rendimento totale (interessi):",
                        "finalValue": "Valore finale:",
                    },
                    "table": {
                        "year": "Anno",
                        "growth": "Crescita",
                        "value": "Valore",
                        "start": "Inizio",
                    }
                },
                "cagr": {
                    "labels": {
                        "beginning": "Valore iniziale ($)",
                        "ending": "Valore finale ($)",
                        "years": "Numero di anni",
                    },
                    "results": {
                        "totalReturn": "Rendimento totale:",
                        "cagr": "Tasso di crescita annuale composto (CAGR):",
                    }
                },
                "fairValue": {
                    "tabs": {
                        "dcf": "Analisi DCF",
                        "pe": "Analisi del rapporto P/E",
                        "intrinsic": "Valore intrinseco",
                    },
                    "dcf": {
                        "title": "Analisi del flusso di cassa scontato (DCF)",
                        "labels": {
                            "currentFCF": "Flusso di cassa libero annuale attuale",
                            "growthRate": "Tasso di crescita (%)",
                            "terminalRate": "Tasso di crescita terminale (%)",
                            "discountRate": "Tasso di sconto (WACC) (%)",
                            "years": "Anni di previsione",
                            "shares": "Azioni in circolazione (M)",
                        },
                        "results": {
                            "enterpriseValue": "Valore d'impresa:",
                            "pvCashflows": "Valore attuale dei flussi di cassa:",
                            "terminalValue": "Valore terminale:",
                            "perShare": "Valore intrinseco per azione:",
                        }
                    },
                    "pe": {
                        "title": "Analisi del rapporto P/E",
                        "labels": {
                            "currentPrice": "Prezzo attuale dell'azione ($)",
                            "eps": "Utile per azione (EPS) ($)",
                            "industryPE": "P/E medio del settore",
                            "growthRate": "Tasso di crescita previsto dell'EPS (%)",
                        },
                        "results": {
                            "currentPE": "Rapporto P/E attuale:",
                            "fairValue": "Valore equo (P/E del settore):",
                            "pegRatio": "Rapporto PEG:",
                            "valuation": "Stato della valutazione:",
                        }
                    },
                    "intrinsic": {
                        "title": "Analisi del valore intrinseco",
                        "labels": {
                            "bookValue": "Valore contabile per azione ($)",
                            "roe": "Rendimento del capitale proprio (ROE) (%)",
                            "dividendYield": "Rendimento da dividendo (%)",
                            "requiredReturn": "Tasso di rendimento richiesto (%)",
                            "growthRate": "Tasso di crescita sostenibile (%)",
                            "eps": "EPS attuale ($)",
                        },
                        "results": {
                            "graham": "Numero di Graham:",
                            "ddm": "Modello di sconto dei dividendi:",
                            "bookMultiple": "Multiplo del valore contabile:",
                            "average": "Valore intrinseco medio:",
                        }
                    }
                }

            },
            "stockTracker": {
                "title": "Tracker delle prestazioni azionarie",
                "actions": {
                    "edit": "Modifica",
                    "getLastPrice": "Ottieni l'ultimo prezzo",
                    "addTicker": "Aggiungi ticker",
                    "generateTable": "Genera tabella",
                    "done": "Fatto",
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
            "dialog": {
                "yes": "Sì",
                "no": "No",
                "close": "Chiudi",
                "delete": "Elimina",
                "enterPortfolioName": "Inserisci il nome del portafoglio:",
                "deletePortfolio": "Eliminare questo portafoglio?",
                "tickerNotExist": "Il simbolo ticker non esiste",
                "enterValidTicker": "Per favore inserisci un simbolo valido.",
                "purchaseDateFuture": "La data di acquisto non può essere nel futuro.",
                "deleteInvestment": "Eliminare questo investimento?",
                "deletePension": "Eliminare questa pensione?",
                "deleteEntry": "Eliminare questa voce?",
                "deleteAllPension": "Eliminare tutti i dati della pensione?",
                "deleteAllPortfolio": "Eliminare tutti i dati del portafoglio?",
                "deleteAllStock": "Eliminare tutti i dati del tracker azionario?"
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
