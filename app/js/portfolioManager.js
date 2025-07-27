const PortfolioManager = (function() {
    const PORTFOLIO_LIST_KEY = 'portfolioList';
    const STORAGE_PREFIX = 'portfolioData_';
    let portfolios = [];
    let currentPortfolioId = null;
    let summaryMode = false;
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
    const addPortfolioBtn = document.getElementById('add-portfolio-btn');
    const removePortfolioBtn = document.getElementById('remove-portfolio-btn');
    const portfolioTabs = document.getElementById('portfolio-tabs');
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
    const menuToggle = document.getElementById('portfolio-menu-toggle');
    const actionsMenu = document.getElementById('portfolio-actions-menu');
    const summaryToggle = document.getElementById('summary-toggle');
    const API_KEY = 'd1nf8h1r01qovv8iu2dgd1nf8h1r01qovv8iu2e0';

    async function fetchQuote(ticker, currency = 'USD') {
        const url = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(ticker)}&token=${API_KEY}&currency=${encodeURIComponent(currency)}`;
        try {
            const res = await fetch(url);
            const data = await res.json();
            if (data && typeof data.c === 'number') {
                return { price: parseFloat(data.c), currency: data.currency || currency };
            }
        } catch (e) {
            // ignore errors and return null
        }
        return { price: null, currency };
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

    function getStorageKey(id) {
        return STORAGE_PREFIX + id;
    }

    function loadPortfolioList() {
        const list = localStorage.getItem(PORTFOLIO_LIST_KEY);
        if (list) {
            try { portfolios = JSON.parse(list) || []; } catch (e) { portfolios = []; }
        }
        portfolios.forEach(p => { if (p.show === undefined) p.show = true; });
        if (portfolios.length === 0) {
            portfolios = [{ id: 'pf1', name: 'Portfolio 1', show: true }];
            const legacy = localStorage.getItem('portfolioData');
            if (legacy) {
                localStorage.setItem(getStorageKey('pf1'), legacy);
                localStorage.removeItem('portfolioData');
            }
            savePortfolioList();
        }
        currentPortfolioId = portfolios[0].id;
    }

    function savePortfolioList() {
        localStorage.setItem(PORTFOLIO_LIST_KEY, JSON.stringify(portfolios));
    }

    function loadData() {
        if (summaryMode) {
            investments = [];
            portfolios.forEach(p => {
                if (p.show !== false) {
                    const data = localStorage.getItem(getStorageKey(p.id));
                    if (data) {
                        try { investments = investments.concat(JSON.parse(data) || []); } catch (e) {}
                    }
                }
            });
        } else {
            const data = localStorage.getItem(getStorageKey(currentPortfolioId));
            if (data) {
                try {
                    investments = JSON.parse(data) || [];
                } catch (e) {
                    investments = [];
                }
            } else {
                investments = [];
            }
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
                if (!inv.currency) {
                    inv.currency = 'USD';
                    migrated = true;
                }
            });
            if (migrated && !summaryMode) {
                localStorage.setItem(getStorageKey(currentPortfolioId), JSON.stringify(investments));
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
        if (summaryMode) return;
        localStorage.setItem(getStorageKey(currentPortfolioId), JSON.stringify(investments));
        localStorage.setItem(COLOR_KEY, JSON.stringify(tickerColors));
    }

    function formatCurrency(value, currency = 'USD') {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value);
    }

    function convertCurrency(value, from, to, rates) {
        if (!rates || from === to) return value;
        const fromRate = rates[from];
        const toRate = rates[to];
        if (!fromRate || !toRate) return value;
        const usdValue = value / fromRate;
        return usdValue * toRate;
    }

    async function updateTotals() {
        let totalValue = 0;
        let totalCost = 0;
        let totalValueBase = 0;
        let totalCostBase = 0;
        const baseCurrency = Settings.getBaseCurrency ? Settings.getBaseCurrency() : 'USD';
        const data = aggregateInvestments();
        const ratesData = await ForexData.getRates();
        const rates = ratesData && ratesData.conversion_rates ? ratesData.conversion_rates : null;
        let hasForeign = false;
        data.forEach(inv => {
            const value = inv.quantity * inv.lastPrice;
            const cost = inv.quantity * inv.purchasePrice;
            totalValue += value;
            totalCost += cost;
            totalValueBase += convertCurrency(value, inv.currency, baseCurrency, rates);
            totalCostBase += convertCurrency(cost, inv.currency, baseCurrency, rates);
            if (inv.currency !== baseCurrency) hasForeign = true;
        });
        const totalPL = totalValue - totalCost;
        const totalPLPct = totalCost ? (totalPL / totalCost) * 100 : 0;

        document.getElementById('portfolio-total-value').textContent = formatCurrency(totalValue, baseCurrency);
        document.getElementById('portfolio-total-pl').textContent = formatCurrency(totalPL, baseCurrency);
        document.getElementById('portfolio-total-plpct').textContent = totalPLPct.toFixed(2) + '%';

        const baseRow = document.getElementById('portfolio-base-total-row');
        if (baseRow) {
            if (hasForeign) {
                const basePL = totalValueBase - totalCostBase;
                const basePLPct = totalCostBase ? (basePL / totalCostBase) * 100 : 0;
                document.getElementById('portfolio-base-currency-label').textContent = baseCurrency;
                document.getElementById('portfolio-base-total-value').textContent = formatCurrency(totalValueBase, baseCurrency);
                document.getElementById('portfolio-base-total-pl').textContent = formatCurrency(basePL, baseCurrency);
                document.getElementById('portfolio-base-total-plpct').textContent = basePLPct.toFixed(2) + '%';
                baseRow.style.display = '';
            } else {
                baseRow.style.display = 'none';
            }
        }
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

    function renderPortfolioTabs() {
        if (!portfolioTabs) return;
        portfolioTabs.innerHTML = '';
        const summaryTab = document.createElement('button');
        summaryTab.className = 'sub-nav-tab' + (summaryMode ? ' active' : '');
        summaryTab.textContent = 'Summary';
        summaryTab.dataset.id = 'summary';
        portfolioTabs.appendChild(summaryTab);
        portfolios.forEach(p => {
            const btn = document.createElement('button');
            btn.className = 'sub-nav-tab' + (!summaryMode && p.id === currentPortfolioId ? ' active' : '');
            btn.textContent = p.name;
            btn.dataset.id = p.id;
            portfolioTabs.appendChild(btn);
        });
    }

    function switchPortfolio(id) {
        summaryMode = (id === 'summary');
        if (!summaryMode) currentPortfolioId = id;
        loadData();
        renderPortfolioTabs();
        renderTable();
        removePortfolioBtn.style.display = summaryMode ? 'none' : 'inline-flex';
        addBtn.style.display = summaryMode ? 'none' : 'inline-flex';
        getPriceBtn.style.display = summaryMode ? 'none' : 'inline-flex';
        if (summaryToggle) {
            summaryToggle.style.display = summaryMode ? 'none' : 'inline-flex';
            if (!summaryMode) {
                const pf = portfolios.find(p => p.id === currentPortfolioId);
                summaryToggle.checked = !pf || pf.show !== false;
            }
        }
    }

    async function addPortfolio() {
        const name = await DialogManager.prompt('Enter portfolio name:', '');
        if (!name) return;
        const id = 'pf' + Date.now();
        portfolios.push({ id, name, show: true });
        savePortfolioList();
        localStorage.setItem(getStorageKey(id), '[]');
        switchPortfolio(id);
    }

    async function removePortfolio() {
        if (summaryMode) return;
        if (portfolios.length <= 1) return;
        const confirmed = await DialogManager.confirm('Delete this portfolio?', 'Delete');
        if (!confirmed) return;
        const idx = portfolios.findIndex(p => p.id === currentPortfolioId);
        if (idx !== -1) {
            localStorage.removeItem(getStorageKey(currentPortfolioId));
            portfolios.splice(idx, 1);
            savePortfolioList();
            const next = portfolios[idx] || portfolios[idx-1];
            switchPortfolio(next.id);
        }
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
                    currency: inv.currency || 'USD',
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
            if (!item.currency && inv.currency) {
                item.currency = inv.currency;
            }
        });
        return Object.values(map).map(it => ({
            ticker: it.ticker,
            name: it.name,
            currency: it.currency,
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
                <td>${inv.currency || ''}</td>
                <td>${inv.name}</td>
                <td class="number-cell">${formatCurrency(inv.purchasePrice, inv.currency)}</td>
                <td class="number-cell">${inv.quantity}</td>
                <td class="number-cell">${formatCurrency(inv.lastPrice, inv.currency)}</td>
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

            row.querySelector('.value-cell').textContent = formatCurrency(value, inv.currency);
            row.querySelector('.pl-cell').textContent = formatCurrency(pl, inv.currency);
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
        switchPortfolio(currentPortfolioId);
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
        if (summaryMode) return;
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
        const currency = document.getElementById('investment-currency').value || 'USD';
        totalDisplay.textContent = formatCurrency(qty * lastPrice, currency);
    }

    async function handleTickerLookup() {
        const ticker = tickerInput.value.trim().toUpperCase();
        if (!ticker) {
            tickerValid = false;
            return;
        }
        const [{ price, currency }, description] = await Promise.all([
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

        const lastPriceEl = document.getElementById('investment-last-price');
        const currencyEl = document.getElementById('investment-currency');
        if (price !== null) {
            lastPriceEl.value = price;
        }
        if (currencyEl) currencyEl.value = currency || 'USD';
        handleFormInput();
    }

    function addFromForm(resetAfter) {
        if (summaryMode) return;
        const ticker = document.getElementById('investment-ticker').value.trim().toUpperCase();
        const name = document.getElementById('investment-name').value.trim();
        const quantity = parseFloat(document.getElementById('investment-quantity').value) || 0;
        const purchasePrice = parseFloat(document.getElementById('investment-purchase-price').value) || 0;
        const purchaseDate = document.getElementById('investment-purchase-date').value;
        const lastPrice = parseFloat(document.getElementById('investment-last-price').value) || 0;
        const currency = document.getElementById('investment-currency').value || 'USD';
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
        investments.push({ ticker, name, quantity, purchasePrice, lastPrice, tradeDate: purchaseDate, currency });
        saveData();
        renderTable();

        if (resetAfter) {
            form.reset();
            const dateField = document.getElementById('investment-purchase-date');
            if (dateField) {
                dateField.value = today;
                dateField.max = today;
            }
            totalDisplay.textContent = formatCurrency(0, 'USD');
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
        const currencyField = document.getElementById('edit-currency');
        if (currencyField) currencyField.value = inv.currency || 'USD';
        editTotal.textContent = formatCurrency(inv.quantity * inv.lastPrice, inv.currency);
    }

    function openEditModal(index) {
        if (summaryMode) return;
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
                opt.textContent = `${inv.quantity} @ ${formatCurrency(inv.purchasePrice, inv.currency)} on ${inv.tradeDate}`;
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
        fetchQuote(ticker, investments[index].currency || 'USD').then(res => {
            if (res.price !== null) {
                document.getElementById('edit-last-price').value = res.price;
            }
            const currencyField = document.getElementById('edit-currency');
            if (currencyField) currencyField.value = res.currency || 'USD';
            handleEditInput();
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
                <td>${inv.currency || ''}</td>
                <td>${inv.name || ''}</td>
                <td class="number-cell">${inv.quantity}</td>
                <td class="number-cell">${formatCurrency(inv.purchasePrice, inv.currency)}</td>
                <td class="number-cell">${formatCurrency(inv.lastPrice, inv.currency)}</td>
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
        const currency = document.getElementById('edit-currency').value || 'USD';
        editTotal.textContent = formatCurrency(qty * price, currency);
    }

    async function fetchLastPrices() {
        if (investments.length === 0) return;

        const priceMap = {};
        const currencyMap = {};
        const tickers = Array.from(new Set(investments.map(inv => inv.ticker)));

        const fetches = tickers.map(ticker => {
            const inv = investments.find(i => i.ticker === ticker);
            const curr = inv ? inv.currency || 'USD' : 'USD';
            return fetchQuote(ticker, curr).then(res => {
                if (res.price !== null) {
                    priceMap[ticker] = res.price;
                    currencyMap[ticker] = res.currency || curr;
                }
            }).catch(() => {});
        });

        await Promise.all(fetches);

        investments.forEach(inv => {
            if (priceMap[inv.ticker] !== undefined) {
                inv.lastPrice = priceMap[inv.ticker];
                inv.currency = currencyMap[inv.ticker] || inv.currency;
            }
        });

        saveData();
        renderTable();
    }

    function saveEdit(e) {
        e.preventDefault();
        if (summaryMode) return;
        if (editIndex === null) return;
        const name = document.getElementById('edit-name').value || '';
        const qty = parseFloat(document.getElementById('edit-quantity').value) || 0;
        const purchase = parseFloat(document.getElementById('edit-purchase-price').value) || 0;
        const date = document.getElementById('edit-purchase-date').value;
        const last = parseFloat(document.getElementById('edit-last-price').value) || 0;
        const currency = document.getElementById('edit-currency').value || 'USD';
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
        inv.currency = currency;

        saveData();
        renderTable();
        closeEditModal();
    }

    async function handleRowAction(e) {
        if (summaryMode) return;
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
        loadPortfolioList();
        summaryMode = false;
        loadData();
        renderPortfolioTabs();
        if (portfolioTabs) {
            portfolioTabs.addEventListener('click', (e) => {
                const btn = e.target.closest('button');
                if (btn && btn.dataset.id) {
                    switchPortfolio(btn.dataset.id);
                }
            });
        }
        addPortfolioBtn.addEventListener('click', addPortfolio);
        removePortfolioBtn.addEventListener('click', removePortfolio);
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

        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const expanded = actionsMenu.classList.toggle('open');
            menuToggle.setAttribute('aria-expanded', expanded);
        });

        if (summaryToggle) {
            summaryToggle.addEventListener('change', () => {
                const pf = portfolios.find(p => p.id === currentPortfolioId);
                if (pf) {
                    pf.show = summaryToggle.checked;
                    savePortfolioList();
                }
            });
        }

        actionsMenu.addEventListener('click', (e) => {
            if (e.target.closest('button')) {
                actionsMenu.classList.remove('open');
                menuToggle.setAttribute('aria-expanded', 'false');
            }
        });

        document.addEventListener('click', (e) => {
            if (actionsMenu.classList.contains('open') &&
                !actionsMenu.contains(e.target) &&
                e.target !== menuToggle) {
                actionsMenu.classList.remove('open');
                menuToggle.setAttribute('aria-expanded', 'false');
            }
        });

        switchPortfolio(currentPortfolioId);
    }

    return { init, fetchQuote, fetchLastPrices };
})();
