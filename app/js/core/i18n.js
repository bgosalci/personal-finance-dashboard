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
                "watchlist": "Watchlist",
                "pension": "Pension",
                "calculators": "Calculators",
                "stockTracker": "Stock Performance Tracker",
                "settings": "Settings"
            },
            "portfolio": {
                "actions": {
                "addInvestment": "Add Investment",
                "getLastPrice": "Get The Last Price",
                "transactionHistory": "Transaction History",
                "addPortfolio": "Add Portfolio",
                "removePortfolio": "Remove Portfolio",
                "showInSummary": "Show in Summary",
                "edit": "Edit",
                "delete": "Delete"
                },
                "table": {
                "ticker": "Ticker",
                "currency": "Currency",
                "name": "Name",
                "purchasePrice": "Purchase Price",
                "principal": "Principal",
                "quantity": "Quantity",
                "lastPrice": "Last Price",
                "purchaseDate": "Purchase Date",
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
                },
                "dialogs": {
                "addInvestment": { "title": "Add Investment" },
                "editInvestment": { "title": "Edit Investment", "selectRecord": "Select Record" },
                "totalValue": "Total Value",
                "saveAddAnother": "Save & Add Another"
                }
            },
            "watchlist": {
                "title": "Watchlist",
                "actions": {
                    "addStock": "Add Stock",
                    "getLastPrice": "Get The Last Price",
                    "delete": "Delete"
                },
                "table": {
                    "ticker": "Ticker",
                    "name": "Name",
                    "currency": "Currency",
                    "currentPrice": "Current Price",
                    "change": "Change",
                    "changePct": "Change %",
                    "high": "High",
                    "low": "Low",
                    "range": "Range",
                    "open": "Open Price",
                    "prevClose": "Previous Close",
                    "lastUpdate": "Last Update",
                    "actions": "Actions"
                },
                "dialogs": {
                    "addStock": { "title": "Add Stock" },
                    "deleteStock": "Delete this stock?"
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
                    "totalValue": "Total Value",
                    "currentCAGR": "Current CAGR",
                    "bestMonth": "Best Month",
                    "worstMonth": "Worst Month",
                    "bestYear": "Best Year",
                    "worstYear": "Worst Year"
                },
                "dialogs": {
                    "new": {
                        "title": "New Pension",
                        "type": "Type",
                        "startingValue": "Starting Value",
                        "options": {
                            "growth": "Growth Only",
                            "payments": "Growth with Payments"
                        }
                    },
                    "editEntry": {
                        "title": "Edit Entry"
                    }
                },
                "chart": {
                    "title": "Pension Chart"
                }
            },
            "calculators": {
                "title": "Financial Calculators",
                "tabs": {
                    "loan": "Loan Calculator",
                    "investment": "Investment Calculator",
                    "cagr": "CAGR Calculator",
                    "mortgage": "Mortgage Calculator",
                    "salary": "Salary Calculator",
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
                        "monthlyContribution": "Monthly Contribution",
                        "rate": "Annual Return Rate (%)",
                        "years": "Investment Period (Years)"
                    },
                    "results": {
                        "investedValue": "Invested Value:",
                        "growthValue": "Growth Value:",
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
                "mortgage": {
                    "labels": {
                        "propertyPrice": "Property Price",
                        "deposit": "Deposit",
                        "amount": "Mortgage Amount",
                        "rate": "Mortgage Interest Rate (%)",
                        "term": "Mortgage Term (Years)"
                    },
                    "results": {
                        "monthlyPayment": "Monthly Payment:",
                        "averageInterestPortion": "Average Interest Portion per Payment:",
                        "averagePrincipalPortion": "Average Principal Portion per Payment:",
                        "totalAmount": "Total Amount Repaid:",
                        "totalInterest": "Total Interest Paid:",
                        "totalPrincipal": "Total Principal Repaid:"
                    }
                },
                "salary": {
                    "actions": {
                        "addSalary": "Add Salary",
                        "removeSalary": "Remove",
                        "showInSummary": "Show in Summary",
                        "addAllowance": "Add Allowance"
                    },
                    "hint": "UK tax estimates based on current income tax and National Insurance thresholds.",
                    "labels": {
                        "salary": "Salary",
                        "name": "Salary name",
                        "basicSalary": "Pay rate (£)",
                        "annualizedSalary": "Calculated annual salary (£)",
                        "frequency": "Payment frequency",
                        "hoursPerWeek": "Hours per week",
                        "pension": "Pension contribution (%)",
                        "studentLoan": "Student loan plan",
                        "age": "Age",
                        "taxCode": "Tax code",
                        "benefits": "Paid benefits (annual £)",
                        "allowances": "Allowances (annual)",
                        "otherDeductions": "Other deductions (annual £)"
                    },
                    "tooltips": {
                        "name": "Give this salary a nickname. Example: \"Main job\" or \"Contract role\".",
                        "basicSalary": "Enter the pay rate that matches the frequency. Examples: £20/hour, £200/day, £750/week, £3,000/month, or £60,000/year.",
                        "annualizedSalary": "We calculate this from the pay rate and frequency to estimate your annual income.",
                        "frequency": "Choose how often the pay rate is paid (hourly, daily, weekly, monthly, or annual).",
                        "hoursPerWeek": "Average hours worked per week. Example: 37.5 for full-time or 20 for part-time.",
                        "pension": "Percentage of gross pay contributed to pension. Example: 5%.",
                        "allowances": "Annual add-ons paid on top of base salary. Examples: car allowance £3,000, bonus £1,500.",
                        "studentLoan": "Select the repayment plan that applies to you. Example: Plan 2 or Postgraduate.",
                        "age": "Your age in years. Used to estimate National Insurance. Example: 29.",
                        "taxCode": "Your HMRC tax code. Examples: 1257L, BR, K500.",
                        "benefits": "Annual value of taxable benefits. Examples: company car £2,400, health cover £600.",
                        "otherDeductions": "Other annual deductions not listed elsewhere. Examples: union fees £120, childcare vouchers £600."
                    },
                    "frequency": {
                        "annual": "Annual",
                        "monthly": "Monthly",
                        "fortnightly": "Fortnightly",
                        "weekly": "Weekly",
                        "daily": "Daily",
                        "hourly": "Hourly"
                    },
                    "studentLoan": {
                        "none": "None",
                        "plan1": "Plan 1",
                        "plan2": "Plan 2",
                        "plan4": "Plan 4",
                        "plan5": "Plan 5",
                        "postgraduate": "Postgraduate"
                    },
                    "results": {
                        "takeHome": "Take-home:",
                        "tax": "Tax to pay:",
                        "otherDeductions": "Other deductions:",
                        "pension": "Pension:",
                        "nationalInsurance": "National Insurance:",
                        "studentLoan": "Student loan:",
                        "other": "Other:",
                        "perPeriod": "Take-home per"
                    },
                    "summary": {
                        "totalTakeHome": "Total take-home:",
                        "totalTax": "Total tax (incl. NI):",
                        "totalDeductions": "Total deductions:",
                        "noneSelected": "Select salaries to include in the summary."
                    },
                    "breakdown": {
                        "annualTitle": "Annual Breakdown",
                        "frequencyTitle": "Per pay period",
                        "gross": "Gross salary:",
                        "allowances": "Allowances:",
                        "benefits": "Paid benefits:",
                        "taxable": "Taxable income:",
                        "totalTax": "Total tax (incl. NI):",
                        "totalDeductions": "Total deductions:"
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
                    "title": "Stock Chart",
                    "price": "Price",
                    "growth": "Growth"
                }
            },
            "settings": {
                "title": "Settings",
                "baseCurrency": "Base Currency",
                "baseCurrencyHint": "Exchange rates refresh once a day to keep totals accurate.",
                "sectionTitles": {
                "display": "Display",
                "language": "Language",
                "pension": "Pension",
                "salary": "Salary",
                "portfolio": "Portfolio",
                "watchlist": "Watchlist",
                "stockTracker": "Stock Performance Tracker",
                "about": "About"
                },
                "quotesApi": "Quotes API",
                "finnhubApiKey": "Finnhub API Key",
                "finnhubApiKeyHint": "Create a free API key at",
                "realTimeQuotes": "Used for real-time quotes. Stored locally in your browser.",
                "showApiKey": "Show API Key",
                "exportPensions": "Export Pensions",
                "importPensions": "Import Pensions",
                "deletePensions": "Delete Pensions",
                "exportSalaries": "Export Salaries",
                "importSalaries": "Import Salaries",
                "deleteSalaries": "Delete Salaries",
                "exportPortfolio": "Export Portfolio",
                  "importPortfolio": "Import Portfolio",
                  "deletePortfolio": "Delete Portfolio",
                "exportWatchlist": "Export Watchlist",
                "importWatchlist": "Import Watchlist",
                "deleteWatchlist": "Delete Watchlist",
                "exportStock": "Export Stock Data",
                "importStock": "Import Stock Data",
                "deleteStock": "Delete Data",
                "versionLabel": "Web App Version",
                "languageLabel": "Language",
                "exportLang": "Export Language",
                "importLang": "Import Language",
                "rtlToggle": "Enable RTL",
                "fontSize": "Font Size",
                "theme": "Theme",
                "themeSystem": "System",
                "themeLight": "Light",
                "themeDark": "Dark"
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
                "deleteAllSalary": "Delete all salary data?",
                "deleteAllPortfolio": "Delete all portfolio data?",
                "deleteAllWatchlist": "Delete all watchlist data?",
                "deleteAllStock": "Delete all stock tracker data?"
            },
            "common": {
                "format": "Format",
                "file": "File",
                "cancel": "Cancel",
                "import": "Import",
                "export": "Export",
                "add": "Add",
                "save": "Save",
                "summary": "Summary",
                "reset": "Reset"
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
                "watchlist": "Lista e Vëzhgimit",
                "pension": "Pensioni",
                "calculators": "Kalkulatorë",
                "stockTracker": "Ndjekësi i Performancës së Aksioneve",
                "settings": "Cilësimet"
            },
            "portfolio": {
                "actions": {
                "addInvestment": "Shto Investim",
                "getLastPrice": "Merr Çmimin e Fundit",
                "transactionHistory": "Historia e Transaksioneve",
                "addPortfolio": "Shto Portofol",
                "removePortfolio": "Hiq Portofol",
                "showInSummary": "Shfaq në Përmbledhje",
                "edit": "Redakto",
                "delete": "Fshi"
                },
                "table": {
                "ticker": "Simboli",
                "currency": "Monedha",
                "name": "Emri",
                "purchasePrice": "Çmimi i Blerjes",
                "principal": "Kapitali",
                "quantity": "Sasia",
                "lastPrice": "Çmimi i Fundit",
                "purchaseDate": "Data e Blerjes",
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
                },
                "dialogs": {
                "addInvestment": { "title": "Shto Investim" },
                "editInvestment": { "title": "Redakto Investimin", "selectRecord": "Zgjidh Regjistrimin" },
                "totalValue": "Vlera Totale",
                "saveAddAnother": "Ruaj & Shto Tjetër"
                }
            },
            "watchlist": {
                "title": "Lista e Vëzhgimit",
                "actions": {
                    "addStock": "Shto Aksion",
                    "getLastPrice": "Merr Çmimin e Fundit",
                    "delete": "Fshi"
                },
                "table": {
                    "ticker": "Simboli",
                    "name": "Emri",
                    "currency": "Monedha",
                    "currentPrice": "Çmimi Aktual",
                    "change": "Ndryshimi",
                    "changePct": "Ndryshimi %",
                    "high": "Më i Larti",
                    "low": "Më i Ulëti",
                    "range": "Diapazon",
                    "open": "Çmimi i Hapjes",
                    "prevClose": "Mbyllja e Mëparshme",
                    "lastUpdate": "Përditësimi i Fundit",
                    "actions": "Veprimet"
                },
                "dialogs": {
                    "addStock": { "title": "Shto Aksion" },
                    "deleteStock": "Ta fshij këtë aksion?"
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
                    "ytdPct": "YTD %",
                    "totalPL": "Fitimi/Humbja Totale",
                    "totalPct": "% Totale",
                    "actions": "Veprimet"
                },
                "summaryCards": {
                    "totalValue": "Vlera Totale",
                    "currentCAGR": "CAGR Aktual",
                    "bestMonth": "Muaji Më i Mirë",
                    "worstMonth": "Muaji Më i Keq",
                    "bestYear": "Viti Më i Mirë",
                    "worstYear": "Viti Më i Keq"
                },
                "dialogs": {
                    "new": {
                        "title": "Pension i Ri",
                        "type": "Lloji",
                        "startingValue": "Vlera Fillestare",
                        "options": {
                            "growth": "Vetëm Rritje",
                            "payments": "Rritje me Pagesa"
                        }
                    },
                    "editEntry": {
                        "title": "Ndrysho Shënimin"
                    }
                },
                "chart": {
                    "title": "Grafiku i Pensionit"
                }
            },
            "calculators": {
                "title": "Kalkulatorë financiarë",
                "tabs": {
                    "loan": "Kalkulator i huasë",
                    "investment": "Kalkulator investimesh",
                    "cagr": "Kalkulator CAGR",
                    "mortgage": "Kalkulator hipotekor",
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
                        "monthlyContribution": "Kontributi Mujor",
                        "rate": "Norma e kthimit vjetor (%)",
                        "years": "Periudha e investimit (Vite)",
                    },
                    "results": {
                        "investedValue": "Vlera e Investuar:",
                        "growthValue": "Vlera e Rritjes:",
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
                "mortgage": {
                    "labels": {
                        "propertyPrice": "Çmimi i pronës",
                        "deposit": "Depozita",
                        "amount": "Shuma e hipotekës",
                        "rate": "Norma e interesit të hipotekës (%)",
                        "term": "Afati i hipotekës (Vite)"
                    },
                    "results": {
                        "monthlyPayment": "Pagesa mujore:",
                        "averageInterestPortion": "Pjesa mesatare e interesit për pagesë:",
                        "averagePrincipalPortion": "Pjesa mesatare e principalit për pagesë:",
                        "totalAmount": "Shuma totale e shlyer:",
                        "totalInterest": "Interesi total i paguar:",
                        "totalPrincipal": "Principali total i shlyer:"
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
                    "title": "Grafiku i Aksioneve",
                    "price": "Çmim",
                    "growth": "Rritje"
                }
            },
            "settings": {
                "title": "Cilësimet",
                "baseCurrency": "Monedha Bazë",
                "baseCurrencyHint": "Kursi i këmbimit rifreskohet një herë në ditë për të mbajtur totalet të sakta.",
                "sectionTitles": {
                "display": "Pamja",
                "language": "Gjuha",
                "pension": "Pensioni",
                "portfolio": "Portofoli",
                "watchlist": "Lista e Vëzhgimit",
                "stockTracker": "Ndjekësi i Performancës së Aksioneve",
                "about": "Rreth"
                },
                "quotesApi": "API e Kuotave",
                "finnhubApiKey": "Çelësi API i Finnhub",
                "finnhubApiKeyHint": "Krijoni një çelës API falas në",
                "realTimeQuotes": "Përdoret për kuota në kohë reale. Ruhet lokalisht në shfletuesin tuaj.",
                "showApiKey": "Shfaq çelësin API",
                "exportPensions": "Eksporto Pensionet",
                "importPensions": "Importo Pensionet",
                "deletePensions": "Fshi Pensionet",
                "exportPortfolio": "Eksporto Portofolin",
                  "importPortfolio": "Importo Portofolin",
                  "deletePortfolio": "Fshi Portofolin",
                "exportWatchlist": "Eksporto Listën e Vëzhgimit",
                "importWatchlist": "Importo Listën e Vëzhgimit",
                "deleteWatchlist": "Fshi Listën e Vëzhgimit",
                "exportStock": "Eksporto të Dhënat e Aksioneve",
                "importStock": "Importo të Dhënat e Aksioneve",
                "deleteStock": "Fshi të Dhënat",
                "versionLabel": "Versioni i Aplikacionit Web",
                "languageLabel": "Gjuha",
                "exportLang": "Eksporto Gjuhën",
                "importLang": "Importo Gjuhën",
                "rtlToggle": "Aktivizo RTL",
                "fontSize": "Madhësia e shkronjave",
                "theme": "Tema",
                "themeSystem": "Sistemi",
                "themeLight": "E çelët",
                "themeDark": "E errët"
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
                "deleteAllWatchlist": "Të fshij të gjitha të dhënat e listës së vëzhgimit?",
                "deleteAllStock": "Të fshij të gjitha të dhënat e gjurmuesit të aksioneve?"
            },
            "common": {
                "format": "Formati",
                "file": "Skedari",
                "cancel": "Anulo",
                "import": "Importo",
                "export": "Eksporto",
                "add": "Shto",
                "save": "Ruaj",
                "summary": "Përmbledhje",
                "reset": "Rivendos"
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
                "watchlist": "Liste de surveillance",
                "pension": "Pension",
                "calculators": "Calculatrices",
                "stockTracker": "Suivi de Performance des Actions",
                "settings": "Paramètres"
            },
            "portfolio": {
                "actions": {
                "addInvestment": "Ajouter un Investissement",
                "getLastPrice": "Obtenir le Dernier Prix",
                "transactionHistory": "Historique des Transactions",
                "addPortfolio": "Ajouter un Portefeuille",
                "removePortfolio": "Supprimer le Portefeuille",
                "showInSummary": "Afficher dans le Résumé",
                "edit": "Modifier",
                "delete": "Supprimer"
                },
                "table": {
                "ticker": "Symbole",
                "currency": "Devise",
                "name": "Nom",
                "purchasePrice": "Prix d'Achat",
                "principal": "Capital",
                "quantity": "Quantité",
                "lastPrice": "Dernier Prix",
                "purchaseDate": "Date d'Achat",
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
                },
                "dialogs": {
                "addInvestment": { "title": "Ajouter un Investissement" },
                "editInvestment": { "title": "Modifier l'investissement", "selectRecord": "Sélectionner l'enregistrement" },
                "totalValue": "Valeur Totale",
                "saveAddAnother": "Enregistrer et Ajouter un Autre"
                }
            },
            "watchlist": {
                "title": "Liste de surveillance",
                "actions": {
                    "addStock": "Ajouter une action",
                    "getLastPrice": "Obtenir le dernier prix",
                    "delete": "Supprimer"
                },
                "table": {
                    "ticker": "Symbole",
                    "name": "Nom",
                    "currency": "Devise",
                    "currentPrice": "Prix actuel",
                    "change": "Changement",
                    "changePct": "Changement %",
                    "high": "Haut",
                    "low": "Bas",
                    "range": "Écart",
                    "open": "Prix d'ouverture",
                    "prevClose": "Clôture précédente",
                    "lastUpdate": "Dernière mise à jour",
                    "actions": "Actions"
                },
                "dialogs": {
                    "addStock": { "title": "Ajouter une action" },
                    "deleteStock": "Supprimer cette action ?",
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
                    "ytdPct": "YTD %",
                    "totalPL": "P&L Total",
                    "totalPct": "% Total",
                    "actions": "Actions"
                },
                "summaryCards": {
                    "totalValue": "Valeur Totale",
                    "currentCAGR": "CAGR Actuel",
                    "bestMonth": "Meilleur Mois",
                    "worstMonth": "Pire Mois",
                    "bestYear": "Meilleure Année",
                    "worstYear": "Pire Année"
                },
                "dialogs": {
                    "new": {
                        "title": "Nouvelle Pension",
                        "type": "Type",
                        "startingValue": "Valeur Initiale",
                        "options": {
                            "growth": "Croissance seule",
                            "payments": "Croissance avec versements"
                        }
                    },
                    "editEntry": {
                        "title": "Modifier l'entrée"
                    }
                },
                "chart": {
                    "title": "Graphique de Pension"
                }
            },
            "calculators": {
                "title": "Calculatrices financières",
                "tabs": {
                    "loan": "Calculateur de prêt",
                    "investment": "Calculateur d'investissement",
                    "cagr": "Calculateur de TCAC",
                    "mortgage": "Calculateur hypothécaire",
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
                        "monthlyContribution": "Contribution mensuelle",
                        "rate": "Taux de rendement annuel (%)",
                        "years": "Période d'investissement (années)",
                    },
                    "results": {
                        "investedValue": "Valeur investie:",
                        "growthValue": "Valeur de croissance:",
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
                "mortgage": {
                    "labels": {
                        "propertyPrice": "Prix du bien",
                        "deposit": "Apport",
                        "amount": "Montant de l'hypothèque",
                        "rate": "Taux d'intérêt hypothécaire (%)",
                        "term": "Durée de l'hypothèque (années)"
                    },
                    "results": {
                        "monthlyPayment": "Paiement mensuel:",
                        "averageInterestPortion": "Part moyenne d'intérêt par paiement:",
                        "averagePrincipalPortion": "Part moyenne de capital par paiement:",
                        "totalAmount": "Montant total remboursé:",
                        "totalInterest": "Intérêts totaux payés:",
                        "totalPrincipal": "Capital total remboursé:"
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
                    "title": "Graphique Boursier",
                    "price": "Prix",
                    "growth": "Croissance"
                }
            },
            "settings": {
                "title": "Paramètres",
                "baseCurrency": "Devise de Base",
                "baseCurrencyHint": "Les taux de change sont mis à jour une fois par jour pour maintenir des totaux précis.",
                "sectionTitles": {
                "display": "Affichage",
                "language": "Langue",
                "pension": "Pension",
                "portfolio": "Portefeuille",
                "watchlist": "Liste de surveillance",
                "stockTracker": "Suivi de Performance des Actions",
                "about": "À propos"
                },
                "quotesApi": "API de Cotations",
                "finnhubApiKey": "Clé API Finnhub",
                "finnhubApiKeyHint": "Créez une clé API gratuite sur",
                "realTimeQuotes": "Utilisé pour les cotations en temps réel. Stocké localement dans votre navigateur.",
                "showApiKey": "Afficher la clé API",
                "exportPensions": "Exporter les Pensions",
                "importPensions": "Importer les Pensions",
                "deletePensions": "Supprimer les Pensions",
                  "exportPortfolio": "Exporter le Portefeuille",
                  "importPortfolio": "Importer le Portefeuille",
                  "deletePortfolio": "Supprimer le Portefeuille",
                "exportWatchlist": "Exporter la liste de surveillance",
                "importWatchlist": "Importer la liste de surveillance",
                "deleteWatchlist": "Supprimer la liste de surveillance",
                "exportStock": "Exporter les Données d'Actions",
                "importStock": "Importer les Données d'Actions",
                "deleteStock": "Supprimer les Données",
                "versionLabel": "Version de l’Application Web",
                "languageLabel": "Langue",
                "exportLang": "Exporter la Langue",
                "importLang": "Importer la Langue",
                "rtlToggle": "Activer RTL",
                "fontSize": "Taille de police",
                "theme": "Thème",
                "themeSystem": "Système",
                "themeLight": "Clair",
                "themeDark": "Sombre"
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
                "deleteAllWatchlist": "Supprimer toutes les données de la liste de surveillance ?",
                "deleteAllStock": "Supprimer toutes les données du suivi des actions ?"
            },
            "common": {
                "format": "Format",
                "file": "Fichier",
                "cancel": "Annuler",
                "import": "Importer",
                "export": "Exporter",
                "add": "Ajouter",
                "save": "Enregistrer",
                "summary": "Résumé",
                "reset": "Réinitialiser"
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
                "watchlist": "Beobachtungsliste",
                "pension": "Rente",
                "calculators": "Rechner",
                "stockTracker": "Aktien-Performance-Tracker",
                "settings": "Einstellungen"
            },
            "portfolio": {
                "actions": {
                "addInvestment": "Investition hinzufügen",
                "getLastPrice": "Letzten Preis abrufen",
                "transactionHistory": "Transaktionshistorie",
                "addPortfolio": "Portfolio hinzufügen",
                "removePortfolio": "Portfolio entfernen",
                "showInSummary": "In Zusammenfassung anzeigen",
                "edit": "Bearbeiten",
                "delete": "Löschen"
                },
                "table": {
                "ticker": "Ticker",
                "currency": "Währung",
                "name": "Name",
                "purchasePrice": "Kaufpreis",
                "principal": "Kapital",
                "quantity": "Menge",
                "lastPrice": "Letzter Preis",
                "purchaseDate": "Kaufdatum",
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
                },
                "dialogs": {
                "addInvestment": { "title": "Investition hinzufügen" },
                "editInvestment": { "title": "Investition bearbeiten", "selectRecord": "Datensatz auswählen" },
                "totalValue": "Gesamtwert",
                "saveAddAnother": "Speichern & Weiteres hinzufügen"
                }
            },
            "watchlist": {
                "title": "Beobachtungsliste",
                "actions": {
                    "addStock": "Aktie hinzufügen",
                    "getLastPrice": "Letzten Preis abrufen",
                    "delete": "Löschen"
                },
                "table": {
                    "ticker": "Ticker",
                    "name": "Name",
                    "currency": "Währung",
                    "currentPrice": "Aktueller Preis",
                    "change": "Veränderung",
                    "changePct": "Veränderung %",
                    "high": "Hoch",
                    "low": "Tief",
                    "range": "Spanne",
                    "open": "Eröffnungspreis",
                    "prevClose": "Vorheriger Schluss",
                    "lastUpdate": "Letzte Aktualisierung",
                    "actions": "Aktionen"
                },
                "dialogs": {
                    "addStock": { "title": "Aktie hinzufügen" },
                    "deleteStock": "Diese Aktie löschen?",
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
                    "totalValue": "Gesamtwert",
                    "currentCAGR": "Aktueller CAGR",
                    "bestMonth": "Bester Monat",
                    "worstMonth": "Schlechtester Monat",
                    "bestYear": "Bestes Jahr",
                    "worstYear": "Schlechtestes Jahr"
                },
                "dialogs": {
                    "new": {
                        "title": "Neue Rente",
                        "type": "Typ",
                        "startingValue": "Startwert",
                        "options": {
                            "growth": "Nur Wachstum",
                            "payments": "Wachstum mit Einzahlungen"
                        }
                    },
                    "editEntry": {
                        "title": "Eintrag bearbeiten"
                    }
                },
                "chart": {
                    "title": "Rentendiagramm"
                }
            },
            "calculators": {
                "title": "Finanzrechner",
                "tabs": {
                    "loan": "Kreditrechner",
                    "investment": "Investmentrechner",
                    "cagr": "CAGR-Rechner",
                    "mortgage": "Hypothekenrechner",
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
                        "monthlyContribution": "Monatlicher Beitrag",
                        "rate": "Jährliche Rendite (%)",
                        "years": "Anlagezeitraum (Jahre)",
                    },
                    "results": {
                        "investedValue": "Investierter Betrag:",
                        "growthValue": "Wertzuwachs:",
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
                "mortgage": {
                    "labels": {
                        "propertyPrice": "Immobilienpreis",
                        "deposit": "Anzahlung",
                        "amount": "Hypothekenbetrag",
                        "rate": "Hypothekenzinssatz (%)",
                        "term": "Hypothekenlaufzeit (Jahre)"
                    },
                    "results": {
                        "monthlyPayment": "Monatliche Zahlung:",
                        "averageInterestPortion": "Durchschnittlicher Zinsanteil pro Zahlung:",
                        "averagePrincipalPortion": "Durchschnittlicher Tilgungsanteil pro Zahlung:",
                        "totalAmount": "Gesamtsumme zurückgezahlt:",
                        "totalInterest": "Gesamtzins gezahlt:",
                        "totalPrincipal": "Gesamter getilgter Betrag:"
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
                    "title": "Aktienchart",
                    "price": "Preis",
                    "growth": "Wachstum"
                }
            },
            "settings": {
                "title": "Einstellungen",
                "baseCurrency": "Basiswährung",
                "baseCurrencyHint": "Wechselkurse werden einmal täglich aktualisiert, um genaue Summen sicherzustellen.",
                "sectionTitles": {
                "display": "Anzeige",
                "language": "Sprache",
                "pension": "Rente",
                "portfolio": "Portfolio",
                "watchlist": "Beobachtungsliste",
                "stockTracker": "Aktien-Performance-Tracker",
                "about": "Über"
                },
                "quotesApi": "Kursdaten-API",
                "finnhubApiKey": "Finnhub-API-Schlüssel",
                "finnhubApiKeyHint": "Erstellen Sie einen kostenlosen API-Schlüssel auf",
                "realTimeQuotes": "Wird für Echtzeitkurse verwendet. Lokal in Ihrem Browser gespeichert.",
                "showApiKey": "API-Schlüssel anzeigen",
                "exportPensions": "Renten exportieren",
                "importPensions": "Renten importieren",
                "deletePensions": "Renten löschen",
                  "exportPortfolio": "Portfolio exportieren",
                  "importPortfolio": "Portfolio importieren",
                  "deletePortfolio": "Portfolio löschen",
                "exportWatchlist": "Beobachtungsliste exportieren",
                "importWatchlist": "Beobachtungsliste importieren",
                "deleteWatchlist": "Beobachtungsliste löschen",
                "exportStock": "Aktien-Daten exportieren",
                "importStock": "Aktien-Daten importieren",
                "deleteStock": "Daten löschen",
                "versionLabel": "Web-App-Version",
                "languageLabel": "Sprache",
                "exportLang": "Sprache exportieren",
                "importLang": "Sprache importieren",
                "rtlToggle": "RTL aktivieren",
                "fontSize": "Schriftgröße",
                "theme": "Design",
                "themeSystem": "System",
                "themeLight": "Hell",
                "themeDark": "Dunkel"
            },
            "dialog": {
                "yes": "Ja",
                "no": "Nein",
                "close": "SchlieÙen",
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
                "deleteAllWatchlist": "Alle Beobachtungsliste-Daten löschen?",
                "deleteAllStock": "Alle Daten des Aktien-Trackers löschen?"
            },
            "common": {
                "format": "Format",
                "file": "Datei",
                "cancel": "Abbrechen",
                "import": "Importieren",
                "export": "Exportieren",
                "add": "Hinzufügen",
                "save": "Speichern",
                "summary": "Zusammenfassung",
                "reset": "Zurücksetzen"
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
                "watchlist": "Lista de seguimiento",
                "pension": "Pensión",
                "calculators": "Calculadoras",
                "stockTracker": "Rastreador de Rendimiento de Acciones",
                "settings": "Configuración"
            },
            "portfolio": {
                "actions": {
                "addInvestment": "Agregar Inversión",
                "getLastPrice": "Obtener el Último Precio",
                "transactionHistory": "Historial de Transacciones",
                "addPortfolio": "Agregar Cartera",
                "removePortfolio": "Eliminar Cartera",
                "showInSummary": "Mostrar en el Resumen",
                "edit": "Editeazăr",
                "delete": "Eliminar"
                },
                "table": {
                "ticker": "Símbolo",
                "currency": "Moneda",
                "name": "Nombre",
                "purchasePrice": "Precio de Compra",
                "principal": "Capital",
                "quantity": "Cantidad",
                "lastPrice": "Último Precio",
                "purchaseDate": "Fecha de Compra",
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
                },
                "dialogs": {
                "addInvestment": { "title": "Agregar Inversión" },
                "editInvestment": { "title": "Editeazăr Inversión", "selectRecord": "Seleccionar registro" },
                "totalValue": "Valor Total",
                "saveAddAnother": "Guardar y Añadir Otro"
                }
            },
            "watchlist": {
                "title": "Lista de seguimiento",
                "actions": {
                    "addStock": "Agregar acción",
                    "getLastPrice": "Obtener el último precio",
                    "delete": "Eliminar"
                },
                "table": {
                    "ticker": "Símbolo",
                    "name": "Nombre",
                    "currency": "Moneda",
                    "currentPrice": "Precio actual",
                    "change": "Cambio",
                    "changePct": "Cambio %",
                    "high": "Alto",
                    "low": "Bajo",
                    "range": "Rango",
                    "open": "Precio de apertura",
                    "prevClose": "Cierre previo",
                    "lastUpdate": "Última actualización",
                    "actions": "Acciones"
                },
                "dialogs": {
                    "addStock": { "title": "Agregar acción" },
                    "deleteStock": "¿Eliminar esta acción?",
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
                    "ytdPct": "YTD %",
                    "totalPL": "P&L Total",
                    "totalPct": "% Total",
                    "actions": "Acciones"
                },
                "summaryCards": {
                    "totalValue": "Valor Total",
                    "currentCAGR": "CAGR Actual",
                    "bestMonth": "Mejor Mes",
                    "worstMonth": "Peor Mes",
                    "bestYear": "Mejor Año",
                    "worstYear": "Peor Año"
                },
                "dialogs": {
                    "new": {
                        "title": "Nueva Pensión",
                        "type": "Tipo",
                        "startingValue": "Valor Inicial",
                        "options": {
                            "growth": "Solo Crecimiento",
                            "payments": "Crecimiento con Pagos"
                        }
                    },
                    "editEntry": {
                        "title": "Editeazăr Entrada"
                    }
                },
                "chart": {
                    "title": "Gráfico de Pensión"
                }
            },
            "calculators": {
                "title": "Calculadoras financieras",
                "tabs": {
                    "loan": "Calculadora de préstamos",
                    "investment": "Calculadora de inversiones",
                    "cagr": "Calculadora CAGR",
                    "mortgage": "Calculadora hipotecaria",
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
                        "monthlyContribution": "Contribución mensual",
                        "rate": "Tasa de retorno anual (%)",
                        "years": "Periodo de inversión (años)",
                    },
                    "results": {
                        "investedValue": "Valor invertido:",
                        "growthValue": "Valor de crecimiento:",
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
                "mortgage": {
                    "labels": {
                        "propertyPrice": "Precio de la propiedad",
                        "deposit": "Depósito",
                        "amount": "Monto de la hipoteca",
                        "rate": "Tasa de interés hipotecario (%)",
                        "term": "Plazo de la hipoteca (años)"
                    },
                    "results": {
                        "monthlyPayment": "Pago mensual:",
                        "averageInterestPortion": "Porción promedio de interés por pago:",
                        "averagePrincipalPortion": "Porción promedio de capital por pago:",
                        "totalAmount": "Monto total pagado:",
                        "totalInterest": "Interés total pagado:",
                        "totalPrincipal": "Capital total pagado:"
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
                    "edit": "Editeazăr",
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
                    "title": "Gráfico de Acciones",
                    "price": "Precio",
                    "growth": "Crecimiento"
                }
            },
            "settings": {
                "title": "Configuración",
                "baseCurrency": "Moneda Base",
                "baseCurrencyHint": "Los tipos de cambio se actualizan una vez al día para mantener totales precisos.",
                "sectionTitles": {
                "display": "Visualización",
                "language": "Idioma",
                "pension": "Pensión",
                "portfolio": "Cartera",
                "watchlist": "Lista de seguimiento",
                "stockTracker": "Rastreador de Rendimiento de Acciones",
                "about": "Acerca de"
                },
                "quotesApi": "API de Cotizaciones",
                "finnhubApiKey": "Clave API de Finnhub",
                "finnhubApiKeyHint": "Crea una clave API gratuita en",
                "realTimeQuotes": "Se usa para cotizaciones en tiempo real. Se guarda localmente en tu navegador.",
                "showApiKey": "Mostrar clave API",
                "exportPensions": "Exportar Pensiones",
                "importPensions": "Importar Pensiones",
                "deletePensions": "Eliminar Pensiones",
                  "exportPortfolio": "Exportar Cartera",
                  "importPortfolio": "Importar Cartera",
                  "deletePortfolio": "Eliminar Cartera",
                "exportWatchlist": "Exportar lista de seguimiento",
                "importWatchlist": "Importar lista de seguimiento",
                "deleteWatchlist": "Eliminar lista de seguimiento",
                "exportStock": "Exportar Datos de Acciones",
                "importStock": "Importar Datos de Acciones",
                "deleteStock": "Eliminar Datos",
                "versionLabel": "Versión de la Aplicación Web",
                "languageLabel": "Idioma",
                "exportLang": "Exportar Idioma",
                "importLang": "Importar Idioma",
                "rtlToggle": "Habilitar RTL",
                "fontSize": "Tamaño de fuente",
                "theme": "Tema",
                "themeSystem": "Sistema",
                "themeLight": "Claro",
                "themeDark": "Oscuro"
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
                "deleteAllWatchlist": "¿Eliminar todos los datos de la lista de seguimiento?",
                "deleteAllStock": "¿Eliminar todos los datos del rastreador de acciones?"
            },
            "common": {
                "format": "Formato",
                "file": "Archivo",
                "cancel": "Cancelar",
                "import": "Importar",
                "export": "Exportar",
                "add": "Añadir",
                "save": "Guardar",
                "summary": "Resumen",
                "reset": "Restablecer"
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
                "watchlist": "Lista di osservazione",
                "pension": "Pensione",
                "calculators": "Calcolatrici",
                "stockTracker": "Tracker delle Prestazioni Azionarie",
                "settings": "Impostazioni"
            },
            "portfolio": {
                "actions": {
                "addInvestment": "Aggiungi Investimento",
                "getLastPrice": "Ottieni l'Ultimo Prezzo",
                "transactionHistory": "Storico delle Transazioni",
                "addPortfolio": "Aggiungi Portafoglio",
                "removePortfolio": "Rimuovi Portafoglio",
                "showInSummary": "Mostra nel Riepilogo",
                "edit": "Modifica",
                "delete": "Elimina"
                },
                "table": {
                "ticker": "Simbolo",
                "currency": "Valuta",
                "name": "Nome",
                "purchasePrice": "Prezzo di Acquisto",
                "principal": "Capitale",
                "quantity": "Quantità",
                "lastPrice": "Ultimo Prezzo",
                "purchaseDate": "Data di Acquisto",
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
                },
                "dialogs": {
                "addInvestment": { "title": "Aggiungi Investimento" },
                "editInvestment": { "title": "Modifica Investimento", "selectRecord": "Seleziona record" },
                "totalValue": "Valore Totale",
                "saveAddAnother": "Salva e Aggiungi Un Altro"
                }
            },
            "watchlist": {
                "title": "Lista di osservazione",
                "actions": {
                    "addStock": "Aggiungi titolo",
                    "getLastPrice": "Ottieni l'ultimo prezzo",
                    "delete": "Elimina"
                },
                "table": {
                    "ticker": "Ticker",
                    "name": "Nome",
                    "currency": "Valuta",
                    "currentPrice": "Prezzo attuale",
                    "change": "Variazione",
                    "changePct": "Variazione %",
                    "high": "Massimo",
                    "low": "Minimo",
                    "range": "Intervallo",
                    "open": "Prezzo di apertura",
                    "prevClose": "Chiusura precedente",
                    "lastUpdate": "Ultimo aggiornamento",
                    "actions": "Azioni"
                },
                "dialogs": {
                    "addStock": { "title": "Aggiungi titolo" },
                    "deleteStock": "Eliminare questa azione?",
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
                    "ytdPct": "YTD %",
                    "totalPL": "Utile/Perdita Totale",
                    "totalPct": "% Totale",
                    "actions": "Azioni"
                },
                "summaryCards": {
                    "totalValue": "Valore Totale",
                    "currentCAGR": "CAGR Attuale",
                    "bestMonth": "Mese Migliore",
                    "worstMonth": "Mese Peggiore",
                    "bestYear": "Anno Migliore",
                    "worstYear": "Anno Peggiore"
                },
                "dialogs": {
                    "new": {
                        "title": "Nuova Pensione",
                        "type": "Tipo",
                        "startingValue": "Valore Iniziale",
                        "options": {
                            "growth": "Solo Crescita",
                            "payments": "Crescita con Versamenti"
                        }
                    },
                    "editEntry": {
                        "title": "Modifica Voce"
                    }
                },
                "chart": {
                    "title": "Grafico Pensione"
                }
            },
            "calculators": {
                "title": "Calcolatori finanziari",
                "tabs": {
                    "loan": "Calcolatore del prestito",
                    "investment": "Calcolatore di investimento",
                    "cagr": "Calcolatore CAGR",
                    "mortgage": "Calcolatrice mutuo",
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
                        "monthlyContribution": "Contributo mensile",
                        "rate": "Tasso di rendimento annuale (%)",
                        "years": "Periodo di investimento (anni)",
                    },
                    "results": {
                        "investedValue": "Valore investito:",
                        "growthValue": "Valore di crescita:",
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
                "mortgage": {
                    "labels": {
                        "propertyPrice": "Prezzo dell'immobile",
                        "deposit": "Acconto",
                        "amount": "Importo del mutuo",
                        "rate": "Tasso di interesse del mutuo (%)",
                        "term": "Durata del mutuo (anni)"
                    },
                    "results": {
                        "monthlyPayment": "Rata mensile:",
                        "averageInterestPortion": "Quota media di interessi per rata:",
                        "averagePrincipalPortion": "Quota media di capitale per rata:",
                        "totalAmount": "Importo totale rimborsato:",
                        "totalInterest": "Interessi totali pagati:",
                        "totalPrincipal": "Capitale totale rimborsato:"
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
                    "title": "Grafico Azioni",
                    "price": "Prezzo",
                    "growth": "Crescita"
                }
            },
            "settings": {
                "title": "Impostazioni",
                "baseCurrency": "Valuta Base",
                "baseCurrencyHint": "I tassi di cambio si aggiornano una volta al giorno per mantenere totali accurati.",
                "sectionTitles": {
                "display": "Visualizzazione",
                "language": "Lingua",
                "pension": "Pensione",
                "portfolio": "Portafoglio",
                "watchlist": "Lista di controllo",
                "stockTracker": "Tracker delle Prestazioni Azionarie",
                "about": "Informazioni"
                },
                "quotesApi": "API di Quotazioni",
                "finnhubApiKey": "Chiave API Finnhub",
                "finnhubApiKeyHint": "Crea una chiave API gratuita su",
                "realTimeQuotes": "Utilizzata per quotazioni in tempo reale. Salvata localmente nel tuo browser.",
                "showApiKey": "Mostra chiave API",
                "exportPensions": "Esporta Pensioni",
                "importPensions": "Importa Pensioni",
                "deletePensions": "Elimina Pensioni",
                  "exportPortfolio": "Esporta Portafoglio",
                  "importPortfolio": "Importa Portafoglio",
                  "deletePortfolio": "Elimina Portafoglio",
                "exportWatchlist": "Esporta lista di controllo",
                "importWatchlist": "Importa lista di controllo",
                "deleteWatchlist": "Elimina lista di controllo",
                "exportStock": "Esporta Dati Azionari",
                "importStock": "Importa Dati Azionari",
                "deleteStock": "Elimina Dati",
                "versionLabel": "Versione Web App",
                "languageLabel": "Lingua",
                "exportLang": "Esporta Lingua",
                "importLang": "Importa Lingua",
                "rtlToggle": "Abilita RTL",
                "fontSize": "Dimensione carattere",
                "theme": "Tema",
                "themeSystem": "Sistema",
                "themeLight": "Chiaro",
                "themeDark": "Scuro"
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
                "deleteAllWatchlist": "Eliminare tutti i dati della lista di controllo?",
                "deleteAllStock": "Eliminare tutti i dati del tracker azionario?"
            },
            "common": {
                "format": "Formato",
                "file": "File",
                "cancel": "Annulla",
                "import": "Importa",
                "export": "Esporta",
                "add": "Aggiungi",
                "save": "Salva",
                "summary": "Riepilogo",
                "reset": "Reimposta"
            }
        },

        "ro": {
            "header": {
                "title": "Tablou de bord financiar",
                "tagline": "Instrument de urmărire a investițiilor personale și planificare financiară"
            },
            "market": {
                "pre": "Pre-piață",
                "status": "Starea pieței",
                "after": "După piață"
            },
            "nav": {
                "portfolio": "Portofoliu",
                "watchlist": "Listă de urmărire",
                "pension": "Pensiune",
                "calculators": "Calculatoare",
                "stockTracker": "Monitorizare performanță acțiuni",
                "settings": "Setări"
            },
            "portfolio": {
                "actions": {
                    "addInvestment": "Adaugă investiție",
                    "getLastPrice": "Obține ultimul preț",
                    "transactionHistory": "Istoricul tranzacțiilor",
                    "addPortfolio": "Adaugă portofoliu",
                    "removePortfolio": "Elimină portofoliul",
                    "showInSummary": "Afișează în rezumat",
                    "edit": "Editează",
                    "delete": "Șterge"
                },
                "table": {
                    "ticker": "Ticker",
                    "currency": "Valută",
                    "name": "Nume",
                    "purchasePrice": "Prețul de cumpărare",
                    "principal": "Principal",
                    "quantity": "Cantitate",
                    "lastPrice": "Ultimul preț",
                    "purchaseDate": "Data achiziției",
                    "value": "Valoare",
                    "pl": "P&L",
                    "plPct": "P&L %",
                    "actions": "Acțiuni"
                },
                "total": "Total",
                "charts": {
                    "investmentSpread": "RăspÚndire a investițiilor",
                    "plpct": "P&L%",
                    "stats": "Statistici de portofoliu",
                    "cagr": "CAGR",
                    "bestTicker": "Cel mai bun ticker",
                    "tickerCAGR": "Ticker CAGR",
                    "years": "Ani"
                },
                "dialogs": {
                    "addInvestment": {
                        "title": "Adaugă investiție"
                    },
                    "editInvestment": {
                        "title": "Editează investiția",
                        "selectRecord": "Selectați înregistrare"
                    },
                    "totalValue": "Valoare totală",
                    "saveAddAnother": "Salvați și adăugați altul"
                }
            },
            "watchlist": {
                "title": "Listă de urmărire",
                "actions": {
                    "addStock": "Adaugă acțiune",
                    "getLastPrice": "Obține ultimul preț",
                    "delete": "Șterge"
                },
                "table": {
                    "ticker": "Simbol",
                    "name": "Nume",
                    "currency": "Monedă",
                    "currentPrice": "Preț curent",
                    "change": "Schimbare",
                    "changePct": "Schimbare %",
                    "high": "Maxim",
                    "low": "Minim",
                    "range": "Interval",
                    "open": "Preț de deschidere",
                    "prevClose": "Închidere anterioară",
                    "lastUpdate": "Ultima actualizare",
                    "actions": "Acțiuni"
                },
                "dialogs": {
                    "addStock": { "title": "Adaugă acțiune" },
                    "deleteStock": "Ștergeți această acțiune?",
                }
            },
            "pension": {
                "title": "Pensiune",
                "actions": {
                    "addEntry": "Adaugă intrare",
                    "addPension": "Adaugă pensie",
                    "removePension": "Elimină pensia",
                    "viewChart": "Afișează grafic",
                    "showInSummary": "Afișează în rezumat"
                },
                "table": {
                    "date": "Data",
                    "payment": "Plată",
                    "totalPayments": "Total plăți",
                    "currentValue": "Valoarea curentă",
                    "monthlyPL": "P&L lunar",
                    "monthlyPct": "% lunar",
                    "ytdPL": "YTD P&L",
                    "ytdPct": "YTD %",
                    "totalPL": "Total P&L",
                    "totalPct": "Total %",
                    "actions": "Acțiuni"
                },
                "summaryCards": {
                    "totalValue": "Valoare totală",
                    "currentCAGR": "CAGR curent",
                    "bestMonth": "Cea mai bună lună",
                    "worstMonth": "Cea mai slabă lună",
                    "bestYear": "Cel mai bun an",
                    "worstYear": "Cel mai slab an"
                },
                "dialogs": {
                    "new": {
                        "title": "Pensie nouă",
                        "type": "Tip",
                        "startingValue": "Valoare de pornire",
                        "options": {
                            "growth": "Doar creștere",
                            "payments": "Creștere cu plăți"
                        }
                    },
                    "editEntry": {
                        "title": "Editeazăți intrarea"
                    }
                },
                "chart": {
                    "title": "Grafic de pensii"
                }
            },
            "calculators": {
                "title": "Calculatoare financiare",
                "tabs": {
                    "loan": "Calculator de împrumut",
                    "investment": "Calculator de investiții",
                    "cagr": "Calculator CAGR",
                    "mortgage": "Calculator ipotecar",
                    "fairValue": "Calculator de valoare justă"
                },
                "loan": {
                    "labels": {
                        "principal": "Suma principală",
                        "rate": "Rata dobÚnzii anuale (%)",
                        "term": "Termen de împrumut (ani)"
                    },
                    "results": {
                        "monthlyPayment": "Plata lunară:",
                        "totalInterest": "DobÚndă totală:",
                        "totalAmount": "Valoare totală:"
                    }
                },
                "investment": {
                    "labels": {
                        "initial": "Investiție inițială",
                        "monthlyContribution": "Contribuție lunară",
                        "rate": "Rata anuală de rentabilitate (%)",
                        "years": "Perioada de investiții (ani)"
                    },
                    "results": {
                        "investedValue": "Valoare investită:",
                        "growthValue": "Valoare de creștere:",
                        "finalValue": "Valoarea finală:"
                    },
                    "table": {
                        "year": "An",
                        "growth": "Creștere",
                        "value": "Valoare",
                        "start": "Început"
                    }
                },
                "cagr": {
                    "labels": {
                        "beginning": "Valoarea de început ($)",
                        "ending": "Valoarea de încheiere ($)",
                        "years": "Numărul de ani"
                    },
                    "results": {
                        "totalReturn": "Returnare totală:",
                        "cagr": "Rata anuală de creștere compusă (CAGR):"
                    }
                },
                "mortgage": {
                    "labels": {
                        "propertyPrice": "Prețul proprietății",
                        "deposit": "Avans",
                        "amount": "Valoarea ipotecii",
                        "rate": "Rata dobânzii ipotecare (%)",
                        "term": "Durata ipotecii (ani)"
                    },
                    "results": {
                        "monthlyPayment": "Plată lunară:",
                        "averageInterestPortion": "Partea medie de dobândă per plată:",
                        "averagePrincipalPortion": "Partea medie de principal per plată:",
                        "totalAmount": "Suma totală rambursată:",
                        "totalInterest": "Dobândă totală plătită:",
                        "totalPrincipal": "Principal total rambursat:"
                    }
                },
                "fairValue": {
                    "tabs": {
                        "dcf": "Analiza DCF",
                        "pe": "Analiza raportului P/E.",
                        "intrinsic": "Valoare intrinsecă"
                    },
                    "dcf": {
                        "title": "Analiza fluxului de numerar redus (DCF)",
                        "labels": {
                            "currentFCF": "Fluxul anual de numerar gratuit anual",
                            "growthRate": "Rata de creștere (%)",
                            "terminalRate": "Rata de creștere a terminalului (%)",
                            "discountRate": "Rata de actualizare (WACC) (%)",
                            "years": "Ani de proiecție",
                            "shares": "Acțiuni restante (M)"
                        },
                        "results": {
                            "enterpriseValue": "Valoarea întreprinderii:",
                            "pvCashflows": "Valoarea actuală a fluxurilor de numerar:",
                            "terminalValue": "Valoarea terminală:",
                            "perShare": "Valoare intrinsecă pe acțiune:"
                        }
                    },
                    "pe": {
                        "title": "Analiza raportului P/E.",
                        "labels": {
                            "currentPrice": "Prețul curent al acțiunilor ($)",
                            "eps": "CÚștiguri pe acțiune (EPS) ($)",
                            "industryPE": "Media industriei P/E.",
                            "growthRate": "Rata de creștere a EPS preconizată (%)"
                        },
                        "results": {
                            "currentPE": "Raport P/E curent:",
                            "fairValue": "Valoare justă (industria P/E):",
                            "pegRatio": "Raportul PEG:",
                            "valuation": "Stare de evaluare:"
                        }
                    },
                    "intrinsic": {
                        "title": "Analiza valorii intrinseci",
                        "labels": {
                            "bookValue": "Valoarea contabilă pe acțiune ($)",
                            "roe": "Returnarea capitalurilor proprii (ROE) (%)",
                            "dividendYield": "Randament de dividende (%)",
                            "requiredReturn": "Rata de rentabilitate necesară (%)",
                            "growthRate": "Rata de creștere durabilă (%)",
                            "eps": "EPS actual ($)"
                        },
                        "results": {
                            "graham": "Numărul Graham:",
                            "ddm": "Model de reducere a dividendelor:",
                            "bookMultiple": "Valoarea contabilă multiplă:",
                            "average": "Valoare intrinsecă medie:"
                        }
                    }
                }
            },
            "stockTracker": {
                "title": "Monitorizare performanță acțiuni",
                "actions": {
                    "edit": "Editează",
                    "getLastPrice": "Obține ultimul preț",
                    "addTicker": "Adăugați căpușa",
                    "generateTable": "Generați tabel",
                    "done": "Făcut"
                },
                "labels": {
                    "addStockTicker": "Adăugați ticker de stoc",
                    "startYear": "ÎncepÚnd cu anul"
                },
                "table": {
                    "year": "An",
                    "totalGrowth": "Creștere totală",
                    "cagr": "CAGR",
                    "chart": "Diagramă"
                },
                "summary": {
                    "investment": "Analiza investițiilor",
                    "best": "Cel mai bun interpret",
                    "worst": "Cel mai rău interpret",
                    "consistent": "Cel mai consecvent"
                },
                "chart": {
                    "title": "Grafic de stocuri",
                    "price": "Preț",
                    "growth": "Creștere"
                }
            },
            "settings": {
                "title": "Setări",
                "baseCurrency": "Moneda de bază",
                "baseCurrencyHint": "Reîmprospătarea ratelor de schimb o dată pe zi pentru a menține totalul exact.",
                "sectionTitles": {
                    "display": "Afișare",
                    "language": "Limbă",
                    "pension": "Pensiune",
                    "portfolio": "Portofoliu",
                    "watchlist": "Lista de urmărire",
                    "stockTracker": "Monitorizare performanță acțiuni",
                    "about": "Despre"
                },
                "quotesApi": "Citate API",
                "finnhubApiKey": "Cheia API Finnhub",
                "finnhubApiKeyHint": "Creați o cheie API gratuită la",
                "realTimeQuotes": "Folosit pentru citate în timp real. Stocat local în browserul dvs.",
                "showApiKey": "Afișați cheia API",
                "exportPensions": "Pensii de export",
                "importPensions": "Import pensii",
                "deletePensions": "Ștergeți pensiile",
                "exportPortfolio": "Portofoliu de export",
                "importPortfolio": "Portofoliu de import",
                "deletePortfolio": "Ștergeți portofoliul",
                "exportWatchlist": "Exportă lista de urmărire",
                "importWatchlist": "Importă lista de urmărire",
                "deleteWatchlist": "Șterge lista de urmărire",
                "exportStock": "Date de stoc de export",
                "importStock": "Importați datele stocului",
                "deleteStock": "Ștergeți datele",
                "versionLabel": "Versiunea aplicației web",
                "languageLabel": "Limbă",
                "exportLang": "Limba de export",
                "importLang": "Limba de import",
                "rtlToggle": "Activați RTL",
                "fontSize": "Mărimea fontului",
                "theme": "Temă",
                "themeSystem": "Sistem",
                "themeLight": "Luminos",
                "themeDark": "Întunecat"
            },
            "dialog": {
                "yes": "Da",
                "no": "Nu",
                "close": "Aproape",
                "delete": "Șterge",
                "enterPortfolioName": "Introduceți numele portofoliului:",
                "deletePortfolio": "Ștergeți acest portofoliu?",
                "tickerNotExist": "Simbolul ticker nu există",
                "enterValidTicker": "Vă rugăm să introduceți un simbol valabil.",
                "purchaseDateFuture": "Data achiziției nu poate fi în viitor.",
                "deleteInvestment": "Ștergeți această investiție?",
                "deletePension": "Ștergeți această pensie?",
                "deleteEntry": "Ștergeți această intrare?",
                "deleteAllPension": "Ștergeți toate datele de pensii?",
                "deleteAllPortfolio": "Ștergeți toate datele din portofoliu?",
                "deleteAllWatchlist": "Ștergeți toate datele listei de urmărire?",
                "deleteAllStock": "Ștergeți toate datele de urmărire a stocurilor?"
            },
            "common": {
                "format": "Format",
                "file": "Fișier",
                "cancel": "Anula",
                "import": "Import",
                "export": "Export",
                "add": "Adăuga",
                "save": "Salva",
                "summary": "Rezumat",
                "reset": "Resetează"
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
    }

    function pseudolocalize(str) {
        const map = { a:'ā', e:'ē', i:'ī', o:'ȍ', u:'ȫ', A:'Ā', E:'Ē', I:'Ī', O:'Ȍ', U:'Ȫ' };
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
