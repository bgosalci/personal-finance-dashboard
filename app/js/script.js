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

            // Dialog Manager for alerts and prompts
            const DialogManager = (function() {
                const modal = document.getElementById('dialog-modal');
                const messageEl = document.getElementById('dialog-message');
                const inputGroup = document.getElementById('dialog-input-group');
                const inputEl = document.getElementById('dialog-input');
                const okBtn = document.getElementById('dialog-ok');
                const cancelBtn = document.getElementById('dialog-cancel');
                const closeBtn = document.getElementById('dialog-close');

                function open(type, message, def, actionLabel) {
                    messageEl.textContent = message || '';
                    if (type === 'prompt') {
                        inputGroup.style.display = 'block';
                        inputEl.value = def || '';
                        inputEl.focus();
                    } else {
                        inputGroup.style.display = 'none';
                    }
                    cancelBtn.style.display = type === 'alert' ? 'none' : 'inline-flex';
                    cancelBtn.textContent = 'No';

                    if (type === 'alert') {
                        okBtn.textContent = 'Close';
                    } else {
                        okBtn.textContent = actionLabel ? `Yes, ${actionLabel}` : 'Yes';
                    }
                    modal.style.display = 'flex';

                    return new Promise(resolve => {
                        function cleanup(result) {
                            modal.style.display = 'none';
                            okBtn.removeEventListener('click', onOk);
                            cancelBtn.removeEventListener('click', onCancel);
                            closeBtn.removeEventListener('click', onCancel);
                            modal.removeEventListener('click', onBackdrop);
                            resolve(result);
                        }
                        function onOk() {
                            cleanup(type === 'prompt' ? inputEl.value : true);
                        }
                        function onCancel() {
                            cleanup(type === 'prompt' ? null : false);
                        }
                        function onBackdrop(e) {
                            if (e.target === modal) onCancel();
                        }
                        okBtn.addEventListener('click', onOk);
                        cancelBtn.addEventListener('click', onCancel);
                        closeBtn.addEventListener('click', onCancel);
                        modal.addEventListener('click', onBackdrop);
                    });
                }

                return {
                    alert: msg => open('alert', msg),
                    confirm: (msg, action) => open('confirm', msg, null, action),
                    prompt: (msg, def, action) => open('prompt', msg, def, action)
                };
            })();

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

            // Portfolio Storage Module
            const PortfolioStorage = (function() {
                const POSITIONS_KEY = 'portfolio_positions';
                const SNAPSHOTS_KEY = 'portfolio_snapshots';
                const LEGACY_KEY = 'portfolioData';
                let portfolioPositions = [];
                let portfolioSnapshots = [];

                function generateId() {
                    return 'pos_' + Math.random().toString(36).substring(2, 11);
                }

                function load() {
                    const p = localStorage.getItem(POSITIONS_KEY);
                    if (p) {
                        try {
                            portfolioPositions = JSON.parse(p) || [];
                        } catch (e) {
                            portfolioPositions = [];
                        }
                    }
                    const s = localStorage.getItem(SNAPSHOTS_KEY);
                    if (s) {
                        try {
                            portfolioSnapshots = JSON.parse(s) || [];
                        } catch (e) {
                            portfolioSnapshots = [];
                        }
                    }
                    migrateLegacyData();
                }

                function save() {
                    localStorage.setItem(POSITIONS_KEY, JSON.stringify(portfolioPositions));
                    localStorage.setItem(SNAPSHOTS_KEY, JSON.stringify(portfolioSnapshots));
                }

                function migrateLegacyData() {
                    const legacy = localStorage.getItem(LEGACY_KEY);
                    if (!legacy) return;
                    try {
                        const old = JSON.parse(legacy) || [];
                        old.forEach(item => {
                            addPosition({
                                symbol: item.ticker,
                                purchase_price_per_share: item.purchasePrice || item.avgPrice,
                                quantity: item.quantity,
                                purchase_date: new Date().toISOString().split('T')[0]
                            });
                        });
                        localStorage.removeItem(LEGACY_KEY);
                    } catch (e) {
                        // ignore malformed legacy data
                    }
                }

                function validatePosition(pos) {
                    if (!pos) return null;
                    const symbol = String(pos.symbol || '').trim().toUpperCase();
                    const quantity = parseFloat(pos.quantity);
                    const price = parseFloat(pos.purchase_price_per_share);
                    const date = pos.purchase_date || new Date().toISOString().split('T')[0];
                    if (!symbol || isNaN(quantity) || quantity <= 0 || isNaN(price) || price <= 0) {
                        return null;
                    }
                    return {
                        id: pos.id || generateId(),
                        symbol,
                        purchase_date: date,
                        purchase_price_per_share: price,
                        quantity,
                        total_investment: parseFloat((price * quantity).toFixed(2))
                    };
                }

                function addPosition(pos) {
                    const validated = validatePosition(pos);
                    if (!validated) return false;
                    portfolioPositions.push(validated);
                    save();
                    return true;
                }

                function createSnapshot(dateStr) {
                    const snapshot_date = dateStr || new Date().toISOString().split('T')[0];
                    const total_portfolio_value = portfolioPositions.reduce((sum, p) => sum + p.quantity * p.purchase_price_per_share, 0);
                    const total_invested = portfolioPositions.reduce((sum, p) => sum + p.total_investment, 0);
                    const gain_loss = total_portfolio_value - total_invested;
                    const gain_loss_percentage = total_invested ? (gain_loss / total_invested) * 100 : 0;
                    portfolioSnapshots.push({
                        snapshot_date,
                        total_portfolio_value: parseFloat(total_portfolio_value.toFixed(2)),
                        total_invested: parseFloat(total_invested.toFixed(2)),
                        gain_loss: parseFloat(gain_loss.toFixed(2)),
                        gain_loss_percentage: parseFloat(gain_loss_percentage.toFixed(2)),
                        positions_snapshot: JSON.parse(JSON.stringify(portfolioPositions))
                    });
                    save();
                    checkQuota();
                    return portfolioSnapshots[portfolioSnapshots.length - 1];
                }

                function getUsage() {
                    let total = 0;
                    for (let i = 0; i < localStorage.length; i++) {
                        const key = localStorage.key(i);
                        const value = localStorage.getItem(key);
                        if (key && value) total += key.length + value.length;
                    }
                    return total;
                }

                function checkQuota() {
                    const limit = 5 * 1024 * 1024;
                    let usage = getUsage();
                    if (usage > limit * 0.9) {
                        while (usage > limit * 0.9 && portfolioSnapshots.length > 0) {
                            portfolioSnapshots.shift();
                            usage = getUsage();
                        }
                        save();
                    }
                }

                function exportData() {
                    return JSON.stringify({ portfolioPositions, portfolioSnapshots });
                }

                function init() {
                    load();
                }

                return { init, addPosition, createSnapshot, exportData, portfolioPositions, portfolioSnapshots, save };
            })();

            // Portfolio Management Module
            const PortfolioManager = (function() {
                const STORAGE_KEY = 'portfolioData';
                let investments = [];
                let pieChart = null;
                let barChart = null;
                const COLOR_KEY = 'portfolioColors';
                const COLOR_PALETTE = [
                    '#e6194b','#3cb44b','#ffe119','#4363d8','#f58231',
                    '#911eb4','#46f0f0','#f032e6','#bcf60c','#fabebe',
                    '#008080','#e6beff','#9a6324','#fffac8','#800000',
                    '#aaffc3','#808000','#ffd8b1','#000075','#808080'
                ];
                let tickerColors = {};
                let colorIndex = 0;
                let tickerValid = false;

                const addBtn = document.getElementById('add-investment-btn');
                const getPriceBtn = document.getElementById('get-last-price-btn');
                const modal = document.getElementById('investment-modal');
                const form = document.getElementById('investment-form');
                const tickerInput = document.getElementById('investment-ticker');
                const closeBtn = document.getElementById('investment-close');
                const cancelBtn = document.getElementById('cancel-investment-btn');
                const saveAddBtn = document.getElementById('save-add-another-btn');
                const totalDisplay = document.getElementById('investment-total-value');

                const editModal = document.getElementById('edit-investment-modal');
                const editForm = document.getElementById('edit-investment-form');
                const editClose = document.getElementById('edit-investment-close');
                const editCancel = document.getElementById('edit-cancel-btn');
                const editRecordGroup = document.getElementById("edit-record-group");
                const editRecordSelect = document.getElementById("edit-record-select");
                const editTotal = document.getElementById('edit-total-value');
                let editIndex = null;

                const historyBtn = document.getElementById('transaction-history-btn');
                const historyModal = document.getElementById('transaction-history-modal');
                const historyClose = document.getElementById('transaction-history-close');
                const historyBody = document.getElementById('transaction-history-body');
                const API_KEY = 'd1nf8h1r01qovv8iu2dgd1nf8h1r01qovv8iu2e0';

                async function fetchQuote(ticker) {
                    const url = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(ticker)}&token=${API_KEY}`;
                    try {
                        const res = await fetch(url);
                        const data = await res.json();
                        if (data && typeof data.c === 'number') {
                            return parseFloat(data.c);
                        }
                    } catch (e) {
                        // ignore errors and return null
                    }
                    return null;
                }

                async function lookupSymbol(ticker) {
                    const url = `https://finnhub.io/api/v1/search?q=${encodeURIComponent(ticker)}&token=${API_KEY}`;
                    try {
                        const res = await fetch(url);
                        const data = await res.json();
                        if (data && Array.isArray(data.result)) {
                            const match = data.result.find(item => item.symbol && item.symbol.toUpperCase() === ticker.toUpperCase());
                            if (match) {
                                return match.description || '';
                            }
                        }
                    } catch (e) {
                        // ignore errors and return null
                    }
                    return null;
                }

                function loadData() {
                    const data = localStorage.getItem(STORAGE_KEY);
                    if (data) {
                        try {
                            investments = JSON.parse(data) || [];
                            let migrated = false;
                            investments.forEach(inv => {
                                if (inv.purchasePrice === undefined && inv.avgPrice !== undefined) {
                                    inv.purchasePrice = inv.avgPrice;
                                    delete inv.avgPrice;
                                    migrated = true;
                                }
                                if (!inv.tradeDate && inv.purchaseDate) {
                                    inv.tradeDate = inv.purchaseDate;
                                    delete inv.purchaseDate;
                                    migrated = true;
                                }
                                if (!inv.tradeDate) {
                                    inv.tradeDate = new Date().toISOString().split('T')[0];
                                    migrated = true;
                                }
                            });
                            if (migrated) {
                                localStorage.setItem(STORAGE_KEY, JSON.stringify(investments));
                            }
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
                    const data = aggregateInvestments();
                    data.forEach(inv => {
                        const value = inv.quantity * inv.lastPrice;
                        totalValue += value;
                        totalCost += inv.quantity * inv.purchasePrice;
                    });
                    const totalPL = totalValue - totalCost;
                    const totalPLPct = totalCost ? (totalPL / totalCost) * 100 : 0;

                    document.getElementById('portfolio-total-value').textContent = formatCurrency(totalValue);
                    document.getElementById('portfolio-total-pl').textContent = formatCurrency(totalPL);
                    document.getElementById('portfolio-total-plpct').textContent = totalPLPct.toFixed(2) + '%';
                }

                function generateColor(idx) {
                    if (idx < COLOR_PALETTE.length) {
                        return COLOR_PALETTE[idx];
                    }
                    const hue = (idx * 137.508) % 360;
                    return `hsl(${hue},70%,60%)`;
                }

                function assignColor(ticker) {
                    if (!tickerColors[ticker]) {
                        tickerColors[ticker] = generateColor(colorIndex);
                        colorIndex++;
                    }
                }

                function getColor(ticker) {
                    assignColor(ticker);
                    return tickerColors[ticker];
                }

                function updateCharts() {
                    const data = aggregateInvestments();
                    const labels = data.map(inv => inv.ticker);
                    const values = data.map(inv => inv.quantity * inv.lastPrice);
                    const total = values.reduce((a, b) => a + b, 0);
                    const plPercents = data.map(inv => {
                        const cost = inv.quantity * inv.purchasePrice;
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

                function aggregateInvestments() {
                    const map = {};
                    investments.forEach((inv, idx) => {
                        if (!map[inv.ticker]) {
                            map[inv.ticker] = {
                                ticker: inv.ticker,
                                name: inv.name,
                                quantity: 0,
                                cost: 0,
                                last: 0,
                                count: 0,
                                index: idx
                            };
                        }
                        const item = map[inv.ticker];
                        if (item.index > idx) item.index = idx;
                        item.quantity += inv.quantity;
                        item.cost += inv.purchasePrice * inv.quantity;
                        item.last += inv.lastPrice;
                        item.count += 1;
                    });
                    return Object.values(map).map(it => ({
                        ticker: it.ticker,
                        name: it.name,
                        quantity: it.quantity,
                        purchasePrice: it.quantity ? it.cost / it.quantity : 0,
                        lastPrice: it.count ? it.last / it.count : 0,
                        index: it.index
                    }));
                }

                function renderTable() {
                    const tbody = document.getElementById('portfolio-body');
                    tbody.innerHTML = '';
                    const displayData = aggregateInvestments();
                    displayData.forEach((inv) => {
                        const row = document.createElement('tr');
                        row.dataset.index = inv.index;
                        row.draggable = true;
                        row.innerHTML = `
                            <td class="drag-handle-cell"><ion-icon name="reorder-three-outline"></ion-icon></td>
                            <td>${inv.ticker}</td>
                            <td>${inv.name}</td>
                            <td class="number-cell">${formatCurrency(inv.purchasePrice)}</td>
                            <td class="number-cell">${inv.quantity}</td>
                            <td class="number-cell">${formatCurrency(inv.lastPrice)}</td>
                            <td class="value-cell"></td>
                            <td class="pl-cell"></td>
                            <td class="plpct-cell"></td>
                            <td class="actions-cell">
                                <button class="icon-btn edit-btn" data-index="${inv.index}" title="Edit">
                                    <svg width="16" height="16" viewBox="0 0 512 512"><polygon points="364.13 125.25 87 403 64 448 108.99 425 386.75 147.87 364.13 125.25" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32px"/><path d="M420.69,68.69,398.07,91.31l22.62,22.63,22.62-22.63a16,16,0,0,0,0-22.62h0A16,16,0,0,0,420.69,68.69Z" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32px"/></svg>
                                </button>
                                <button class="icon-btn delete-btn" data-index="${inv.index}" title="Delete">
                                    <svg width="16" height="16" viewBox="0 0 512 512"><path d="M112,112l20,320c.95,18.49,14.4,32,32,32H348c17.67,0,30.87-13.51,32-32l20-320" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32px"/><line x1="80" y1="112" x2="432" y2="112" style="stroke:currentColor;stroke-linecap:round;stroke-miterlimit:10;stroke-width:32px"/><path d="M192,112V72h0a23.93,23.93,0,0,1,24-24h80a23.93,23.93,0,0,1,24,24h0v40" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32px"/><line x1="256" y1="176" x2="256" y2="400" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32px"/><line x1="184" y1="176" x2="192" y2="400" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32px"/><line x1="328" y1="176" x2="320" y2="400" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32px"/></svg>
                                </button>
                            </td>`;
                        addDragHandlers(row);
                        tbody.appendChild(row);
                    });

                    updateRows(displayData);
                    updateTotals();
                    updateCharts();
                }

                function updateRows(displayData) {
                    const rows = document.querySelectorAll('#portfolio-body tr');
                    rows.forEach((row, idx) => {
                        const inv = displayData[idx];
                        const value = inv.quantity * inv.lastPrice;
                        const cost = inv.quantity * inv.purchasePrice;
                        const pl = value - cost;
                        const plPct = cost ? (pl / cost) * 100 : 0;

                        row.querySelector('.value-cell').textContent = formatCurrency(value);
                        row.querySelector('.pl-cell').textContent = formatCurrency(pl);
                        row.querySelector('.pl-cell').className = 'pl-cell ' + (pl >= 0 ? 'growth-positive' : 'growth-negative');
                        row.querySelector('.plpct-cell').textContent = plPct.toFixed(2) + '%';
                        row.querySelector('.plpct-cell').className = 'plpct-cell ' + (plPct >= 0 ? 'growth-positive' : 'growth-negative');
                    });
                }

                let dragStartIndex = null;

                function handleDragStart() {
                    dragStartIndex = parseInt(this.dataset.index, 10);
                    this.classList.add('dragging');
                }

                function handleDragOver(e) {
                    e.preventDefault();
                }

                function handleDrop() {
                    const dropIndex = parseInt(this.dataset.index, 10);
                    if (dragStartIndex === null || dragStartIndex === dropIndex) return;
                    const item = investments.splice(dragStartIndex, 1)[0];
                    const targetIndex = dragStartIndex < dropIndex ? dropIndex - 1 : dropIndex;
                    investments.splice(targetIndex, 0, item);
                    dragStartIndex = null;
                    saveData();
                    renderTable();
                }

                function handleDragEnd() {
                    this.classList.remove('dragging');
                }

                function addDragHandlers(row) {
                    row.addEventListener('dragstart', handleDragStart);
                    row.addEventListener('dragover', handleDragOver);
                    row.addEventListener('drop', handleDrop);
                    row.addEventListener('dragend', handleDragEnd);
                }

                function openModal() {
                    form.reset();
                    tickerValid = false;
                    totalDisplay.textContent = formatCurrency(0);
                    const dateInput = document.getElementById('investment-purchase-date');
                    const today = new Date().toISOString().split('T')[0];
                    if (dateInput) {
                        dateInput.max = today;
                        dateInput.value = today;
                    }
                    modal.style.display = 'flex';
                    tickerInput.focus();
                }

                function closeModal() {
                    modal.style.display = 'none';
                }

                function handleFormInput() {
                    const qty = parseFloat(document.getElementById('investment-quantity').value) || 0;
                    const lastPrice = parseFloat(document.getElementById('investment-last-price').value) || 0;
                    totalDisplay.textContent = formatCurrency(qty * lastPrice);
                }

                async function handleTickerLookup() {
                    const ticker = tickerInput.value.trim().toUpperCase();
                    if (!ticker) {
                        tickerValid = false;
                        return;
                    }
                    const [price, description] = await Promise.all([
                        fetchQuote(ticker),
                        lookupSymbol(ticker)
                    ]);

                    if (description) {
                        document.getElementById('investment-name').value = description;
                        tickerValid = true;
                    } else {
                        tickerValid = false;
                        document.getElementById('investment-name').value = '';
                        DialogManager.alert('Ticker symbol does not exist');
                    }

                    if (price !== null) {
                        const lastPriceEl = document.getElementById('investment-last-price');
                        lastPriceEl.value = price;
                        handleFormInput();
                    }
                }

                function addFromForm(resetAfter) {
                    const ticker = document.getElementById('investment-ticker').value.trim().toUpperCase();
                    const name = document.getElementById('investment-name').value.trim();
                    const quantity = parseFloat(document.getElementById('investment-quantity').value) || 0;
                    const purchasePrice = parseFloat(document.getElementById('investment-purchase-price').value) || 0;
                    const purchaseDate = document.getElementById('investment-purchase-date').value;
                    const lastPrice = parseFloat(document.getElementById('investment-last-price').value) || 0;
                    if (!tickerValid) {
                        DialogManager.alert('Please enter a valid ticker symbol.');
                        return;
                    }
                    const today = new Date().toISOString().split('T')[0];
                    if (!ticker || quantity <= 0 || purchasePrice <= 0 || lastPrice <= 0) return;
                    if (!purchaseDate || purchaseDate > today) {
                        DialogManager.alert('Purchase date cannot be in the future.');
                        return;
                    }


                    assignColor(ticker);
                    investments.push({ ticker, name, quantity, purchasePrice, lastPrice, tradeDate: purchaseDate });
                    saveData();
                    renderTable();

                    if (resetAfter) {
                        form.reset();
                        const dateField = document.getElementById('investment-purchase-date');
                        if (dateField) {
                            dateField.value = today;
                            dateField.max = today;
                        }
                        totalDisplay.textContent = formatCurrency(0);
                        document.getElementById('investment-ticker').focus();
                    } else {
                        closeModal();
                    }
                }

                function populateEditFields(idx) {
                    editIndex = idx;
                    const inv = investments[idx];
                    document.getElementById('edit-name').value = inv.name || '';
                    document.getElementById('edit-quantity').value = inv.quantity;
                    document.getElementById('edit-purchase-price').value = inv.purchasePrice;
                    const dateField = document.getElementById('edit-purchase-date');
                    const today = new Date().toISOString().split('T')[0];
                    if (dateField) {
                        dateField.max = today;
                        dateField.value = inv.tradeDate || today;
                    }
                    document.getElementById('edit-last-price').value = inv.lastPrice;
                    editTotal.textContent = formatCurrency(inv.quantity * inv.lastPrice);
                }

                function openEditModal(index) {
                    const ticker = investments[index].ticker;
                    const matches = [];
                    investments.forEach((inv, idx) => {
                        if (inv.ticker === ticker) matches.push(idx);
                    });

                    editRecordSelect.innerHTML = '';
                    if (matches.length > 1) {
                        matches.forEach(i => {
                            const inv = investments[i];
                            const opt = document.createElement('option');
                            opt.value = i;
                            opt.textContent = `${inv.quantity} @ ${formatCurrency(inv.purchasePrice)} on ${inv.tradeDate}`;
                            editRecordSelect.appendChild(opt);
                        });
                        editRecordGroup.style.display = 'block';
                        editRecordSelect.value = index;
                        editRecordSelect.onchange = () => {
                            const idx = parseInt(editRecordSelect.value, 10);
                            populateEditFields(idx);
                        };
                    } else {
                        editRecordGroup.style.display = 'none';
                        editRecordSelect.onchange = null;
                    }

                    populateEditFields(index);
                    editModal.style.display = 'flex';
                    fetchQuote(ticker).then(price => {
                        if (price !== null) {
                            document.getElementById('edit-last-price').value = price;
                            handleEditInput();
                        }
                    });
                }

                function closeEditModal() {
                    editModal.style.display = 'none';
                    editIndex = null;
                }

                function renderHistory() {
                    historyBody.innerHTML = '';
                    investments.forEach(inv => {
                        const tr = document.createElement('tr');
                        tr.innerHTML = `
                            <td>${inv.ticker}</td>
                            <td>${inv.name || ''}</td>
                            <td class="number-cell">${inv.quantity}</td>
                            <td class="number-cell">${formatCurrency(inv.purchasePrice)}</td>
                            <td class="number-cell">${formatCurrency(inv.lastPrice)}</td>
                            <td>${inv.tradeDate}</td>`;
                        historyBody.appendChild(tr);
                    });
                }

                function openHistoryModal() {
                    renderHistory();
                    historyModal.style.display = 'flex';
                }

                function closeHistoryModal() {
                    historyModal.style.display = 'none';
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
                    const purchase = parseFloat(document.getElementById('edit-purchase-price').value) || 0;
                    const date = document.getElementById('edit-purchase-date').value;
                    const last = parseFloat(document.getElementById('edit-last-price').value) || 0;
                    if (qty <= 0 || purchase <= 0 || last <= 0) return;
                    const today = new Date().toISOString().split('T')[0];
                    if (!date || date > today) {
                        DialogManager.alert('Purchase date cannot be in the future.');
                        return;
                    }

                    const inv = investments[editIndex];
                    inv.name = name;
                    inv.quantity = qty;
                    inv.purchasePrice = purchase;
                    inv.lastPrice = last;
                    inv.tradeDate = date;

                    saveData();
                    renderTable();
                    closeEditModal();
                }

                async function handleRowAction(e) {
                    const btn = e.target.closest('button');
                    if (!btn) return;
                    if (btn.classList.contains('edit-btn')) {
                        const idx = parseInt(btn.dataset.index, 10);
                        openEditModal(idx);
                    } else if (btn.classList.contains('delete-btn')) {
                        const idx = parseInt(btn.dataset.index, 10);
                        const confirmed = await DialogManager.confirm('Delete this investment?', 'Delete');
                        if (confirmed) {
                            const removed = investments.splice(idx, 1)[0];
                            if (removed && !investments.some(inv => inv.ticker === removed.ticker)) {
                                delete tickerColors[removed.ticker];
                                colorIndex = Object.keys(tickerColors).length;
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
                    tickerInput.addEventListener('change', handleTickerLookup);
                    tickerInput.addEventListener('blur', handleTickerLookup);
                    tickerInput.addEventListener('input', () => { tickerValid = false; });

                    document.getElementById('portfolio-body').addEventListener('click', handleRowAction);
                    editClose.addEventListener('click', closeEditModal);
                    editCancel.addEventListener('click', closeEditModal);
                    editForm.addEventListener('input', handleEditInput);
                    editForm.addEventListener('submit', saveEdit);
                    editModal.addEventListener('click', (e) => { if (e.target === editModal) closeEditModal(); });

                    historyBtn.addEventListener('click', openHistoryModal);
                    historyClose.addEventListener('click', closeHistoryModal);
                    historyModal.addEventListener('click', (e) => { if (e.target === historyModal) closeHistoryModal(); });

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
                const API_KEY = 'd1nf8h1r01qovv8iu2dgd1nf8h1r01qovv8iu2e0';
                const getPriceBtn = document.getElementById('get-stock-last-price-btn');

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

                async function fetchLatestPrices() {
                    if (stockData.tickers.length === 0) return;
                    const currentYear = new Date().getFullYear();
                    const updates = stockData.tickers.map(ticker => {
                        const url = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(ticker)}&token=${API_KEY}`;
                        return fetch(url)
                            .then(res => res.json())
                            .then(data => {
                                if (data && typeof data.c === 'number') {
                                    const price = parseFloat(data.c);
                                    stockData.prices[ticker][currentYear] = price;
                                    const input = document.querySelector(`#table-body input.price-input[data-ticker="${ticker}"][data-year="${currentYear}"]`);
                                    if (input) input.value = price;
                                    updateGrowthCalculations(ticker);
                                }
                            })
                            .catch(() => {});
                    });
                    await Promise.all(updates);
                    saveData();
                    updateSummaryCards();
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
                        row.dataset.year = year;
                        row.innerHTML = `<td><strong>${year}</strong></td>`;
                        
                        stockData.tickers.forEach(ticker => {
                            const cell = document.createElement('td');
                            const priceInput = document.createElement('input');
                            priceInput.type = 'number';
                            priceInput.className = 'price-input';
                            priceInput.step = '0.01';
                            priceInput.min = '0';
                            priceInput.value = stockData.prices[ticker][year] || '';
                            priceInput.dataset.ticker = ticker;
                            priceInput.dataset.year = year;
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
                    if (getPriceBtn) getPriceBtn.addEventListener('click', fetchLatestPrices);

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

            // Stock Finance Performance Module
            const StockFinance = (function() {
                const API_KEY = 'hQmiS4FP5wJQrg8rX3gTMane2digQcLF';
                const tickerInput = document.getElementById('finance-ticker');
                const dateInput = document.getElementById('finance-date');
                const timeframeSelect = document.getElementById('finance-timeframe');
                const fetchBtn = document.getElementById('fetch-financials-btn');
                const tableContainer = document.getElementById('financials-table-container');
                const tableHead = document.getElementById('financials-header');
                const tableBody = document.getElementById('financials-body');
                const subTabs = document.querySelectorAll('#finance-subtabs .sub-nav-tab');
                const tooltip = document.getElementById('tooltip');

                const ORDER = {
                    income: [
                        'revenues',
                        'cost_of_revenue',
                        'gross_profit',
                        'operating_expenses',
                        'operating_income_loss',
                        'income_loss_before_income_tax',
                        'income_tax_expense_benefit',
                        'net_income_loss'
                    ],
                    balance: [
                        'cash_and_cash_equivalents',
                        'short_term_investments',
                        'net_receivables',
                        'inventory',
                        'total_current_assets',
                        'property_plant_and_equipment_net',
                        'total_assets',
                        'accounts_payable',
                        'short_term_debt',
                        'total_current_liabilities',
                        'long_term_debt',
                        'total_liabilities',
                        'total_shareholders_equity',
                        'total_liabilities_and_shareholders_equity'
                    ],
                    cash: [
                        'net_cash_flow_operating',
                        'net_cash_flow_investing',
                        'net_cash_flow_financing',
                        'net_cash_flow'
                    ]
                };

                let reports = [];
                let currentSubTab = 'income';

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

                function formatNumber(val) {
                    if (val === undefined || val === null || val === '') return '';
                    const num = Number(val);
                    if (isNaN(num)) return val;
                    return num.toLocaleString('en-US');
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
                    const url = `https://api.polygon.io/vX/reference/financials?ticker=${encodeURIComponent(ticker)}&filing_date.gte=${date}&timeframe=${timeframe}&limit=4&apiKey=${API_KEY}`;
                    try {
                        const res = await fetch(url);
                        const data = await res.json();
                        if (data && Array.isArray(data.results) && data.results.length > 0) {
                            reports = data.results.sort((a, b) => new Date(a.filing_date) - new Date(b.filing_date));
                            renderTable();
                        } else {
                            reports = [];
                            tableHead.innerHTML = '';
                            tableBody.innerHTML = '<tr><td>No data available</td></tr>';
                            tableContainer.style.display = 'block';
                        }
                    } catch (e) {
                        reports = [];
                        tableHead.innerHTML = '';
                        tableBody.innerHTML = '<tr><td>Failed to load data</td></tr>';
                        tableContainer.style.display = 'block';
                    }
                }

                function renderTable() {
                    if (!reports.length) return;

                    const keyMap = {
                        income: 'income_statement',
                        balance: 'balance_sheet',
                        cash: 'cash_flow_statement'
                    };
                    const statementKey = keyMap[currentSubTab];

                    tableHead.innerHTML = '';
                    tableBody.innerHTML = '';

                    const headerRow = document.createElement('tr');
                    let headerHtml = '<th>Label</th>';
                    reports.forEach(r => {
                        const yr = r.fiscal_year || '';
                        const period = r.fiscal_period || '';
                        headerHtml += `<th>${yr} ${period}</th>`;
                    });
                    headerRow.innerHTML = headerHtml;
                    tableHead.appendChild(headerRow);

                    const allKeys = new Set();
                    reports.forEach(r => {
                        const stmt = r.financials ? r.financials[statementKey] : {};
                        Object.keys(stmt || {}).forEach(k => allKeys.add(k));
                    });

                    const orderedKeys = Array.from(allKeys).sort((a, b) => {
                        const order = ORDER[currentSubTab] || [];
                        const ia = order.indexOf(a);
                        const ib = order.indexOf(b);
                        if (ia === -1 && ib === -1) return a.localeCompare(b);
                        if (ia === -1) return 1;
                        if (ib === -1) return -1;
                        return ia - ib;
                    });

                    orderedKeys.forEach(k => {
                        let label = k;
                        for (const r of reports) {
                            const item = r.financials && r.financials[statementKey] ? r.financials[statementKey][k] : undefined;
                            if (item && item.label) { label = item.label; break; }
                        }
                        const shortLabel = label.length > 20 ? label.slice(0,17) + '...' : label;
                        let rowHtml = `<td class="has-tooltip" data-tooltip="${label}">${shortLabel}</td>`;
                        let diffHtml = '<td></td>';
                        let prevVal = null;
                        reports.forEach((r, idx) => {
                            const item = r.financials && r.financials[statementKey] ? r.financials[statementKey][k] : undefined;
                            if (item && item.value !== undefined && item.value !== null) {
                                const value = Number(item.value);
                                const formatted = formatNumber(value);
                                const cls = value < 0 ? 'negative-num' : '';
                                rowHtml += `<td class="${cls}">${formatted}</td>`;
                                if (idx === 0 || prevVal === null || prevVal === 0) {
                                    diffHtml += '<td class="diff-cell">---</td>';
                                } else {
                                    const diff = ((value - prevVal) / Math.abs(prevVal)) * 100;
                                    const dcls = diff >= 0 ? 'growth-positive' : 'growth-negative';
                                    diffHtml += `<td class="diff-cell ${dcls}">${diff >= 0 ? '+' : ''}${diff.toFixed(2)}%</td>`;
                                }
                                prevVal = value;
                            } else {
                                rowHtml += '<td></td>';
                                diffHtml += '<td class="diff-cell">---</td>';
                                prevVal = null;
                            }
                        });
                        const tr = document.createElement('tr');
                        tr.innerHTML = rowHtml;
                        tableBody.appendChild(tr);

                        const diffTr = document.createElement('tr');
                        diffTr.className = 'diff-row';
                        diffTr.innerHTML = diffHtml;
                        tableBody.appendChild(diffTr);
                    });

                    tableContainer.style.display = 'block';
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

            // Public API
            function init() {
                TabManager.init();
                PortfolioManager.init();
                Calculator.init();
                StockTracker.init();
                StockFinance.init();
            }

            function removeTicker(ticker) {
                StockTracker.removeTicker(ticker);
            }

            return {
                init,
                removeTicker
            };
        })();

        // Market Status Indicator
        const MarketStatus = (function() {
            // Uses Polygon.io to check current US market status
            const API_KEY = 'hQmiS4FP5wJQrg8rX3gTMane2digQcLF';
            const ledEl = document.getElementById('market-led');
            const sessionEl = document.getElementById('market-session');
            let timer = null;

            async function update() {
                if (!ledEl) return;
                try {
                    const url = `https://api.polygon.io/v1/marketstatus/now?apiKey=${API_KEY}`;
                    const res = await fetch(url);
                    const data = await res.json();
                    const isOpen = data && data.market === 'open';
                    ledEl.classList.toggle('led-green', isOpen);
                    ledEl.classList.toggle('led-red', !isOpen);
                    if (sessionEl) {
                        if (data && data.market) {
                            sessionEl.textContent = data.market;
                            sessionEl.style.display = 'inline';
                        } else {
                            sessionEl.textContent = '';
                            sessionEl.style.display = 'none';
                        }
                    }
                } catch (e) {
                    // ignore errors
                }
            }

            function start() {
                update();
                timer = setInterval(update, 300000); // 5 minutes
            }

            function init() {
                start();
            }

            return { init };
        })();

        // Initialize the application when DOM is ready
        document.addEventListener('DOMContentLoaded', function() {
            FinancialDashboard.init();
            MarketStatus.init();

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
