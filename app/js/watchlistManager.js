const WatchlistManager = (function() {
    const STORAGE_KEY = 'watchlistData';
    const POS_BG = 'rgba(16, 185, 129, 0.35)';
    const NEG_BG = 'rgba(239, 68, 68, 0.35)';
    let watchlist = [];
    let ws = null;
    let reconnectTimer = null;
    // Reconnect attempts use exponential backoff up to one minute
    const RECONNECT_BASE_DELAY = 5000;
    const RECONNECT_MAX_DELAY = 60000;
    let reconnectDelay = RECONNECT_BASE_DELAY;

    const addBtn = document.getElementById('add-watchstock-btn');
    const getPriceBtn = document.getElementById('watchlist-get-price-btn');
    const modal = document.getElementById('watchlist-modal');
    const form = document.getElementById('watchlist-form');
    const tickerInput = document.getElementById('watchlist-ticker');
    const nameInput = document.getElementById('watchlist-name');
    const currencySelect = document.getElementById('watchlist-currency');
    const closeBtn = document.getElementById('watchlist-close');
    const cancelBtn = document.getElementById('watchlist-cancel-btn');
    const tbody = document.getElementById('watchlist-body');
    let tickerValid = false;
    let dragStartIndex = null;

    function save() {
        try {
            const data = JSON.stringify(watchlist, (k, v) => k === 'delta' ? undefined : v);
            localStorage.setItem(STORAGE_KEY, data);
        } catch (e) {}
    }

    function load() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            if (data) watchlist = JSON.parse(data) || [];
        } catch (e) {
            watchlist = [];
        }
    }


    function connectWebSocket() {
        if (typeof WebSocket === 'undefined' || typeof QuotesService === 'undefined') return;
        const token = QuotesService.getApiKey ? QuotesService.getApiKey() : '';
        if (!token || watchlist.length === 0 || ws) return;
        try {
            ws = new WebSocket('wss://ws.finnhub.io?token=' + encodeURIComponent(token));
            ws.addEventListener('open', () => {
                reconnectDelay = RECONNECT_BASE_DELAY;
                watchlist.forEach(item => subscribeTicker(item.ticker));
            });
            ws.addEventListener('message', handleWsMessage);
            ws.addEventListener('close', scheduleReconnect);
            ws.addEventListener('error', scheduleReconnect);
        } catch (e) {
            ws = null;
        }
    }

    function scheduleReconnect() {
        if (ws) {
            try { ws.close(); } catch (e) {}
            ws = null;
        }
        if (reconnectTimer) clearTimeout(reconnectTimer);
        reconnectTimer = setTimeout(() => {
            reconnectTimer = null;
            connectWebSocket();
        }, reconnectDelay);
        reconnectDelay = Math.min(reconnectDelay * 2, RECONNECT_MAX_DELAY); // exponential backoff
    }

    function reconnectWebSocket() {
        if (ws) {
            try { ws.close(); } catch (e) {}
            ws = null;
        }
        if (reconnectTimer) {
            clearTimeout(reconnectTimer);
            reconnectTimer = null;
        }
        reconnectDelay = RECONNECT_BASE_DELAY;
        connectWebSocket();
    }

    function subscribeTicker(ticker) {
        if (ws && ws.readyState === WebSocket.OPEN) {
            try { ws.send(JSON.stringify({ type: 'subscribe', symbol: ticker })); } catch (e) {}
        }
    }

    function unsubscribeTicker(ticker) {
        if (ws && ws.readyState === WebSocket.OPEN) {
            try { ws.send(JSON.stringify({ type: 'unsubscribe', symbol: ticker })); } catch (e) {}
        }
    }

    function handleWsMessage(ev) {
        let updated = false;
        try {
            const msg = JSON.parse(ev.data);
            if (msg.type === 'trade' && Array.isArray(msg.data)) {
                msg.data.forEach(trade => {
                    const t = String(trade.s || '').toUpperCase();
                    const item = watchlist.find(w => w.ticker === t);
                    if (item) {
                        const price = typeof trade.p === 'number' ? trade.p : null;
                        if (price !== null) {
                            const prev = item.price;
                            item.price = price;
                            item.delta = typeof prev === 'number' ? price - prev : 0;
                            PriceStorage.save(t, price);
                            if (typeof item.prevClose === 'number') {
                                item.change = price - item.prevClose;
                                item.changePct = item.prevClose ? (item.change / item.prevClose) * 100 : null;
                            }
                            if (typeof item.high === 'number') {
                                if (item.high === null || price > item.high) item.high = price;
                            }
                            if (typeof item.low === 'number') {
                                if (item.low === null || price < item.low) item.low = price;
                            }
                            item.lastUpdate = Date.now();
                            updated = true;
                        }
                    }
                });
            }
        } catch (e) {}
        if (updated) {
            save();
            render();
        }
    }

    function formatNumber(val) {
        return typeof val === 'number' ? val.toFixed(2) : '--';
    }

    function formatPercent(val) {
        return typeof val === 'number' ? val.toFixed(2) + '%' : '--';
    }

    function formatDateTime(ts) {
        if (!ts) return '--';
        const d = new Date(ts);
        const pad = n => String(n).padStart(2, '0');
        const date = `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
        const time = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
        return `${date} ${time}`;
    }

    function flashCell(cell, delta) {
        if (!cell) return;
        const baseColor = window.getComputedStyle(cell).backgroundColor;
        const flashColor = delta > 0 ? POS_BG : delta < 0 ? NEG_BG : baseColor;
        cell.style.backgroundColor = flashColor;
        if (cell._flashTimer) clearTimeout(cell._flashTimer);
        if (delta !== 0) {
            cell._flashTimer = setTimeout(() => {
                cell.style.backgroundColor = baseColor;
                cell._flashTimer = null;
            }, 1000);
        }
    }

    function render() {
        if (!tbody) return;
        tbody.innerHTML = '';
        watchlist.forEach((item, index) => {
            const tr = document.createElement('tr');
            tr.dataset.index = index;
            tr.draggable = true;
            const changeClass = typeof item.change === 'number' ? (item.change < 0 ? 'growth-negative' : item.change > 0 ? 'growth-positive' : '') : '';
            const changePctClass = typeof item.changePct === 'number' ? (item.changePct < 0 ? 'growth-negative' : item.changePct > 0 ? 'growth-positive' : '') : '';
            const overlayClass = typeof item.change === 'number' ? (item.change < 0 ? 'price-overlay-negative' : item.change > 0 ? 'price-overlay-positive' : '') : '';
            const range = (typeof item.high === 'number' && typeof item.low === 'number')
                ? Math.max(0, item.high - item.low)
                : null;
            tr.innerHTML = `
                <td><strong>${item.ticker}</strong></td>
                <td>${item.name || ''}</td>
                <td>${item.currency || ''}</td>
                <td class="number-cell watchlist-price-cell ${overlayClass}"><strong>${formatNumber(item.price)}</strong></td>
                <td class="number-cell watchlist-price-cell ${changeClass} ${overlayClass}">${formatNumber(item.change)}</td>
                <td class="number-cell watchlist-price-cell ${changePctClass} ${overlayClass}">${formatPercent(item.changePct)}</td>
                <td class="number-cell">${formatNumber(item.high)}</td>
                <td class="number-cell">${formatNumber(item.low)}</td>
                <td class="number-cell"${range !== null ? ` data-sort-value="${range}"` : ''}>${range !== null ? formatNumber(range) : '—'}</td>
                <td class="number-cell">${formatNumber(item.open)}</td>
                <td class="number-cell">${formatNumber(item.prevClose)}</td>
                <td>${formatDateTime(item.lastUpdate)}</td>
                <td class="actions-cell">
                    <button class="icon-btn delete-btn" data-index="${index}" title="${I18n.t('watchlist.actions.delete')}" aria-label="${I18n.t('watchlist.actions.delete')}">
                        <svg width="16" height="16" viewBox="0 0 512 512"><path d="M112,112l20,320c.95,18.49,14.4,32,32,32H348c17.67,0,30.87-13.51,32-32l20-320" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32px"/><line x1="80" y1="112" x2="432" y2="112" style="stroke:currentColor;stroke-linecap:round;stroke-miterlimit:10;stroke-width:32px"/><path d="M192,112V72h0a23.93,23.93,0,0,1,24-24h80a23.93,23.93,0,0,1,24,24h0v40" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32px"/><line x1="256" y1="176" x2="256" y2="400" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32px"/><line x1="184" y1="176" x2="192" y2="400" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32px"/><line x1="328" y1="176" x2="320" y2="400" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32px"/></svg>
                    </button>
                </td>
            `;
            const cells = tr.querySelectorAll('td');
            const delBtn = tr.querySelector('.delete-btn');
            delBtn.addEventListener('click', () => deleteStock(index));
            addDragHandlers(tr);
            tbody.appendChild(tr);
            const baseBg = getComputedStyle(document.documentElement).getPropertyValue('--background-tertiary') || '#374151';
            cells[3].style.backgroundColor = baseBg;
            cells[4].style.backgroundColor = baseBg;
            cells[5].style.backgroundColor = baseBg;
            flashCell(cells[3], item.delta || 0);
            flashCell(cells[4], item.delta || 0);
            flashCell(cells[5], item.delta || 0);
            item.delta = 0;
        });
    }

    async function deleteStock(index) {
        const confirmed = await DialogManager.confirm(I18n.t('watchlist.dialogs.deleteStock'), I18n.t('dialog.delete'));
        if (confirmed) {
            const removed = watchlist.splice(index, 1)[0];
            save();
            render();
            if (removed && removed.ticker) unsubscribeTicker(removed.ticker);
            if (watchlist.length === 0) {
                if (ws) { ws.close(); ws = null; }
                if (reconnectTimer) { clearTimeout(reconnectTimer); reconnectTimer = null; }
            }
        }
    }

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
        const item = watchlist.splice(dragStartIndex, 1)[0];
        const targetIndex = dragStartIndex < dropIndex ? dropIndex - 1 : dropIndex;
        watchlist.splice(targetIndex, 0, item);
        dragStartIndex = null;
        save();
        render();
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
        if (modal) {
            modal.style.display = 'flex';
            tickerInput.value = '';
            nameInput.value = '';
            tickerValid = false;
            if (currencySelect) currencySelect.value = 'USD';
            tickerInput.focus();
        }
    }

    function closeModal() {
        if (modal) modal.style.display = 'none';
    }

    function addStock(e) {
        e.preventDefault();
        const ticker = (tickerInput.value || '').trim().toUpperCase();
        const name = (nameInput.value || '').trim();
        const currency = currencySelect.value || 'USD';
        if (!tickerValid) {
            DialogManager.alert(I18n.t('dialog.enterValidTicker'));
            return;
        }
        if (watchlist.some(w => w.ticker === ticker)) {
            closeModal();
            form.reset();
            return;
        }
        watchlist.push({ ticker, name, currency });
        save();
        render();
        closeModal();
        form.reset();
        subscribeTicker(ticker);
        if (!ws) connectWebSocket();
    }

    async function handleTickerLookup() {
        const ticker = (tickerInput.value || '').trim().toUpperCase();
        if (!ticker) {
            tickerValid = false;
            return;
        }
        const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000));
        try {
            const [{ price, currency }, searchData] = await Promise.race([
                Promise.all([
                    QuotesService.fetchQuote(ticker),
                    QuotesService.searchSymbol(ticker)
                ]),
                timeout
            ]);
            if (currency) currencySelect.value = currency;
            let description = '';
            if (searchData && Array.isArray(searchData.result)) {
                const match = searchData.result.find(item => (item.symbol || '').toUpperCase() === ticker);
                if (match) description = match.description || '';
            }
            if (description) {
                nameInput.value = description;
                tickerValid = true;
            } else {
                tickerValid = false;
                nameInput.value = '';
                DialogManager.alert(I18n.t('dialog.tickerNotExist'));
            }
        } catch (e) {
            tickerValid = true;
        }
    }

    async function fetchLastPrices() {
        if (watchlist.length === 0) return;
        const updates = watchlist.map(async item => {
            try {
                const { raw } = await QuotesService.fetchQuote(item.ticker);
                if (raw) {
                    const prev = item.price;
                    item.price = typeof raw.c === 'number' ? raw.c : null;
                    if (item.price !== null) {
                        item.delta = typeof prev === 'number' ? item.price - prev : 0;
                        PriceStorage.save(item.ticker, item.price);
                    }
                    item.change = typeof raw.d === 'number' ? raw.d : null;
                    item.changePct = typeof raw.dp === 'number' ? raw.dp : null;
                    item.high = typeof raw.h === 'number' ? raw.h : null;
                    item.low = typeof raw.l === 'number' ? raw.l : null;
                    item.open = typeof raw.o === 'number' ? raw.o : null;
                    item.prevClose = typeof raw.pc === 'number' ? raw.pc : null;
                    item.lastUpdate = Date.now();
                }
            } catch (e) {}
        });
        await Promise.all(updates);
        save();
        render();
    }

    function exportData(format = 'json') {
        const data = watchlist.map(({ ticker, name, currency }) => ({ ticker, name, currency }));
        if (format === 'csv') {
            const lines = ['ticker,name,currency'];
            function esc(v) {
                if (v === undefined || v === null) return '';
                const s = String(v).replace(/"/g, '""');
                return /[",\n]/.test(s) ? '"' + s + '"' : s;
            }
            data.forEach(it => {
                lines.push(`${esc(it.ticker)},${esc(it.name)},${esc(it.currency)}`);
            });
            return lines.join('\n');
        }
        return JSON.stringify(data, null, 2);
    }

    function importData(text, format = 'json') {
        let arr = [];
        if (format === 'csv') {
            const lines = text.trim().split(/\r?\n/).filter(l => l.trim());
            lines.shift();
            arr = lines.map(line => {
                const parts = line.split(',');
                return {
                    ticker: (parts[0] || '').trim().toUpperCase(),
                    name: (parts[1] || '').trim(),
                    currency: (parts[2] || '').trim() || 'USD'
                };
            });
        } else {
            try { arr = JSON.parse(text) || []; } catch (e) { arr = []; }
        }
        arr.forEach(item => {
            const ticker = (item.ticker || '').toUpperCase();
            if (!ticker || watchlist.some(w => w.ticker === ticker)) return;
            watchlist.push({ ticker, name: item.name || '', currency: item.currency || 'USD' });
            subscribeTicker(ticker);
        });
        save();
        render();
        if (!ws && watchlist.length) connectWebSocket();
    }

    function deleteAllData() {
        try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
        watchlist = [];
        if (ws) { try { ws.close(); } catch (e) {} ws = null; }
        if (reconnectTimer) { clearTimeout(reconnectTimer); reconnectTimer = null; }
        render();
    }

    function init() {
        load();
        render();
        if (addBtn) addBtn.addEventListener('click', openModal);
        if (closeBtn) closeBtn.addEventListener('click', closeModal);
        if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
        if (form) form.addEventListener('submit', addStock);
        if (getPriceBtn) getPriceBtn.addEventListener('click', fetchLastPrices);
        if (tickerInput) {
            tickerInput.addEventListener('change', handleTickerLookup);
            tickerInput.addEventListener('blur', handleTickerLookup);
        }
        window.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
        window.addEventListener('beforeunload', () => {
            // Close socket and clear pending reconnects before leaving
            if (ws) {
                try { ws.close(); } catch (e) {}
                ws = null;
            }
            if (reconnectTimer) {
                clearTimeout(reconnectTimer);
                reconnectTimer = null;
            }
        });
        document.addEventListener('settings:api-key-updated', reconnectWebSocket);
        connectWebSocket();
    }

    return { init, fetchLastPrices, exportData, importData, deleteAllData };
})();
