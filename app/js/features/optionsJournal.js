const OptionsJournal = (function () {
    'use strict';

    const STORAGE_KEY = 'optionsJournalTrades';
    const storage = StorageUtils.getStorage();
    const formatInputValue = Utils.formatInputValue;

    let trades = [];
    let editingId = null;
    let currentFilter = 'All';
    let sortField = 'dateOpened';
    let sortDir = 'desc';

    let chartCumulative = null;
    let chartWinLoss = null;
    let chartStrategy = null;
    let chartTicker = null;

    // ─── Storage ─────────────────────────────────────────────────────────────

    function loadTrades() {
        try {
            trades = JSON.parse(storage.getItem(STORAGE_KEY)) || [];
        } catch (e) {
            trades = [];
        }
    }

    function saveTrades() {
        storage.setItem(STORAGE_KEY, JSON.stringify(trades));
    }

    function generateId() {
        return 'oj_' + Date.now() + Math.random().toString(36).slice(2, 6);
    }

    // ─── P&L Logic ───────────────────────────────────────────────────────────

    function calculatePnl(trade) {
        if (trade.status === 'Open' || trade.status === 'Assigned') return null;
        if (!trade.closePremium || trade.closePremium === 0) return null;
        const multiplier = trade.direction === 'Buy' ? 1 : -1;
        return (trade.closePremium - trade.premium) * trade.quantity * 100 * multiplier;
    }

    function classifyTrade(trade) {
        const pnl = calculatePnl(trade);
        if (pnl === null) return 'open';
        if (pnl > 0) return 'win';
        if (pnl < 0) return 'loss';
        return 'breakeven';
    }

    // ─── Analytics ───────────────────────────────────────────────────────────

    function computeAnalytics(tradeList) {
        const closedTrades = tradeList.filter(t => calculatePnl(t) !== null);
        const allPnls = closedTrades.map(t => calculatePnl(t));
        const wins = allPnls.filter(p => p > 0);
        const losses = allPnls.filter(p => p < 0);
        const breakevens = allPnls.filter(p => p === 0);

        const totalTrades = tradeList.length;
        const openTrades = tradeList.filter(t => t.status === 'Open').length;
        const winRate = closedTrades.length > 0
            ? (wins.length / closedTrades.length * 100).toFixed(1) + '%'
            : 'N/A';
        const totalPnl = allPnls.reduce((s, v) => s + v, 0);
        const avgWin = wins.length > 0 ? wins.reduce((s, v) => s + v, 0) / wins.length : 0;
        const avgLoss = losses.length > 0 ? losses.reduce((s, v) => s + v, 0) / losses.length : 0;

        // Cumulative P&L over time
        const sortedClosed = closedTrades
            .filter(t => t.dateClosed)
            .sort((a, b) => a.dateClosed.localeCompare(b.dateClosed));
        let cumSum = 0;
        const cumulativeLabels = [];
        const cumulativeValues = [];
        sortedClosed.forEach(t => {
            cumSum += calculatePnl(t);
            cumulativeLabels.push(formatDate(t.dateClosed));
            cumulativeValues.push(parseFloat(cumSum.toFixed(2)));
        });

        // P&L by strategy
        const strategyMap = {};
        closedTrades.forEach(t => {
            const pnl = calculatePnl(t);
            if (!strategyMap[t.strategy]) strategyMap[t.strategy] = 0;
            strategyMap[t.strategy] += pnl;
        });
        const strategyLabels = Object.keys(strategyMap);
        const strategyValues = strategyLabels.map(k => parseFloat(strategyMap[k].toFixed(2)));
        const strategyColors = strategyValues.map(v => v >= 0 ? '#059669' : '#dc2626');

        // P&L by ticker
        const tickerMap = {};
        closedTrades.forEach(t => {
            const pnl = calculatePnl(t);
            if (!tickerMap[t.ticker]) tickerMap[t.ticker] = 0;
            tickerMap[t.ticker] += pnl;
        });
        const tickerLabels = Object.keys(tickerMap);
        const tickerValues = tickerLabels.map(k => parseFloat(tickerMap[k].toFixed(2)));
        const tickerColors = tickerValues.map(v => v >= 0 ? '#059669' : '#dc2626');

        return {
            totalTrades, openTrades, winRate, totalPnl, avgWin, avgLoss,
            wins, losses, breakevens,
            cumulativeLabels, cumulativeValues,
            strategyLabels, strategyValues, strategyColors,
            tickerLabels, tickerValues, tickerColors
        };
    }

    // ─── Date Helpers ─────────────────────────────────────────────────────────

    function formatDate(isoDate) {
        if (!isoDate) return '';
        const [y, m, d] = isoDate.split('-');
        return `${d}/${m}/${y}`;
    }

    // ─── Rendering ───────────────────────────────────────────────────────────

    function renderTable(filterStatus) {
        filterStatus = filterStatus || currentFilter;
        const tbody = document.getElementById('oj-body');
        tbody.innerHTML = '';

        // Update sort indicators on column headers
        document.querySelectorAll('#oj-table thead th[data-sort]').forEach(th => {
            const field = th.dataset.sort;
            const label = th.dataset.label;
            if (field === sortField) {
                th.innerHTML = `${label} <span class="oj-sort-icon oj-sort-active">${sortDir === 'asc' ? '▲' : '▼'}</span>`;
            } else {
                th.innerHTML = `${label} <span class="oj-sort-icon">⇅</span>`;
            }
        });

        let filtered = trades.slice().sort((a, b) => {
            const av = a[sortField] || '', bv = b[sortField] || '';
            return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
        });
        if (filterStatus !== 'All') {
            filtered = filtered.filter(t => t.status === filterStatus);
        }

        if (filtered.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `<td colspan="14" style="text-align:center; color:var(--text-secondary); padding:2rem;">No trades found. Click "Add Trade" to get started.</td>`;
            tbody.appendChild(row);
            return;
        }

        filtered.forEach(trade => {
            const pnl = calculatePnl(trade);
            let pnlHtml = '<span style="color:var(--text-secondary)">—</span>';
            if (pnl !== null) {
                const cls = pnl >= 0 ? 'growth-positive' : 'growth-negative';
                pnlHtml = `<span class="${cls}">$${pnl.toFixed(2)}</span>`;
            }

            const statusClass = {
                'Open': 'oj-status-open',
                'Closed': 'oj-status-closed',
                'Expired': 'oj-status-expired',
                'Assigned': 'oj-status-assigned'
            }[trade.status] || '';

            const dirClass = trade.direction === 'Buy' ? 'oj-dir-buy' : 'oj-dir-sell';

            const row = document.createElement('tr');
            row.dataset.id = trade.id;
            row.innerHTML = `
                <td>${formatDate(trade.dateOpened)}</td>
                <td><strong>${escHtml(trade.ticker)}</strong></td>
                <td>${escHtml(trade.strategy)}</td>
                <td>${formatDate(trade.expiry)}</td>
                <td>${escHtml(trade.strikes || '')}</td>
                <td class="number-cell">$${trade.premium.toFixed(2)}</td>
                <td class="number-cell">${trade.quantity}</td>
                <td class="number-cell">$${(trade.premium * trade.quantity * 100).toFixed(2)}</td>
                <td><span class="${dirClass}">${trade.direction}</span></td>
                <td><span class="oj-status-badge ${statusClass}">${trade.status}</span></td>
                <td>${formatDate(trade.dateClosed)}</td>
                <td class="number-cell">${pnlHtml}</td>
                <td style="max-width:120px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${escHtml(trade.notes || '')}">${escHtml(trade.notes || '')}</td>
                <td class="actions-cell">
                    <button class="icon-btn edit-btn" data-id="${trade.id}" title="Edit" aria-label="Edit">
                        <svg width="16" height="16" viewBox="0 0 512 512"><polygon points="364.13 125.25 87 403 64 448 108.99 425 386.75 147.87 364.13 125.25" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32px"/><path d="M420.69,68.69,398.07,91.31l22.62,22.63,22.62-22.63a16,16,0,0,0,0-22.62h0A16,16,0,0,0,420.69,68.69Z" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32px"/></svg>
                    </button>
                    <button class="icon-btn delete-btn" data-id="${trade.id}" title="Delete" aria-label="Delete">
                        <svg width="16" height="16" viewBox="0 0 512 512"><path d="M112,112l20,320c.95,18.49,14.4,32,32,32H348c17.67,0,30.87-13.51,32-32l20-320" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32px"/><line x1="80" y1="112" x2="432" y2="112" style="stroke:currentColor;stroke-linecap:round;stroke-miterlimit:10;stroke-width:32px"/><path d="M192,112V72h0a23.93,23.93,0,0,1,24-24h80a23.93,23.93,0,0,1,24,24h0v40" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32px"/><line x1="256" y1="176" x2="256" y2="400" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32px"/><line x1="184" y1="176" x2="192" y2="400" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32px"/><line x1="328" y1="176" x2="320" y2="400" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32px"/></svg>
                    </button>
                </td>`;
            tbody.appendChild(row);
        });
    }

    function updateSummaryCards(analytics) {
        document.getElementById('oj-total-trades').textContent = analytics.totalTrades;
        document.getElementById('oj-open-trades').textContent = analytics.openTrades;
        document.getElementById('oj-win-rate').textContent = analytics.winRate;
        const winLossEl = document.getElementById('oj-win-loss-count');
        if (winLossEl) {
            winLossEl.textContent = (analytics.wins.length || analytics.losses.length)
                ? `${analytics.wins.length}W / ${analytics.losses.length}L`
                : '—';
        }

        const totalPnlEl = document.getElementById('oj-total-pnl');
        totalPnlEl.textContent = '$' + analytics.totalPnl.toFixed(2);
        totalPnlEl.className = analytics.totalPnl >= 0 ? 'growth-positive' : 'growth-negative';

        const avgWinEl = document.getElementById('oj-avg-win');
        avgWinEl.textContent = '$' + analytics.avgWin.toFixed(2);
        avgWinEl.className = 'growth-positive';

        const avgLossEl = document.getElementById('oj-avg-loss');
        avgLossEl.textContent = '$' + analytics.avgLoss.toFixed(2);
        avgLossEl.className = analytics.avgLoss < 0 ? 'growth-negative' : '';
    }

    function destroyChart(canvasId, moduleVar) {
        if (moduleVar) { try { moduleVar.destroy(); } catch (e) {} }
        const canvas = document.getElementById(canvasId);
        if (canvas) {
            const existing = Chart.getChart(canvas);
            if (existing) { try { existing.destroy(); } catch (e) {} }
        }
    }

    function renderCharts(analytics) {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const textColor = isDark ? '#f9fafb' : '#374151';
        const gridColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';

        destroyChart('oj-chart-cumulative', chartCumulative);
        destroyChart('oj-chart-winloss', chartWinLoss);
        destroyChart('oj-chart-strategy', chartStrategy);
        destroyChart('oj-chart-ticker', chartTicker);
        chartCumulative = chartWinLoss = chartStrategy = chartTicker = null;

        try {
            const ctx1 = document.getElementById('oj-chart-cumulative').getContext('2d');
            chartCumulative = new Chart(ctx1, {
                type: 'line',
                data: {
                    labels: analytics.cumulativeLabels,
                    datasets: [{
                        label: 'Cumulative P&L',
                        data: analytics.cumulativeValues,
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59,130,246,0.1)',
                        fill: true,
                        tension: 0.3,
                        pointRadius: 4
                    }]
                },
                options: {
                    responsive: true,
                    plugins: { legend: { display: false } },
                    scales: {
                        x: { ticks: { color: textColor }, grid: { color: gridColor } },
                        y: { ticks: { color: textColor, callback: v => '$' + v }, grid: { color: gridColor } }
                    }
                }
            });
        } catch (e) {}

        try {
            const ctx2 = document.getElementById('oj-chart-winloss').getContext('2d');
            chartWinLoss = new Chart(ctx2, {
                type: 'pie',
                data: {
                    labels: ['Wins', 'Losses', 'Break-even'],
                    datasets: [{
                        data: [analytics.wins.length, analytics.losses.length, analytics.breakevens.length],
                        backgroundColor: ['#059669', '#dc2626', '#d97706']
                    }]
                },
                options: {
                    responsive: true,
                    plugins: { legend: { labels: { color: textColor } } }
                }
            });
        } catch (e) {}

        try {
            const ctx3 = document.getElementById('oj-chart-strategy').getContext('2d');
            chartStrategy = new Chart(ctx3, {
                type: 'bar',
                data: {
                    labels: analytics.strategyLabels,
                    datasets: [{ label: 'P&L', data: analytics.strategyValues, backgroundColor: analytics.strategyColors }]
                },
                options: {
                    responsive: true,
                    plugins: { legend: { display: false } },
                    scales: {
                        x: { ticks: { color: textColor }, grid: { color: gridColor } },
                        y: { ticks: { color: textColor, callback: v => '$' + v }, grid: { color: gridColor } }
                    }
                }
            });
        } catch (e) {}

        try {
            const ctx4 = document.getElementById('oj-chart-ticker').getContext('2d');
            chartTicker = new Chart(ctx4, {
                type: 'bar',
                data: {
                    labels: analytics.tickerLabels,
                    datasets: [{ label: 'P&L', data: analytics.tickerValues, backgroundColor: analytics.tickerColors }]
                },
                options: {
                    responsive: true,
                    plugins: { legend: { display: false } },
                    scales: {
                        x: { ticks: { color: textColor }, grid: { color: gridColor } },
                        y: { ticks: { color: textColor, callback: v => '$' + v }, grid: { color: gridColor } }
                    }
                }
            });
        } catch (e) {}
    }

    function renderAnalytics() {
        const analytics = computeAnalytics(trades);
        updateSummaryCards(analytics);
        if (document.getElementById('trades-journal').classList.contains('active')) {
            renderCharts(analytics);
        }
    }

    function renderAll() {
        renderTable(currentFilter);
        renderAnalytics();
    }

    // ─── Modal ───────────────────────────────────────────────────────────────

    function openAddModal() {
        editingId = null;
        document.getElementById('oj-modal-title').textContent = 'Add Trade';
        document.getElementById('oj-trade-form').reset();
        document.getElementById('oj-date-opened').value = new Date().toISOString().split('T')[0];
        handleStatusChange();
        document.getElementById('oj-trade-modal').style.display = 'flex';
    }

    function openEditModal(id) {
        const trade = trades.find(t => t.id === id);
        if (!trade) return;
        editingId = id;
        document.getElementById('oj-modal-title').textContent = 'Edit Trade';
        document.getElementById('oj-date-opened').value = trade.dateOpened || '';
        document.getElementById('oj-ticker').value = trade.ticker || '';
        document.getElementById('oj-strategy').value = trade.strategy || 'Long Call';
        document.getElementById('oj-expiry').value = trade.expiry || '';
        document.getElementById('oj-strikes').value = trade.strikes || '';
        document.getElementById('oj-premium').value = formatInputValue(String(trade.premium || ''), true);
        document.getElementById('oj-quantity').value = trade.quantity || 1;
        document.getElementById('oj-direction').value = trade.direction || 'Buy';
        document.getElementById('oj-status').value = trade.status || 'Open';
        document.getElementById('oj-date-closed').value = trade.dateClosed || '';
        document.getElementById('oj-close-premium').value = trade.closePremium ? formatInputValue(String(trade.closePremium), true) : '';
        document.getElementById('oj-notes').value = trade.notes || '';
        handleStatusChange();
        document.getElementById('oj-trade-modal').style.display = 'flex';
    }

    function closeModal() {
        document.getElementById('oj-trade-modal').style.display = 'none';
        editingId = null;
    }

    function handleStatusChange() {
        const status = document.getElementById('oj-status').value;
        const showClose = (status === 'Closed' || status === 'Expired');
        document.getElementById('oj-close-date-group').style.display = showClose ? '' : 'none';
        document.getElementById('oj-close-premium-group').style.display = showClose ? '' : 'none';
        // When expired, the trade closes on the expiration date — auto-fill if empty
        if (status === 'Expired') {
            const closeDateInput = document.getElementById('oj-date-closed');
            if (!closeDateInput.value) {
                closeDateInput.value = document.getElementById('oj-expiry').value;
            }
        }
    }

    function handleFormSubmit(e) {
        e.preventDefault();
        const premium = parseFloat(document.getElementById('oj-premium').value.replace(/,/g, '')) || 0;
        const closePremium = parseFloat(document.getElementById('oj-close-premium').value.replace(/,/g, '')) || 0;

        const trade = {
            id: editingId || generateId(),
            dateOpened: document.getElementById('oj-date-opened').value,
            ticker: document.getElementById('oj-ticker').value.trim().toUpperCase(),
            strategy: document.getElementById('oj-strategy').value,
            expiry: document.getElementById('oj-expiry').value,
            strikes: document.getElementById('oj-strikes').value.trim(),
            premium,
            quantity: parseInt(document.getElementById('oj-quantity').value, 10) || 1,
            direction: document.getElementById('oj-direction').value,
            status: document.getElementById('oj-status').value,
            dateClosed: document.getElementById('oj-date-closed').value,
            closePremium,
            notes: document.getElementById('oj-notes').value.trim()
        };

        if (editingId) {
            const idx = trades.findIndex(t => t.id === editingId);
            if (idx !== -1) trades[idx] = trade;
        } else {
            trades.push(trade);
        }

        saveTrades();
        renderAll();
        closeModal();
        Utils.showToast(editingId ? 'Trade updated.' : 'Trade added.', 'success');
    }

    async function deleteTrade(id) {
        const confirmed = await DialogManager.confirm('Delete this trade? This cannot be undone.', 'Delete');
        if (!confirmed) return;
        trades = trades.filter(t => t.id !== id);
        saveTrades();
        renderAll();
        Utils.showToast('Trade deleted.', 'success');
    }

    function handleRowAction(e) {
        const editBtn = e.target.closest('.edit-btn');
        const deleteBtn = e.target.closest('.delete-btn');
        if (editBtn) openEditModal(editBtn.dataset.id);
        if (deleteBtn) deleteTrade(deleteBtn.dataset.id);
    }

    // ─── Amount Input Setup ──────────────────────────────────────────────────

    function setupAmountInput(input) {
        input.addEventListener('input', e => { e.target.value = formatInputValue(e.target.value); });
        input.addEventListener('blur', e => { e.target.value = formatInputValue(e.target.value, true); });
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    function escHtml(str) {
        return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function escCsv(val) {
        const s = String(val == null ? '' : val);
        if (s.includes(',') || s.includes('"') || s.includes('\n')) return '"' + s.replace(/"/g, '""') + '"';
        return s;
    }

    // ─── Import / Export ─────────────────────────────────────────────────────

    function exportCsv() {
        const header = ['id','dateOpened','ticker','strategy','expiry','strikes','premium','quantity','direction','status','dateClosed','closePremium','notes'];
        const rows = trades.map(t => header.map(k => escCsv(t[k])).join(','));
        const csv = [header.join(','), ...rows].join('\r\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'options_journal_' + new Date().toISOString().split('T')[0] + '.csv';
        a.click();
        URL.revokeObjectURL(url);
    }

    function importCsv(text) {
        const lines = text.trim().split(/\r?\n/);
        if (lines.length < 2) { Utils.showToast('No data found in file.', 'error'); return; }
        const header = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
        let imported = 0;
        for (let i = 1; i < lines.length; i++) {
            const cols = lines[i].split(',');
            if (cols.length < header.length) continue;
            const obj = {};
            header.forEach((h, idx) => { obj[h] = cols[idx] ? cols[idx].replace(/^"|"$/g, '') : ''; });
            obj.id = generateId();
            obj.premium = parseFloat(obj.premium) || 0;
            obj.closePremium = parseFloat(obj.closePremium) || 0;
            obj.quantity = parseInt(obj.quantity, 10) || 1;
            trades.push(obj);
            imported++;
        }
        saveTrades();
        renderAll();
        Utils.showToast(`Imported ${imported} trade(s).`, 'success');
    }

    // ─── Init ────────────────────────────────────────────────────────────────

    function init() {
        loadTrades();

        // Attach all event listeners first — nothing below can throw
        setupAmountInput(document.getElementById('oj-premium'));
        setupAmountInput(document.getElementById('oj-close-premium'));

        document.getElementById('oj-ticker').addEventListener('input', e => {
            const pos = e.target.selectionStart;
            e.target.value = e.target.value.toUpperCase();
            e.target.setSelectionRange(pos, pos);
        });

        document.getElementById('oj-add-trade-btn').addEventListener('click', openAddModal);
        document.getElementById('oj-cancel-btn').addEventListener('click', closeModal);
        document.getElementById('oj-modal-close').addEventListener('click', closeModal);
        document.getElementById('oj-trade-modal').addEventListener('click', e => {
            if (e.target === document.getElementById('oj-trade-modal')) closeModal();
        });
        document.getElementById('oj-trade-form').addEventListener('submit', handleFormSubmit);
        document.getElementById('oj-status').addEventListener('change', handleStatusChange);
        document.getElementById('oj-body').addEventListener('click', handleRowAction);
        document.getElementById('oj-filter-status').addEventListener('change', e => {
            currentFilter = e.target.value;
            renderTable(currentFilter);
        });

        // Sortable column headers
        document.querySelector('#oj-table thead').addEventListener('click', e => {
            const th = e.target.closest('th[data-sort]');
            if (!th) return;
            const field = th.dataset.sort;
            if (sortField === field) {
                sortDir = sortDir === 'asc' ? 'desc' : 'asc';
            } else {
                sortField = field;
                sortDir = 'asc';
            }
            renderTable(currentFilter);
        });

        // Render charts when the tab becomes active (avoids hidden-canvas issues on load)
        document.querySelector('button[data-tab="trades-journal"]').addEventListener('click', () => {
            try { renderCharts(computeAnalytics(trades)); } catch(e) { console.error('[OJ] chart error:', e); }
        });

        // Render table and summary cards (safe — no canvas involved)
        try { renderTable(currentFilter); } catch(e) { console.error('[OJ] renderTable error:', e); }
        try { updateSummaryCards(computeAnalytics(trades)); } catch(e) { console.error('[OJ] summaryCards error:', e); }
    }

    // ─── Public API (used by Settings page) ──────────────────────────────────

    function exportData(format) {
        if (format === 'json') {
            return JSON.stringify(trades, null, 2);
        }
        // CSV
        const header = ['id','dateOpened','ticker','strategy','expiry','strikes','premium','quantity','direction','status','dateClosed','closePremium','notes'];
        const rows = trades.map(t => header.map(k => escCsv(t[k])).join(','));
        return [header.join(','), ...rows].join('\r\n');
    }

    function importData(text, format) {
        if (format === 'json') {
            try {
                const parsed = JSON.parse(text);
                if (!Array.isArray(parsed)) { Utils.showToast('Invalid JSON format.', 'error'); return; }
                parsed.forEach(t => { t.id = generateId(); trades.push(t); });
                saveTrades();
                renderAll();
                Utils.showToast(`Imported ${parsed.length} trade(s).`, 'success');
            } catch (e) {
                Utils.showToast('Failed to parse JSON.', 'error');
            }
        } else {
            importCsv(text);
        }
    }

    function deleteAllData() {
        trades = [];
        saveTrades();
        renderAll();
        Utils.showToast('All trades deleted.', 'success');
    }

    return { init, exportData, importData, deleteAllData };
})();
