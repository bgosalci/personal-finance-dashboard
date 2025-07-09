        // Main Application using JavaScript Closures
        const FinancialDashboard = (function() {
            'use strict';

            // Private variables and state
            let currentTab = 'portfolio';
            let stockData = {
                tickers: [],
                startYear: new Date().getFullYear() - 5,
                prices: {}
            };

            // Tab Management Module
            const TabManager = (function() {
                const tabs = document.querySelectorAll('.nav-tab');
                const contents = document.querySelectorAll('.tab-content');

                function switchTab(tabName) {
                    // Update tab buttons
                    tabs.forEach(tab => {
                        tab.classList.remove('active');
                        if (tab.dataset.tab === tabName) {
                            tab.classList.add('active');
                        }
                    });

                    // Update content
                    contents.forEach(content => {
                        content.classList.remove('active');
                        if (content.id === tabName) {
                            content.classList.add('active');
                        }
                    });

                    currentTab = tabName;
                }

                function init() {
                    tabs.forEach(tab => {
                        tab.addEventListener('click', () => {
                            switchTab(tab.dataset.tab);
                        });
                    });
                }

                return {
                    init,
                    switchTab
                };
            })();

            // Portfolio Management Module
            const PortfolioManager = (function() {
                const STORAGE_KEY = 'portfolioData';
                let investments = [];
                let pieChart = null;
                let barChart = null;
                const COLOR_KEY = 'portfolioColors';
                let tickerColors = {};
                let colorIndex = 0;

                const addBtn = document.getElementById('add-investment-btn');
                const getPriceBtn = document.getElementById('get-last-price-btn');
                const modal = document.getElementById('investment-modal');
                const form = document.getElementById('investment-form');
                const closeBtn = document.getElementById('investment-close');
                const cancelBtn = document.getElementById('cancel-investment-btn');
                const saveAddBtn = document.getElementById('save-add-another-btn');
                const totalDisplay = document.getElementById('investment-total-value');

                const editModal = document.getElementById('edit-investment-modal');
                const editForm = document.getElementById('edit-investment-form');
                const editClose = document.getElementById('edit-investment-close');
                const editCancel = document.getElementById('edit-cancel-btn');
                const editTotal = document.getElementById('edit-total-value');
                let editIndex = null;
                const API_KEY = 'd1nf8h1r01qovv8iu2dgd1nf8h1r01qovv8iu2e0';

                function loadData() {
                    const data = localStorage.getItem(STORAGE_KEY);
                    if (data) {
                        try {
                            investments = JSON.parse(data) || [];
                        } catch (e) {
                            investments = [];
                        }
                    }
                    const colorData = localStorage.getItem(COLOR_KEY);
                    if (colorData) {
                        try {
                            tickerColors = JSON.parse(colorData) || {};
                            colorIndex = Object.keys(tickerColors).length;
                        } catch (e) {
                            tickerColors = {};
                            colorIndex = 0;
                        }
                    }
                    investments.forEach(inv => {
                        if (!tickerColors[inv.ticker]) {
                            assignColor(inv.ticker);
                        }
                    });
                }

                function saveData() {
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(investments));
                    localStorage.setItem(COLOR_KEY, JSON.stringify(tickerColors));
                }

                function formatCurrency(value) {
                    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
                }

                function updateTotals() {
                    let totalValue = 0;
                    let totalCost = 0;
                    investments.forEach(inv => {
                        const value = inv.quantity * inv.lastPrice;
                        totalValue += value;
                        totalCost += inv.quantity * inv.avgPrice;
                    });
                    const totalPL = totalValue - totalCost;
                    const totalPLPct = totalCost ? (totalPL / totalCost) * 100 : 0;

                    document.getElementById('portfolio-total-value').textContent = formatCurrency(totalValue);
                    document.getElementById('portfolio-total-pl').textContent = formatCurrency(totalPL);
                    document.getElementById('portfolio-total-plpct').textContent = totalPLPct.toFixed(2) + '%';
                }

                function assignColor(ticker) {
                    if (!tickerColors[ticker]) {
                        const hue = (colorIndex * 137.508) % 360;
                        tickerColors[ticker] = `hsl(${hue},70%,60%)`;
                        colorIndex++;
                    }
                }

                function getColor(ticker) {
                    assignColor(ticker);
                    return tickerColors[ticker];
                }

                function updateCharts() {
                    const labels = investments.map(inv => inv.ticker);
                    const values = investments.map(inv => inv.quantity * inv.lastPrice);
                    const total = values.reduce((a, b) => a + b, 0);
                    const plPercents = investments.map(inv => {
                        const cost = inv.quantity * inv.avgPrice;
                        const value = inv.quantity * inv.lastPrice;
                        return cost ? ((value - cost) / cost) * 100 : 0;
                    });
                    const colors = labels.map(t => getColor(t));

                    if (!pieChart) {
                        const ctx = document.getElementById('investment-spread-chart').getContext('2d');
                        pieChart = new Chart(ctx, {
                            type: 'pie',
                            data: { labels, datasets: [{ data: values, backgroundColor: colors }] },
                            options: {
                                plugins: {
                                    tooltip: {
                                        callbacks: {
                                            label: (ctx) => {
                                                const pct = total ? (ctx.parsed * 100 / total) : 0;
                                                return `${ctx.label}: ${pct.toFixed(2)}%`;
                                            }
                                        }
                                    },
                                    title: { display: true, text: 'Investment Spread' }
                                }
                            }
                        });
                    } else {
                        pieChart.data.labels = labels;
                        pieChart.data.datasets[0].data = values;
                        pieChart.options.plugins.tooltip.callbacks.label = (ctx) => {
                            const pct = total ? (ctx.parsed * 100 / total) : 0;
                            return `${ctx.label}: ${pct.toFixed(2)}%`;
                        };
                        pieChart.update();
                    }

                    if (!barChart) {
                        const ctx2 = document.getElementById('plpct-chart').getContext('2d');
                        barChart = new Chart(ctx2, {
                            type: 'bar',
                            data: { labels, datasets: [{ data: plPercents, backgroundColor: colors }] },
                            options: {
                                plugins: {
                                    legend: { display: false },
                                    tooltip: {
                                        callbacks: {
                                            label: (ctx) => {
                                                const val = typeof ctx.parsed === 'object'
                                                    ? (ctx.parsed.y ?? ctx.parsed.x)
                                                    : ctx.parsed;
                                                const sign = val > 0 ? '+' : '';
                                                return `${ctx.label}: ${sign}${val.toFixed(2)}%`;
                                            }
                                        }
                                    },
                                    title: { display: true, text: 'P&L%' }
                                },
                                scales: {
                                    y: {
                                        beginAtZero: true,
                                        ticks: {
                                            callback: (val) => val + '%'
                                        }
                                    }
                                }
                            }
                        });
                    } else {
                        barChart.data.labels = labels;
                        barChart.data.datasets[0].data = plPercents;
                        barChart.update();
                    }
                }

                function renderTable() {
                    const tbody = document.getElementById('portfolio-body');
                    tbody.innerHTML = '';
                    investments.forEach((inv, idx) => {
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td>${inv.ticker}</td>
                            <td>${inv.name}</td>
                            <td class="number-cell">${formatCurrency(inv.avgPrice)}</td>
                            <td class="number-cell">${inv.quantity}</td>
                            <td class="number-cell">${formatCurrency(inv.lastPrice)}</td>
                            <td class="value-cell"></td>
                            <td class="pl-cell"></td>
                            <td class="plpct-cell"></td>
                            <td class="actions-cell">
                                <button class="icon-btn edit-btn" data-index="${idx}" title="Edit">
                                    <svg width="16" height="16" viewBox="0 0 512 512"><polygon points="364.13 125.25 87 403 64 448 108.99 425 386.75 147.87 364.13 125.25" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32px"/><path d="M420.69,68.69,398.07,91.31l22.62,22.63,22.62-22.63a16,16,0,0,0,0-22.62h0A16,16,0,0,0,420.69,68.69Z" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32px"/></svg>
                                </button>
                                <button class="icon-btn delete-btn" data-index="${idx}" title="Delete">
                                    <svg width="16" height="16" viewBox="0 0 512 512"><path d="M112,112l20,320c.95,18.49,14.4,32,32,32H348c17.67,0,30.87-13.51,32-32l20-320" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32px"/><line x1="80" y1="112" x2="432" y2="112" style="stroke:currentColor;stroke-linecap:round;stroke-miterlimit:10;stroke-width:32px"/><path d="M192,112V72h0a23.93,23.93,0,0,1,24-24h80a23.93,23.93,0,0,1,24,24h0v40" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32px"/><line x1="256" y1="176" x2="256" y2="400" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32px"/><line x1="184" y1="176" x2="192" y2="400" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32px"/><line x1="328" y1="176" x2="320" y2="400" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32px"/></svg>
                                </button>
                            </td>`;
                        tbody.appendChild(row);
                    });

                    updateRows();
                    updateTotals();
                    updateCharts();
                }

                function updateRows() {
                    const rows = document.querySelectorAll('#portfolio-body tr');
                    rows.forEach((row, idx) => {
                        const inv = investments[idx];
                        const value = inv.quantity * inv.lastPrice;
                        const cost = inv.quantity * inv.avgPrice;
                        const pl = value - cost;
                        const plPct = cost ? (pl / cost) * 100 : 0;

                        row.querySelector('.value-cell').textContent = formatCurrency(value);
                        row.querySelector('.pl-cell').textContent = formatCurrency(pl);
                        row.querySelector('.pl-cell').className = 'pl-cell ' + (pl >= 0 ? 'growth-positive' : 'growth-negative');
                        row.querySelector('.plpct-cell').textContent = plPct.toFixed(2) + '%';
                        row.querySelector('.plpct-cell').className = 'plpct-cell ' + (plPct >= 0 ? 'growth-positive' : 'growth-negative');
                    });
                }

                function openModal() {
                    form.reset();
                    totalDisplay.textContent = formatCurrency(0);
                    modal.style.display = 'flex';
                    document.getElementById('investment-ticker').focus();
                }

                function closeModal() {
                    modal.style.display = 'none';
                }

                function handleFormInput() {
                    const qty = parseFloat(document.getElementById('investment-quantity').value) || 0;
                    const lastPrice = parseFloat(document.getElementById('investment-last-price').value) || 0;
                    totalDisplay.textContent = formatCurrency(qty * lastPrice);
                }

                function addFromForm(resetAfter) {
                    const ticker = document.getElementById('investment-ticker').value.trim().toUpperCase();
                    const name = document.getElementById('investment-name').value.trim();
                    const quantity = parseFloat(document.getElementById('investment-quantity').value) || 0;
                    const avgPrice = parseFloat(document.getElementById('investment-avg-price').value) || 0;
                    const lastPrice = parseFloat(document.getElementById('investment-last-price').value) || 0;
                    if (!ticker || quantity <= 0 || avgPrice <= 0 || lastPrice <= 0) return;

                    assignColor(ticker);
                    investments.push({ ticker, name, quantity, avgPrice, lastPrice });
                    saveData();
                    renderTable();

                    if (resetAfter) {
                        form.reset();
                        totalDisplay.textContent = formatCurrency(0);
                        document.getElementById('investment-ticker').focus();
                    } else {
                        closeModal();
                    }
                }

                function openEditModal(index) {
                    editIndex = index;
                    const inv = investments[index];
                    document.getElementById('edit-name').value = inv.name || '';
                    document.getElementById('edit-quantity').value = inv.quantity;
                    document.getElementById('edit-avg-price').value = inv.avgPrice;
                    document.getElementById('edit-last-price').value = inv.lastPrice;
                    editTotal.textContent = formatCurrency(inv.quantity * inv.lastPrice);
                    editModal.style.display = 'flex';
                }

                function closeEditModal() {
                    editModal.style.display = 'none';
                    editIndex = null;
                }

                function handleEditInput() {
                    const qty = parseFloat(document.getElementById('edit-quantity').value) || 0;
                    const price = parseFloat(document.getElementById('edit-last-price').value) || 0;
                    editTotal.textContent = formatCurrency(qty * price);
                }

                async function fetchLastPrices() {
                    if (investments.length === 0) return;
                    const updates = investments.map(inv => {
                        const url = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(inv.ticker)}&token=${API_KEY}`;
                        return fetch(url)
                            .then(res => res.json())
                            .then(data => {
                                if (data && typeof data.c === 'number') {
                                    inv.lastPrice = parseFloat(data.c);
                                }
                            })
                            .catch(() => {});
                    });
                    await Promise.all(updates);
                    saveData();
                    renderTable();
                }

                function saveEdit(e) {
                    e.preventDefault();
                    if (editIndex === null) return;
                    const name = document.getElementById('edit-name').value || '';
                    const qty = parseFloat(document.getElementById('edit-quantity').value) || 0;
                    const avg = parseFloat(document.getElementById('edit-avg-price').value) || 0;
                    const last = parseFloat(document.getElementById('edit-last-price').value) || 0;
                    if (qty <= 0 || avg <= 0 || last <= 0) return;

                    const inv = investments[editIndex];
                    inv.name = name;
                    inv.quantity = qty;
                    inv.avgPrice = avg;
                    inv.lastPrice = last;

                    saveData();
                    renderTable();
                    closeEditModal();
                }

                function handleRowAction(e) {
                    const btn = e.target.closest('button');
                    if (!btn) return;
                    if (btn.classList.contains('edit-btn')) {
                        const idx = parseInt(btn.dataset.index, 10);
                        openEditModal(idx);
                    } else if (btn.classList.contains('delete-btn')) {
                        const idx = parseInt(btn.dataset.index, 10);
                        if (confirm('Delete this investment?')) {
                            const removed = investments.splice(idx, 1)[0];
                            if (removed && !investments.some(inv => inv.ticker === removed.ticker)) {
                                delete tickerColors[removed.ticker];
                            }
                            saveData();
                            renderTable();
                        }
                    }
                }

                function init() {
                    loadData();
                    addBtn.addEventListener('click', openModal);
                    getPriceBtn.addEventListener('click', fetchLastPrices);
                    closeBtn.addEventListener('click', closeModal);
                    cancelBtn.addEventListener('click', closeModal);
                    form.addEventListener('input', handleFormInput);
                    form.addEventListener('submit', (e) => { e.preventDefault(); addFromForm(false); });
                    saveAddBtn.addEventListener('click', () => addFromForm(true));
                    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

                    document.getElementById('portfolio-body').addEventListener('click', handleRowAction);
                    editClose.addEventListener('click', closeEditModal);
                    editCancel.addEventListener('click', closeEditModal);
                    editForm.addEventListener('input', handleEditInput);
                    editForm.addEventListener('submit', saveEdit);
                    editModal.addEventListener('click', (e) => { if (e.target === editModal) closeEditModal(); });

                    renderTable();
                }

                return { init };
            })();

            // Calculator Module
            const Calculator = (function() {
                let currentSubTab = 'loan';
                let currentFairValueSection = 'dcf';
                
                function formatCurrency(amount) {
                    return new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                        minimumFractionDigits: 2
                    }).format(amount);
                }

                function formatPercentage(rate) {
                    return (rate).toFixed(2) + '%';
                }

                function formatNumber(num) {
                    return num.toFixed(2);
                }

                // Sub-Tab Management
                function switchSubTab(subTabName) {
                    const subTabs = document.querySelectorAll('.sub-nav-tab');
                    const subContents = document.querySelectorAll('.sub-tab-content');

                    subTabs.forEach(tab => {
                        tab.classList.remove('active');
                        if (tab.dataset.subtab === subTabName) {
                            tab.classList.add('active');
                        }
                    });

                    subContents.forEach(content => {
                        content.classList.remove('active');
                        if (content.id === subTabName) {
                            content.classList.add('active');
                        }
                    });

                    currentSubTab = subTabName;
                }

                // Fair Value Section Management
                function switchFairValueSection(sectionName) {
                    const sectionBtns = document.querySelectorAll('.fair-value-btn');
                    const sections = document.querySelectorAll('.fair-value-section');

                    sectionBtns.forEach(btn => {
                        btn.classList.remove('active');
                        if (btn.dataset.section === sectionName) {
                            btn.classList.add('active');
                        }
                    });

                    sections.forEach(section => {
                        section.classList.remove('active');
                        if (section.id === sectionName) {
                            section.classList.add('active');
                        }
                    });

                    currentFairValueSection = sectionName;
                }

                // Loan Calculator
                const LoanCalculator = (function() {
                    function calculate() {
                        const principal = parseFloat(document.getElementById('loan-principal').value) || 0;
                        const annualRate = parseFloat(document.getElementById('loan-rate').value) || 0;
                        const years = parseFloat(document.getElementById('loan-term').value) || 0;

                        if (principal <= 0 || annualRate <= 0 || years <= 0) {
                            document.getElementById('loan-results').style.display = 'none';
                            return;
                        }

                        const monthlyRate = annualRate / 100 / 12;
                        const totalPayments = years * 12;
                        
                        const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / 
                                             (Math.pow(1 + monthlyRate, totalPayments) - 1);
                        
                        const totalAmount = monthlyPayment * totalPayments;
                        const totalInterest = totalAmount - principal;

                        document.getElementById('loan-monthly-payment').textContent = formatCurrency(monthlyPayment);
                        document.getElementById('loan-total-interest').textContent = formatCurrency(totalInterest);
                        document.getElementById('loan-total-amount').textContent = formatCurrency(totalAmount);
                        document.getElementById('loan-results').style.display = 'block';
                    }

                    function init() {
                        const inputs = ['loan-principal', 'loan-rate', 'loan-term'];
                        inputs.forEach(id => {
                            document.getElementById(id).addEventListener('input', calculate);
                        });
                    }

                    return { init };
                })();

                // Investment Calculator
                const InvestmentCalculator = (function() {
                    function calculate() {
                        const initial = parseFloat(document.getElementById('invest-initial').value) || 0;
                        const annualRate = parseFloat(document.getElementById('invest-rate').value) || 0;
                        const years = parseFloat(document.getElementById('invest-years').value) || 0;

                        if (initial <= 0 || annualRate < 0 || years <= 0) {
                            document.getElementById('investment-results').style.display = 'none';
                            document.getElementById('investment-growth-container').style.display = 'none';
                            return;
                        }

                        // Simple annual compounding: Final Value = Principal × (1 + rate)^years
                        const annualRateDecimal = annualRate / 100;
                        const finalValue = initial * Math.pow(1 + annualRateDecimal, years);
                        const totalReturn = finalValue - initial;

                        document.getElementById('invest-total-return').textContent = formatCurrency(totalReturn);
                        document.getElementById('invest-final-value').textContent = formatCurrency(finalValue);
                        document.getElementById('investment-results').style.display = 'block';

                        // Build yearly growth table
                        const tbody = document.getElementById('investment-growth-body');
                        tbody.innerHTML = '';
                        let value = initial;
                        const row0 = document.createElement('tr');
                        row0.innerHTML = `<td>Start</td><td>-</td><td>${formatCurrency(value)}</td>`;
                        tbody.appendChild(row0);
                        for (let i = 1; i <= years; i++) {
                            const newValue = value * (1 + annualRateDecimal);
                            const growth = newValue - value;
                            const tr = document.createElement('tr');
                            tr.innerHTML = `<td>Year ${i}</td><td>${formatCurrency(growth)}</td><td>${formatCurrency(newValue)}</td>`;
                            tbody.appendChild(tr);
                            value = newValue;
                        }
                        document.getElementById('investment-growth-container').style.display = 'block';
                    }

                    function init() {
                        const inputs = ['invest-initial', 'invest-rate', 'invest-years'];
                        inputs.forEach(id => {
                            document.getElementById(id).addEventListener('input', calculate);
                        });
                    }

                    return { init };
                })();

                // CAGR Calculator
                const CAGRCalculator = (function() {
                    function calculate() {
                        const beginning = parseFloat(document.getElementById('cagr-beginning').value) || 0;
                        const ending = parseFloat(document.getElementById('cagr-ending').value) || 0;
                        const years = parseFloat(document.getElementById('cagr-years').value) || 0;

                        if (beginning <= 0 || ending <= 0 || years <= 0) {
                            document.getElementById('cagr-results').style.display = 'none';
                            return;
                        }

                        const totalReturn = ((ending - beginning) / beginning) * 100;
                        const cagr = (Math.pow(ending / beginning, 1 / years) - 1) * 100;

                        document.getElementById('cagr-total-return').textContent = formatPercentage(totalReturn);
                        document.getElementById('cagr-rate').textContent = formatPercentage(cagr);
                        document.getElementById('cagr-results').style.display = 'block';
                    }

                    function init() {
                        const inputs = ['cagr-beginning', 'cagr-ending', 'cagr-years'];
                        inputs.forEach(id => {
                            document.getElementById(id).addEventListener('input', calculate);
                        });
                    }

                    return { init };
                })();

                // Fair Value Calculator
                const FairValueCalculator = (function() {
                    
                    // DCF Calculator
                    const DCFCalculator = (function() {
                        function calculate() {
                            const currentFCF = parseFloat(document.getElementById('dcf-current-fcf').value) || 0;
                            const growthRate = parseFloat(document.getElementById('dcf-growth-rate').value) || 0;
                            const terminalRate = parseFloat(document.getElementById('dcf-terminal-rate').value) || 0;
                            const discountRate = parseFloat(document.getElementById('dcf-discount-rate').value) || 0;
                            const projectionYears = parseInt(document.getElementById('dcf-years').value) || 0;
                            const sharesOutstanding = parseFloat(document.getElementById('dcf-shares').value) || 0;

                            if (currentFCF <= 0 || discountRate <= 0 || projectionYears <= 0 || sharesOutstanding <= 0) {
                                document.getElementById('dcf-results').style.display = 'none';
                                return;
                            }

                            const discountRateDecimal = discountRate / 100;
                            const growthRateDecimal = growthRate / 100;
                            const terminalRateDecimal = terminalRate / 100;

                            // Calculate projected cash flows and their present values
                            let pvCashFlows = 0;
                            for (let year = 1; year <= projectionYears; year++) {
                                const fcf = currentFCF * Math.pow(1 + growthRateDecimal, year);
                                const pv = fcf / Math.pow(1 + discountRateDecimal, year);
                                pvCashFlows += pv;
                            }

                            // Calculate terminal value
                            const terminalFCF = currentFCF * Math.pow(1 + growthRateDecimal, projectionYears) * (1 + terminalRateDecimal);
                            const terminalValue = terminalFCF / (discountRateDecimal - terminalRateDecimal);
                            const pvTerminalValue = terminalValue / Math.pow(1 + discountRateDecimal, projectionYears);

                            // Calculate enterprise value and per share value
                            const enterpriseValue = pvCashFlows + pvTerminalValue;
                            const valuePerShare = enterpriseValue / sharesOutstanding;

                            document.getElementById('dcf-enterprise-value').textContent = formatCurrency(enterpriseValue * 1000000);
                            document.getElementById('dcf-pv-cashflows').textContent = formatCurrency(pvCashFlows * 1000000);
                            document.getElementById('dcf-terminal-value').textContent = formatCurrency(pvTerminalValue * 1000000);
                            document.getElementById('dcf-per-share').textContent = formatCurrency(valuePerShare * 1000000 / sharesOutstanding);
                            document.getElementById('dcf-results').style.display = 'block';
                        }

                        function init() {
                            const inputs = ['dcf-current-fcf', 'dcf-growth-rate', 'dcf-terminal-rate', 'dcf-discount-rate', 'dcf-years', 'dcf-shares'];
                            inputs.forEach(id => {
                                document.getElementById(id).addEventListener('input', calculate);
                            });
                        }

                        return { init };
                    })();

                    // P/E Ratio Calculator
                    const PECalculator = (function() {
                        function calculate() {
                            const currentPrice = parseFloat(document.getElementById('pe-current-price').value) || 0;
                            const eps = parseFloat(document.getElementById('pe-eps').value) || 0;
                            const industryPE = parseFloat(document.getElementById('pe-industry-avg').value) || 0;
                            const growthRate = parseFloat(document.getElementById('pe-growth-rate').value) || 0;

                            if (currentPrice <= 0 || eps <= 0 || industryPE <= 0) {
                                document.getElementById('pe-results').style.display = 'none';
                                return;
                            }

                            const currentPE = currentPrice / eps;
                            const fairValue = eps * industryPE;
                            const pegRatio = growthRate > 0 ? currentPE / growthRate : 0;
                            
                            let valuationStatus = '';
                            const valuationDiff = ((currentPrice - fairValue) / fairValue) * 100;
                            
                            if (valuationDiff > 10) {
                                valuationStatus = `Overvalued by ${formatPercentage(Math.abs(valuationDiff))}`;
                            } else if (valuationDiff < -10) {
                                valuationStatus = `Undervalued by ${formatPercentage(Math.abs(valuationDiff))}`;
                            } else {
                                valuationStatus = 'Fairly Valued';
                            }

                            document.getElementById('pe-current-ratio').textContent = formatNumber(currentPE);
                            document.getElementById('pe-fair-value').textContent = formatCurrency(fairValue);
                            document.getElementById('pe-peg-ratio').textContent = formatNumber(pegRatio);
                            document.getElementById('pe-valuation-status').textContent = valuationStatus;
                            document.getElementById('pe-results').style.display = 'block';
                        }

                        function init() {
                            const inputs = ['pe-current-price', 'pe-eps', 'pe-industry-avg', 'pe-growth-rate'];
                            inputs.forEach(id => {
                                document.getElementById(id).addEventListener('input', calculate);
                            });
                        }

                        return { init };
                    })();

                    // Intrinsic Value Calculator
                    const IntrinsicValueCalculator = (function() {
                        function calculate() {
                            const bookValue = parseFloat(document.getElementById('intrinsic-book-value').value) || 0;
                            const roe = parseFloat(document.getElementById('intrinsic-roe').value) || 0;
                            const dividendYield = parseFloat(document.getElementById('intrinsic-dividend-yield').value) || 0;
                            const requiredReturn = parseFloat(document.getElementById('intrinsic-required-return').value) || 0;
                            const growthRate = parseFloat(document.getElementById('intrinsic-growth-rate').value) || 0;
                            const eps = parseFloat(document.getElementById('intrinsic-eps').value) || 0;

                            if (bookValue <= 0 || eps <= 0) {
                                document.getElementById('intrinsic-results').style.display = 'none';
                                return;
                            }

                            // Graham Number = √(22.5 × EPS × Book Value)
                            const grahamNumber = Math.sqrt(22.5 * eps * bookValue);

                            // Dividend Discount Model (simplified)
                            const dividendPerShare = (eps * dividendYield) / 100;
                            const ddmValue = requiredReturn > growthRate && requiredReturn > 0 && growthRate >= 0 ? 
                                            dividendPerShare / ((requiredReturn / 100) - (growthRate / 100)) : 0;

                            // Book Value Multiple (using ROE)
                            const bookMultiple = bookValue * (1 + (roe / 100));

                            // Average intrinsic value
                            const values = [grahamNumber, ddmValue, bookMultiple].filter(v => v > 0);
                            const avgIntrinsicValue = values.length > 0 ? values.reduce((a, b) => a + b) / values.length : 0;

                            document.getElementById('intrinsic-graham').textContent = formatCurrency(grahamNumber);
                            document.getElementById('intrinsic-ddm').textContent = ddmValue > 0 ? formatCurrency(ddmValue) : 'N/A';
                            document.getElementById('intrinsic-book-multiple').textContent = formatCurrency(bookMultiple);
                            document.getElementById('intrinsic-average').textContent = formatCurrency(avgIntrinsicValue);
                            document.getElementById('intrinsic-results').style.display = 'block';
                        }

                        function init() {
                            const inputs = ['intrinsic-book-value', 'intrinsic-roe', 'intrinsic-dividend-yield', 
                                          'intrinsic-required-return', 'intrinsic-growth-rate', 'intrinsic-eps'];
                            inputs.forEach(id => {
                                document.getElementById(id).addEventListener('input', calculate);
                            });
                        }

                        return { init };
                    })();

                    function init() {
                        DCFCalculator.init();
                        PECalculator.init();
                        IntrinsicValueCalculator.init();

                        // Initialize fair value section navigation
                        const fairValueBtns = document.querySelectorAll('.fair-value-btn');
                        fairValueBtns.forEach(btn => {
                            btn.addEventListener('click', () => {
                                switchFairValueSection(btn.dataset.section);
                            });
                        });
                    }

                    return { init };
                })();

                function init() {
                    // Initialize sub-tab navigation
                    const subTabs = document.querySelectorAll('.sub-nav-tab');
                    subTabs.forEach(tab => {
                        tab.addEventListener('click', () => {
                            switchSubTab(tab.dataset.subtab);
                        });
                    });

                    // Initialize all calculators
                    LoanCalculator.init();
                    InvestmentCalculator.init();
                    CAGRCalculator.init();
                    FairValueCalculator.init();
                }

                return {
                    init,
                    formatCurrency,
                    formatPercentage
                };
            })();

            // Stock Performance Tracker Module
            const StockTracker = (function() {
                const STORAGE_KEY = 'stockTrackerData';
                let editMode = false;

                function saveData() {
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(stockData));
                }

                function loadData() {
                    const data = localStorage.getItem(STORAGE_KEY);
                    if (data) {
                        try {
                            const parsed = JSON.parse(data);
                            if (parsed && typeof parsed === 'object') {
                                stockData.tickers = Array.isArray(parsed.tickers) ? parsed.tickers : [];
                                stockData.startYear = parsed.startYear || stockData.startYear;
                                stockData.prices = parsed.prices || {};
                            }
                        } catch (e) {
                            console.error('Failed to parse stored stock data', e);
                        }
                    }
                }
                
                function initializeYearSelect() {
                    const yearSelect = document.getElementById('start-year');
                    const currentYear = new Date().getFullYear();
                    
                    yearSelect.innerHTML = '';
                    for (let year = currentYear - 20; year <= currentYear; year++) {
                        const option = document.createElement('option');
                        option.value = year;
                        option.textContent = year;
                        if (year === currentYear - 5) {
                            option.selected = true;
                        }
                        yearSelect.appendChild(option);
                    }
                }

                function addTicker() {
                    const tickerInput = document.getElementById('ticker-input');
                    const ticker = tickerInput.value.trim().toUpperCase();
                    
                    if (!ticker || stockData.tickers.includes(ticker)) {
                        return;
                    }

                    stockData.tickers.push(ticker);
                    stockData.prices[ticker] = {};
                    tickerInput.value = '';

                    updateTickerTags();
                    updateGenerateButton();
                    saveData();
                    updateSummaryCards();
                }

                function removeTicker(ticker) {
                    const index = stockData.tickers.indexOf(ticker);
                    if (index > -1) {
                        stockData.tickers.splice(index, 1);
                        delete stockData.prices[ticker];
                        updateTickerTags();
                        updateGenerateButton();
                        
                        if (stockData.tickers.length === 0) {
                            document.getElementById('performance-table-container').style.display = 'none';
                            updateSummaryCards();
                        } else {
                            generatePerformanceTable();
                        }
                        saveData();
                        updateSummaryCards();
                    }
                }

                function updateTickerTags() {
                    const container = document.getElementById('ticker-tags');
                    container.innerHTML = '';
                    
                    stockData.tickers.forEach(ticker => {
                        const tag = document.createElement('div');
                        tag.className = 'ticker-tag';
                        tag.innerHTML = `
                            ${ticker}
                            <button class="remove-btn" onclick="FinancialDashboard.removeTicker('${ticker}')">×</button>
                        `;
                        container.appendChild(tag);
                    });
                }

                function updateGenerateButton() {
                    const btn = document.getElementById('generate-table-btn');
                    btn.style.display = editMode && stockData.tickers.length > 0 ? 'inline-flex' : 'none';
                }

               function applyEditMode() {
                   const management = document.querySelector('#stock-tracker .ticker-management');
                   if (management) management.style.display = editMode ? 'flex' : 'none';

                    const tags = document.getElementById('ticker-tags');
                    if (tags) tags.style.display = editMode ? 'flex' : 'none';

                   const inputs = document.querySelectorAll('#performance-table input.price-input');
                   inputs.forEach(inp => {
                       inp.readOnly = !editMode;
                       inp.style.display = editMode ? 'block' : 'none';
                   });

                   updateGenerateButton();
               }

                function toggleEditMode() {
                    editMode = !editMode;
                    const btn = document.getElementById('edit-stock-btn');
                    if (btn) btn.textContent = editMode ? 'Done' : 'Edit';
                    applyEditMode();
                }

                function generatePerformanceTable() {
                    if (stockData.tickers.length === 0) return;

                    stockData.startYear = parseInt(document.getElementById('start-year').value);
                    const currentYear = new Date().getFullYear();
                    const years = [];
                    
                    for (let year = stockData.startYear; year <= currentYear; year++) {
                        years.push(year);
                    }

                    // Generate table header
                    const headerRow = document.getElementById('table-header');
                    headerRow.innerHTML = '<tr><th>Year</th>' + 
                        stockData.tickers.map(ticker => `<th>${ticker}</th>`).join('') + '</tr>';

                    // Generate table body
                    const tbody = document.getElementById('table-body');
                    tbody.innerHTML = '';

                    years.forEach((year, yearIndex) => {
                        const row = document.createElement('tr');
                        row.innerHTML = `<td><strong>${year}</strong></td>`;
                        
                        stockData.tickers.forEach(ticker => {
                            const cell = document.createElement('td');
                            const priceInput = document.createElement('input');
                            priceInput.type = 'number';
                            priceInput.className = 'price-input';
                            priceInput.step = '0.01';
                            priceInput.min = '0';
                            priceInput.value = stockData.prices[ticker][year] || '';
                            priceInput.readOnly = !editMode;
                            
                            priceInput.addEventListener('input', () => {
                                const price = parseFloat(priceInput.value);
                                if (!isNaN(price) && price > 0) {
                                    stockData.prices[ticker][year] = price;
                                } else {
                                    delete stockData.prices[ticker][year];
                                }
                                updateGrowthCalculations(ticker);
                                saveData();
                            });
                            
                            cell.appendChild(priceInput);
                            
                            // Add growth display
                            if (yearIndex > 0) {
                                const growthDiv = document.createElement('div');
                                growthDiv.id = `growth-${ticker}-${year}`;
                                growthDiv.className = 'growth-neutral';
                                growthDiv.style.fontSize = '0.85rem';
                                growthDiv.style.marginTop = '4px';
                                growthDiv.style.textAlign = 'right';
                                cell.appendChild(growthDiv);
                            }
                            
                            row.appendChild(cell);
                        });
                        
                        tbody.appendChild(row);
                    });

                    // Add summary rows
                    const totalGrowthRow = document.createElement('tr');
                    totalGrowthRow.className = 'summary-row';
                    totalGrowthRow.innerHTML = '<td><strong>Total Growth</strong></td>';
                    
                   const cagrRow = document.createElement('tr');
                   cagrRow.className = 'summary-row';
                   cagrRow.innerHTML = '<td><strong>CAGR</strong></td>';

                    const chartRow = document.createElement('tr');
                    chartRow.className = 'summary-row';
                    chartRow.innerHTML = '<td><strong>Chart</strong></td>';

                   stockData.tickers.forEach(ticker => {
                        const totalCell = document.createElement('td');
                        totalCell.id = `total-growth-${ticker}`;
                        totalCell.className = 'growth-neutral';
                        totalGrowthRow.appendChild(totalCell);

                        const cagrCell = document.createElement('td');
                        cagrCell.id = `cagr-${ticker}`;
                        cagrCell.className = 'growth-neutral';
                        cagrRow.appendChild(cagrCell);

                        const chartCell = document.createElement('td');
                        const chartBtn = document.createElement('button');
                        chartBtn.className = 'chart-btn';
                        chartBtn.innerHTML = '<ion-icon name="stats-chart"></ion-icon>';
                        chartBtn.addEventListener('click', () => showChart(ticker));
                        chartCell.appendChild(chartBtn);
                        chartRow.appendChild(chartCell);
                   });

                   tbody.appendChild(totalGrowthRow);
                   tbody.appendChild(cagrRow);
                    tbody.appendChild(chartRow);

                    document.getElementById('performance-table-container').style.display = 'block';

                    // Calculate initial growth values
                    stockData.tickers.forEach(ticker => updateGrowthCalculations(ticker));
                    saveData();
                    updateSummaryCards();
                    applyEditMode();
                }

                function updateGrowthCalculations(ticker) {
                    const currentYear = new Date().getFullYear();
                    const prices = stockData.prices[ticker];
                    
                    // Calculate year-over-year growth
                    for (let year = stockData.startYear + 1; year <= currentYear; year++) {
                        const currentPrice = prices[year];
                        const previousPrice = prices[year - 1];
                        const growthElement = document.getElementById(`growth-${ticker}-${year}`);
                        
                        if (currentPrice && previousPrice && growthElement) {
                            const growth = ((currentPrice - previousPrice) / previousPrice) * 100;
                            growthElement.textContent = (growth >= 0 ? '+' : '') + growth.toFixed(2) + '%';
                            growthElement.className = growth >= 0 ? 'growth-positive' : 'growth-negative';
                        } else if (growthElement) {
                            growthElement.textContent = '---%';
                            growthElement.className = 'growth-neutral';
                        }
                    }

                    // Calculate total growth and CAGR
                    const yearsWithData = Object.keys(prices).map(y => parseInt(y)).filter(y => !isNaN(y)).sort((a,b) => a-b);
                    const firstYear = yearsWithData[0];
                    const latestYear = yearsWithData[yearsWithData.length - 1];
                    const startPrice = prices[firstYear];
                    const endPrice = prices[latestYear];
                    
                    const totalGrowthElement = document.getElementById(`total-growth-${ticker}`);
                    const cagrElement = document.getElementById(`cagr-${ticker}`);
                    
                    if (startPrice && endPrice && totalGrowthElement && cagrElement) {
                        const totalGrowth = ((endPrice - startPrice) / startPrice) * 100;
                        const years = yearsWithData.length - 1;
                        const cagr = years > 0 ? (Math.pow(endPrice / startPrice, 1 / years) - 1) * 100 : 0;
                        
                        totalGrowthElement.textContent = (totalGrowth >= 0 ? '+' : '') + totalGrowth.toFixed(2) + '%';
                        totalGrowthElement.className = totalGrowth >= 0 ? 'growth-positive' : 'growth-negative';
                        
                        cagrElement.textContent = (cagr >= 0 ? '+' : '') + cagr.toFixed(2) + '%';
                        cagrElement.className = cagr >= 0 ? 'growth-positive' : 'growth-negative';
                    } else {
                        if (totalGrowthElement) {
                            totalGrowthElement.textContent = '---%';
                            totalGrowthElement.className = 'growth-neutral';
                        }
                        if (cagrElement) {
                            cagrElement.textContent = '---%';
                            cagrElement.className = 'growth-neutral';
                        }
                    }

                    updateSummaryCards();
                }

                function updateSummaryCards() {
                    const container = document.getElementById('stock-summary-cards');
                    if (!container) return;

                    if (stockData.tickers.length === 0) {
                        container.style.display = 'none';
                        return;
                    }

                    let latestYear = stockData.startYear;
                    stockData.tickers.forEach(ticker => {
                        const years = Object.keys(stockData.prices[ticker]).map(y => parseInt(y));
                        if (years.length) {
                            const localLatest = Math.max(...years);
                            if (localLatest > latestYear) latestYear = localLatest;
                        }
                    });

                    document.getElementById('summary-investment-range').textContent = `${stockData.startYear} to ${latestYear} (${latestYear - stockData.startYear} years)`;

                    let bestTicker = null,
                        worstTicker = null,
                        consistentTicker = null;
                    let bestCagr = -Infinity,
                        worstCagr = Infinity,
                        bestGrowth = 0,
                        worstGrowth = 0,
                        lowestVol = Infinity;

                    stockData.tickers.forEach(ticker => {
                        const prices = stockData.prices[ticker];
                        const yearsWithData = Object.keys(prices).map(y => parseInt(y)).filter(y => !isNaN(y)).sort((a,b) => a-b);
                        if (yearsWithData.length === 0) return;
                        const tickerLatest = yearsWithData[yearsWithData.length - 1];
                        const startYear = yearsWithData[0];
                        const startPrice = prices[startYear];
                        const endPrice = prices[tickerLatest];
                        const spanYears = yearsWithData.length - 1;
                        if (!startPrice || !endPrice || spanYears <= 0) return;

                        const totalGrowth = ((endPrice - startPrice) / startPrice) * 100;
                        const cagr = (Math.pow(endPrice / startPrice, 1 / spanYears) - 1) * 100;

                        if (cagr > bestCagr) {
                            bestCagr = cagr;
                            bestTicker = ticker;
                            bestGrowth = totalGrowth;
                        }

                        if (cagr < worstCagr) {
                            worstCagr = cagr;
                            worstTicker = ticker;
                            worstGrowth = totalGrowth;
                        }

                        const growths = [];
                        for (let y = startYear + 1; y <= tickerLatest; y++) {
                            const cp = prices[y];
                            const pp = prices[y - 1];
                            if (cp && pp) {
                                growths.push(((cp - pp) / pp) * 100);
                            }
                        }
                        if (growths.length > 0) {
                            const mean = growths.reduce((a,b) => a + b, 0) / growths.length;
                            const variance = growths.reduce((sum, g) => sum + Math.pow(g - mean, 2), 0) / growths.length;
                            const stdev = Math.sqrt(variance);
                            if (stdev < lowestVol) {
                                lowestVol = stdev;
                                consistentTicker = ticker;
                            }
                        }
                    });

                    const bestEl = document.getElementById('summary-best');
                    const worstEl = document.getElementById('summary-worst');
                    const consEl = document.getElementById('summary-consistent');

                    bestEl.textContent = bestTicker ? `${bestTicker}: CAGR ${bestCagr.toFixed(2)}%, Total ${bestGrowth.toFixed(2)}%` : '---';
                    worstEl.textContent = worstTicker ? `${worstTicker}: CAGR ${worstCagr.toFixed(2)}%, Total ${worstGrowth.toFixed(2)}%` : '---';
                    consEl.textContent = consistentTicker ? `${consistentTicker} • Lowest volatility` : '---';

                    container.style.display = 'flex';
                }
                function showChart(initialTicker) {
                    const modal = document.getElementById("stock-chart-popup");
                    const canvas = document.getElementById("chartjs-canvas");
                    const titleEl = document.getElementById("chart-popup-title");
                    if (titleEl) titleEl.textContent = "Stock Chart";

                    const tickerContainer = document.getElementById('chart-ticker-select');
                    tickerContainer.innerHTML = '';
                    stockData.tickers.forEach(t => {
                        const label = document.createElement('label');
                        const cb = document.createElement('input');
                        cb.type = 'checkbox';
                        cb.value = t;
                        cb.checked = t === initialTicker;
                        label.appendChild(cb);
                        label.appendChild(document.createTextNode(' ' + t));
                        tickerContainer.appendChild(label);
                        cb.addEventListener('change', updateChart);
                    });

                    const priceRadio = document.getElementById('chart-type-price');
                    const growthRadio = document.getElementById('chart-type-growth');
                    priceRadio.checked = true;
                    growthRadio.checked = false;
                    priceRadio.addEventListener('change', updateChart);
                    growthRadio.addEventListener('change', updateChart);

                    function updateChart() {
                        const selectedTickers = Array.from(tickerContainer.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.value);
                        const chartType = growthRadio.checked ? 'growth' : 'price';
                        const allYears = new Set();
                        selectedTickers.forEach(t => {
                            const obj = stockData.prices[t] || {};
                            Object.keys(obj).forEach(y => allYears.add(parseInt(y)));
                        });
                        let years = Array.from(allYears).sort((a,b)=>a-b);
                        if (chartType === 'growth') {
                            years = years.filter((y,i,arr)=>arr.includes(y-1));
                        }
                        const colors = selectedTickers.map((_, i) => `hsl(${(i * 360 / selectedTickers.length) % 360},70%,60%)`);
                        const datasets = selectedTickers.map((t, idx) => {
                            const pricesObj = stockData.prices[t] || {};
                            const data = years.map(y => {
                                if (chartType === 'growth') {
                                    const prev = pricesObj[y-1];
                                    const cur = pricesObj[y];
                                    return (prev && cur) ? ((cur - prev) / prev) * 100 : null;
                                }
                                return pricesObj[y] || null;
                            });
                            return {
                                label: t,
                                data,
                                borderColor: colors[idx],
                                backgroundColor: colors[idx],
                                fill: false,
                                tension: 0.2
                            };
                        });
                        if (window.stockChart) window.stockChart.destroy();
                        window.stockChart = new Chart(canvas.getContext('2d'), {
                            type: 'line',
                            data: { labels: years, datasets },
                            options: {
                                responsive: true,
                                scales: {
                                    y: chartType === 'price' ? { type: 'logarithmic' } : { type: 'linear', ticks: { callback: v => v + '%' } }
                                }
                            }
                        });
                    }

                    updateChart();
                    modal.style.display = 'flex';
                }


                function closeChart() {
                    document.getElementById("stock-chart-popup").style.display = "none";
                }


                

                function init() {
                    initializeYearSelect();
                    loadData();

                    document.getElementById('start-year').value = stockData.startYear;
                    updateTickerTags();
                    updateGenerateButton();

                    if (stockData.tickers.length > 0) {
                        generatePerformanceTable();
                        updateSummaryCards();
                    }

                    document.getElementById('edit-stock-btn').addEventListener('click', toggleEditMode);
                    document.getElementById('add-ticker-btn').addEventListener('click', addTicker);
                    document.getElementById('generate-table-btn').addEventListener('click', generatePerformanceTable);

                    document.getElementById('ticker-input').addEventListener('keypress', (e) => {
                        if (e.key === 'Enter') {
                            addTicker();
                        }
                    });

                    document.getElementById('chart-popup-close').addEventListener('click', closeChart);
                    document.getElementById('stock-chart-popup').addEventListener('click', (e) => {
                        if (e.target === e.currentTarget) closeChart();
                    });

                    applyEditMode();
                }

                return {
                    init,
                    removeTicker
                };
            })();

            // Public API
            function init() {
                TabManager.init();
                PortfolioManager.init();
                Calculator.init();
                StockTracker.init();
            }

            function removeTicker(ticker) {
                StockTracker.removeTicker(ticker);
            }

            return {
                init,
                removeTicker
            };
        })();

        // Initialize the application when DOM is ready
        document.addEventListener('DOMContentLoaded', function() {
            FinancialDashboard.init();

            const header = document.querySelector('.header');
            const nav = document.querySelector('.nav-tabs');

            function updateNavOffset() {
                if (header && nav) {
                    nav.style.top = header.offsetHeight + 'px';
                }
            }

            updateNavOffset();
            window.addEventListener('resize', updateNavOffset);
        });
