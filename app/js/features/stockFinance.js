const StockFinance = (function() {
    // Finnhub API key for financial reports
    const API_KEY = 'd1nf8h1r01qovv8iu2dgd1nf8h1r01qovv8iu2e0';
    const tickerInput = document.getElementById('finance-ticker');
    const dateInput = document.getElementById('finance-date');
    const timeframeSelect = document.getElementById('finance-timeframe');
    const fetchBtn = document.getElementById('fetch-financials-btn');
    const tableContainer = document.getElementById('financials-table-container');
    const tableHead = document.getElementById('financials-header');
    const tableBody = document.getElementById('financials-body');
    const subTabs = document.querySelectorAll('#finance-subtabs .sub-nav-tab');
    const tooltip = document.getElementById('tooltip');
    const zeroInfoEl = document.getElementById('finance-zero-info');

    const ORDER = {
        ic: [
            'Revenue',
            'Cost of revenue',
            'Gross profit',
            'Research and development',
            'Sales, general and administrative',
            'Acquisition termination cost',
            'Total operating expenses',
            'Operating income',
            'Interest income',
            'Interest income',
            'Other, net',
            'Other income (expense), net',
            'Income before income tax',
            'Income tax expense (benefit)',
            'Net income',
            'Basic (in USD per share)',
            'Diluted (in USD per share)',
            'Basic (in shares)',
            'Diluted (in shares)',
            'Net change in unrealized gain (loss)',
            'Reclassification adjustments for net realized gain included in net income',
            'Net change in unrealized gain (loss)',
            'Net change in unrealized gain',
            'Reclassification adjustments for net realized loss included in net income',
            'Net change in unrealized loss',
            'Other comprehensive income (loss), net of tax',
            'Total comprehensive income'
        ],
        bs: [
            'Cash and cash equivalents',
            'Marketable securities',
            'Accounts receivable, net',
            'Inventories',
            'Prepaid expenses and other current assets',
            'Total current assets',
            'Property and equipment, net',
            'Operating lease assets',
            'Goodwill',
            'Intangible assets, net',
            'Deferred income tax assets',
            'Other assets',
            'Total assets',
            'Accounts payable',
            'Accrued and other current liabilities',
            'Short-term debt',
            'Total current liabilities',
            'Long-term debt',
            'Long-term operating lease liabilities',
            'Other long-term liabilities',
            'Total liabilities',
            'Commitments and contingencies - see Note 12',
            'Preferred stock, $0.001 par value; 20 shares authorized; none issued'
        ],
        cash: [
            'Acquisition termination cost',
            'Net income',
            'Stock-based compensation expense',
            'Depreciation and amortization',
            'Deferred income taxes',
            '(Gains) losses on non-marketable equity securities and publicly-held equity securities, net',
            'Other',
            'Accounts receivable',
            'Inventories',
            'Prepaid expenses and other assets',
            'Accounts payable',
            'Accrued and other current liabilities',
            'Other long-term liabilities',
            'Net cash provided by operating activities',
            'Proceeds from maturities of marketable securities',
            'Proceeds from sales of marketable securities',
            'Proceeds from sales of non-marketable equity securities',
            'Purchases of marketable securities',
            'Purchases related to property and equipment and intangible assets',
            'Purchases of non-marketable equity securities',
            'Acquisitions, net of cash acquired',
            'Other'
        ]
    };

    const STAT_ROWS = [
        { key: 'pe', labelKey: 'stockFinance.stats.peRatio' },
        { key: 'grossMargin', labelKey: 'stockFinance.stats.grossMargin' },
        { key: 'netMargin', labelKey: 'stockFinance.stats.netMargin' }
    ];

    let reports = [];
    let currentSubTab = 'income';
    let currentSharePrice = null;
    let currentTicker = '';

    function setupTooltip() {
        if (!tooltip || !tableBody) return;

        tableBody.addEventListener('mouseover', (e) => {
            const cell = e.target.closest('.has-tooltip');
            if (!cell) return;
            tooltip.textContent = cell.dataset.tooltip;
            tooltip.style.left = (e.pageX + 12) + 'px';
            tooltip.style.top = (e.pageY + 12) + 'px';
            tooltip.style.display = 'block';
        });

        tableBody.addEventListener('mousemove', (e) => {
            if (tooltip.style.display === 'block') {
                tooltip.style.left = (e.pageX + 12) + 'px';
                tooltip.style.top = (e.pageY + 12) + 'px';
            }
        });

        tableBody.addEventListener('mouseout', (e) => {
            const cell = e.target.closest('.has-tooltip');
            if (!cell) return;
            tooltip.style.display = 'none';
        });
    }

    function showZeroInfo() {
        if (!zeroInfoEl) return;
        zeroInfoEl.textContent = I18n.t('stockFinance.zeroInfo');
        zeroInfoEl.style.display = 'block';
    }

    function formatNumber(val) {
        if (val === undefined || val === null || val === '') return '';
        const num = Number(val);
        if (isNaN(num)) return val;
        let formatted = I18n.formatNumber(num);
        if (formatted.endsWith('000,000')) {
            formatted = formatted.slice(0, -8);
            if (formatted.endsWith(',')) {
                formatted = formatted.slice(0, -1);
            }
        }
        return formatted;
    }

    function getValue(obj, paths) {
        for (const p of paths) {
            const parts = p.split('.');
            let val = obj;
            for (const part of parts) {
                if (!val || !(part in val)) { val = null; break; }
                val = val[part];
            }
            if (val !== null && val !== undefined) {
                if (typeof val === 'object' && val.value !== undefined) {
                    val = val.value;
                }
                const num = Number(val);
                if (!isNaN(num)) return num;
            }
        }
        return null;
    }

    function setDateLimits() {
        if (!dateInput) return;
        const today = new Date().toISOString().split('T')[0];
        dateInput.max = today;
        if (!dateInput.value) dateInput.value = '2011-01-01';
    }

    function switchSubTab(name) {
        subTabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.finSubtab === name);
        });
        currentSubTab = name;
        renderTable();
    }

    async function fetchReports() {
        const ticker = tickerInput.value.trim().toUpperCase();
        const date = dateInput.value;
        const timeframe = timeframeSelect.value || 'annual';
        if (!ticker || !date) return;
        const fromDate = new Date(date).toISOString().split('T')[0];
        const toDate = new Date().toISOString().split('T')[0];
        const url = `https://finnhub.io/api/v1/stock/financials-reported?symbol=${encodeURIComponent(ticker)}&freq=${timeframe}&from=${fromDate}&to=${toDate}&token=${API_KEY}`;
        try {
            const res = await fetch(url);
            const data = await res.json();
            if (data && Array.isArray(data.data) && data.data.length > 0) {
                const startDate = new Date(date);
                reports = data.data
                    .filter(r => {
                        const fd = new Date(r.filedDate || r.endDate || r.startDate);
                        return !isNaN(fd) && fd >= startDate;
                    })
                    .sort((a, b) => new Date(a.filedDate || a.endDate || a.startDate) - new Date(b.filedDate || b.endDate || b.startDate))
                    .map(r => {
                        const fin = {
                            income_statement: {},
                            balance_sheet: {},
                            cash_flow_statement: {}
                        };
                        if (r.report) {
                            (r.report.ic || []).forEach(item => {
                                fin.income_statement[item.label] = {
                                    label: item.label,
                                    value: item.value,
                                    usd: item.unit
                                };
                            });
                            (r.report.bs || []).forEach(item => {
                                fin.balance_sheet[item.label] = {
                                    label: item.label,
                                    value: item.value,
                                    usd: item.unit
                                };
                            });
                            (r.report.cf || []).forEach(item => {
                                fin.cash_flow_statement[item.label] = {
                                    label: item.label,
                                    value: item.value,
                                    usd: item.unit
                                };
                            });
                        }
                        return {
                            fiscal_year: r.year,
                            fiscal_period: timeframe === 'annual' ? 'FY' : 'Q' + r.quarter,
                            financials: fin
                        };
                    });

                currentTicker = ticker;
                const quote = await PortfolioManager.fetchQuote(ticker);
                currentSharePrice = quote.price;
                showZeroInfo();
                renderTable();
            } else {
                reports = [];
                tableHead.innerHTML = '';
            tableBody.innerHTML = `<tr><td>${I18n.t('stockFinance.messages.noData')}</td></tr>`;
                tableContainer.style.display = 'block';
                if (zeroInfoEl) zeroInfoEl.style.display = 'none';
            }
        } catch (e) {
            reports = [];
            tableHead.innerHTML = '';
            tableBody.innerHTML = `<tr><td>${I18n.t('stockFinance.messages.loadFailed')}</td></tr>`;
            tableContainer.style.display = 'block';
            if (zeroInfoEl) zeroInfoEl.style.display = 'none';
        }
    }

    function renderTable() {
        if (!reports.length) return;

        const keyMap = {
            income: 'income_statement',
            balance: 'balance_sheet',
            cash: 'cash_flow_statement'
        };
        const orderMap = { income: 'ic', balance: 'bs', cash: 'cash' };
        const statementKey = keyMap[currentSubTab];

        tableHead.innerHTML = '';
        tableBody.innerHTML = '';

        const headerRow = document.createElement('tr');
        let headerHtml = `<th>${I18n.t('stockFinance.table.label')}</th>`;
        reports.forEach(r => {
            const yr = r.fiscal_year || '';
            const period = r.fiscal_period || '';
            const shortYr = yr ? yr.toString().slice(-2) : '';
            headerHtml += `<th>${shortYr} ${period}</th>`;
        });
        headerRow.innerHTML = headerHtml;
        tableHead.appendChild(headerRow);

        const allKeys = new Set();
        reports.forEach(r => {
            const stmt = r.financials ? r.financials[statementKey] : {};
            Object.keys(stmt || {}).forEach(k => allKeys.add(k));
        });

        const orderedKeys = Array.from(allKeys).sort((a, b) => {
            const order = ORDER[orderMap[currentSubTab]] || [];
            const ia = order.indexOf(a);
            const ib = order.indexOf(b);
            if (ia === -1 && ib === -1) return a.localeCompare(b);
            if (ia === -1) return 1;
            if (ib === -1) return -1;
            return ia - ib;
        });

        if (currentSubTab === 'stats') {
            const stats = calculateStats();
            STAT_ROWS.forEach(row => {
                let rowHtml = `<td>${I18n.t(row.labelKey)}</td>`;
                stats[row.key].forEach(val => {
                    if (val === null || val === undefined || isNaN(val)) {
                        rowHtml += '<td></td>';
                    } else if (row.key === 'grossMargin' || row.key === 'netMargin') {
                        rowHtml += `<td>${(val * 100).toFixed(2)}%</td>`;
                    } else {
                        rowHtml += `<td>${val.toFixed(2)}</td>`;
                    }
                });
                const tr = document.createElement('tr');
                tr.innerHTML = rowHtml;
                tableBody.appendChild(tr);
            });
            tableContainer.style.display = 'block';
            return;
        }

        orderedKeys.forEach(k => {
            let label = k;
            for (const r of reports) {
                const item = r.financials && r.financials[statementKey] ? r.financials[statementKey][k] : undefined;
                if (item && item.label) { label = item.label; break; }
            }
            const shortLabel = label.length > 20 ? label.slice(0,17) + '...' : label;
            let rowHtml = `<td class="has-tooltip" data-tooltip="${label}">${shortLabel}</td>`;
            let prevVal = null;
            reports.forEach((r, idx) => {
                const item = r.financials && r.financials[statementKey] ? r.financials[statementKey][k] : undefined;
                if (item && item.value !== undefined && item.value !== null) {
                    const value = Number(item.value);
                    const formatted = formatNumber(value);
                    const cls = value < 0 ? 'negative-num' : '';
                    let cell = `<div class="fin-value ${cls}">${formatted}</div>`;
                    if (idx === 0 || prevVal === null || prevVal === 0) {
                        cell += '<div class="fin-growth growth-neutral">---</div>';
                    } else {
                        const diff = ((value - prevVal) / Math.abs(prevVal)) * 100;
                        const dcls = diff >= 0 ? 'growth-positive' : 'growth-negative';
                        cell += `<div class="fin-growth ${dcls}">${diff >= 0 ? '+' : ''}${diff.toFixed(2)}%</div>`;
                    }
                    rowHtml += `<td>${cell}</td>`;
                    prevVal = value;
                } else {
                    rowHtml += '<td></td>';
                    prevVal = null;
                }
            });
            const tr = document.createElement('tr');
            tr.innerHTML = rowHtml;
            tableBody.appendChild(tr);
        });

        tableContainer.style.display = 'block';
    }

    function calculateStats() {
        const results = {
            pe: [],
            grossMargin: [],
            netMargin: []
        };
        reports.forEach((r, idx) => {
            const inc = r.financials ? r.financials.income_statement || {} : {};
            const revenue = getValue(inc, ['Revenue']);
            const gross = getValue(inc, ['Gross profit']);
            const net = getValue(inc, ['Net income']);
            const shares = getValue(inc, [
                'Diluted (in shares)',
                'Basic (in shares)'
            ]);
            const sharePrice = currentSharePrice;

            // Use diluted EPS when available
            let eps = getValue(inc, [
                'Diluted (in USD per share)',
                'Basic (in USD per share)'
            ]);
            if (eps === null && net !== null && shares) eps = net / shares;
            const pe = (sharePrice !== null && eps !== null) ? sharePrice / eps : null;
            results.pe.push(pe);

            const gm = (gross !== null && revenue) ? gross / revenue : null;
            const nm = (net !== null && revenue) ? net / revenue : null;
            results.grossMargin.push(gm);
            results.netMargin.push(nm);
        });

        return results;
    }

    function init() {
        if (!tickerInput || !fetchBtn) return;
        setDateLimits();
        if (timeframeSelect && !timeframeSelect.value) timeframeSelect.value = 'annual';
        setupTooltip();
        fetchBtn.addEventListener('click', fetchReports);
        subTabs.forEach(tab => {
            tab.addEventListener('click', () => switchSubTab(tab.dataset.finSubtab));
        });
    }

    return { init };
})();
