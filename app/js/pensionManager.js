const PensionManager = (function() {
    'use strict';

    const LIST_KEY = 'pensionList';
    const STORAGE_PREFIX = 'pensionData_';
    let pensions = [];
    let currentPensionId = null;
    let summaryMode = false;
    let summaryInfo = { type: 'growth', start: 0 };
    let entries = [];

    const pensionTabs = document.getElementById('pension-tabs');
    const addPensionBtn = document.getElementById('add-pension-btn');
    const removePensionBtn = document.getElementById('remove-pension-btn');
    const addEntryBtn = document.getElementById('add-pension-entry-btn');
    const summaryToggle = document.getElementById('pension-summary-toggle');

    const newPensionModal = document.getElementById('new-pension-modal');
    const pensionForm = document.getElementById('new-pension-form');
    const pensionNameInput = document.getElementById('pension-name');
    const pensionTypeSelect = document.getElementById('pension-type');
    const pensionStartInput = document.getElementById('pension-start-value');
    const newPensionCancel = document.getElementById('cancel-new-pension');

    const entryModal = document.getElementById('pension-entry-modal');
    const entryForm = document.getElementById('pension-entry-form');
    const entryDateInput = document.getElementById('pension-entry-date');
    const entryValueInput = document.getElementById('pension-entry-value');
    const entryPaymentInput = document.getElementById('pension-entry-payment');
    const entryCancel = document.getElementById('cancel-pension-entry');
    const baseCurrencyLabel = document.getElementById('pension-base-currency-label');
    const paymentCurrencyLabel = document.getElementById('pension-payment-currency-label');
    const totalPaymentCurrencyLabel = document.getElementById('pension-total-payment-currency-label');

    const editEntryModal = document.getElementById('pension-edit-modal');
    const editEntryForm = document.getElementById('pension-edit-form');
    const editDateInput = document.getElementById('pension-edit-date');
    const editValueInput = document.getElementById('pension-edit-value');
    const editPaymentInput = document.getElementById('pension-edit-payment');
    const editCancel = document.getElementById('cancel-pension-edit');
    let editIndex = null;
    const paymentHeader = document.querySelector('#pension-table .payment-col');
    const totalPaymentHeader = document.querySelector('#pension-table .total-payment-col');

    const chartBtn = document.getElementById('pension-chart-btn');
    const chartModal = document.getElementById('pension-chart-popup');
    const chartSelect = document.getElementById('pension-chart-select');
    const chartCanvas = document.getElementById('pension-chart-canvas');
    const chartClose = document.getElementById('pension-chart-close');
    const chartTypeValue = document.getElementById('pension-chart-type-value');
    const chartTypeGrowth = document.getElementById('pension-chart-type-growth');
    let pensionChart = null;

    function getStorageKey(id) {
        return STORAGE_PREFIX + id;
    }

    function loadPensionList() {
        const list = localStorage.getItem(LIST_KEY);
        if (list) {
            try { pensions = JSON.parse(list) || []; } catch (e) { pensions = []; }
        }
        pensions.forEach(p => { if (p.show === undefined) p.show = true; });
        if (pensions.length === 0) {
            pensions = [{ id: 'pen1', name: 'Pension 1', type: 'growth', start: 0, show: true }];
            savePensionList();
            localStorage.setItem(getStorageKey('pen1'), '[]');
        }
        currentPensionId = pensions[0].id;
    }

    function savePensionList() {
        localStorage.setItem(LIST_KEY, JSON.stringify(pensions));
    }

    function loadEntries() {
        if (summaryMode) {
            const included = pensions.filter(p => p.show !== false);
            summaryInfo.start = included.reduce((a, p) => a + (parseFloat(p.start) || 0), 0);
            summaryInfo.type = included.some(p => p.type === 'payments') ? 'payments' : 'growth';
            const dateSet = new Set();
            const dataMap = {};
            included.forEach(p => {
                const d = localStorage.getItem(getStorageKey(p.id));
                let arr = [];
                if (d) { try { arr = JSON.parse(d) || []; } catch (e) { arr = []; } }
                dataMap[p.id] = arr;
                arr.forEach(en => dateSet.add(en.date));
            });
            const dates = Array.from(dateSet).sort();
            const prevVals = {};
            included.forEach(p => { prevVals[p.id] = parseFloat(p.start) || 0; });
            entries = [];
            dates.forEach(date => {
                let paymentSum = 0;
                included.forEach(p => {
                    const entry = dataMap[p.id].find(e => e.date === date);
                    if (entry) {
                        prevVals[p.id] = entry.value;
                        if (p.type === 'payments') paymentSum += parseFloat(entry.payment) || 0;
                    }
                });
                const totalVal = included.reduce((s, p) => s + (prevVals[p.id] || 0), 0);
                entries.push({ date, value: totalVal, payment: paymentSum });
            });
        } else {
            const data = localStorage.getItem(getStorageKey(currentPensionId));
            if (data) {
                try { entries = JSON.parse(data) || []; } catch (e) { entries = []; }
            } else {
                entries = [];
            }
        }
    }

    function saveEntries() {
        localStorage.setItem(getStorageKey(currentPensionId), JSON.stringify(entries));
    }

    function updatePaymentHeader() {
        const current = summaryMode ? summaryInfo : pensions.find(p => p.id === currentPensionId);
        if (!paymentHeader || !totalPaymentHeader) return;
        const show = current && current.type === 'payments' ? 'table-cell' : 'none';
        paymentHeader.style.display = show;
        totalPaymentHeader.style.display = show;
    }

    function renderTabs() {
        if (!pensionTabs) return;
        pensionTabs.innerHTML = '';
        const summaryTab = document.createElement('button');
        summaryTab.className = 'sub-nav-tab' + (summaryMode ? ' active' : '');
        summaryTab.textContent = 'Summary';
        summaryTab.dataset.id = 'summary';
        pensionTabs.appendChild(summaryTab);
        pensions.forEach(p => {
            const btn = document.createElement('button');
            btn.className = 'sub-nav-tab' + (!summaryMode && p.id === currentPensionId ? ' active' : '');
            btn.textContent = p.name;
            btn.dataset.id = p.id;
            pensionTabs.appendChild(btn);
        });
    }

    function switchPension(id) {
        summaryMode = (id === 'summary');
        if (!summaryMode) currentPensionId = id;
        loadEntries();
        renderTabs();
        updatePaymentHeader();
        renderTable();
        removePensionBtn.style.display = summaryMode ? 'none' : 'inline-flex';
        addEntryBtn.style.display = summaryMode ? 'none' : 'inline-flex';
        addPensionBtn.style.display = 'inline-flex';
        if (summaryToggle) {
            summaryToggle.style.display = summaryMode ? 'none' : 'inline-flex';
            if (!summaryMode) {
                const p = pensions.find(p => p.id === currentPensionId);
                summaryToggle.checked = !p || p.show !== false;
            }
        }
    }

    function openNewPensionModal() {
        pensionNameInput.value = '';
        pensionStartInput.value = '';
        pensionTypeSelect.value = 'growth';
        newPensionModal.style.display = 'flex';
        pensionNameInput.focus();
    }

    function closeNewPensionModal() {
        newPensionModal.style.display = 'none';
    }

    function openEntryModal() {
        if (summaryMode) return;
        entryDateInput.value = new Date().toISOString().split('T')[0];
        entryValueInput.value = '';
        entryPaymentInput.value = '';
        const current = pensions.find(p => p.id === currentPensionId);
        if (current && current.type === 'growth') {
            entryPaymentInput.parentElement.style.display = 'none';
        } else {
            entryPaymentInput.parentElement.style.display = 'block';
        }
        entryModal.style.display = 'flex';
        entryDateInput.focus();
    }

    function closeEntryModal() {
        entryModal.style.display = 'none';
    }

    function addPension(e) {
        e.preventDefault();
        const name = pensionNameInput.value.trim();
        const type = pensionTypeSelect.value;
        const start = parseFloat(pensionStartInput.value);
        if (!name || isNaN(start)) return;
        const id = 'pen' + Date.now();
        pensions.push({ id, name, type, start, show: true });
        savePensionList();
        localStorage.setItem(getStorageKey(id), '[]');
        switchPension(id);
        updatePaymentHeader();
        closeNewPensionModal();
    }

    async function removePension() {
        if (pensions.length <= 1) return;
        const idx = pensions.findIndex(p => p.id === currentPensionId);
        if (idx !== -1) {
            const confirmed = await DialogManager.confirm('Delete this pension?', 'Delete');
            if (!confirmed) return;
            localStorage.removeItem(getStorageKey(currentPensionId));
            pensions.splice(idx, 1);
            savePensionList();
            const next = pensions[idx] || pensions[idx-1];
            switchPension(next.id);
            updatePaymentHeader();
        }
    }

    function addEntry(e) {
        e.preventDefault();
        if (summaryMode) return;
        const date = entryDateInput.value;
        const value = parseFloat(entryValueInput.value);
        const payment = parseFloat(entryPaymentInput.value) || 0;
        if (!date || isNaN(value)) return;
        entries.push({ date, value, payment });
        entries.sort((a,b)=>new Date(a.date)-new Date(b.date));
        saveEntries();
        renderTable();
        closeEntryModal();
    }

    function openEditEntryModal(idx) {
        if (summaryMode) return;
        editIndex = idx;
        const entry = entries[idx];
        if (!entry) return;
        editDateInput.value = entry.date;
        editValueInput.value = entry.value;
        editPaymentInput.value = entry.payment || '';
        const current = pensions.find(p => p.id === currentPensionId);
        if (current && current.type === 'growth') {
            editPaymentInput.parentElement.style.display = 'none';
        } else {
            editPaymentInput.parentElement.style.display = 'block';
        }
        editEntryModal.style.display = 'flex';
        editDateInput.focus();
    }

    function closeEditEntryModal() {
        editEntryModal.style.display = 'none';
        editIndex = null;
    }

    function saveEditEntry(e) {
        e.preventDefault();
        if (summaryMode) return;
        if (editIndex === null) return;
        const date = editDateInput.value;
        const value = parseFloat(editValueInput.value);
        const payment = parseFloat(editPaymentInput.value) || 0;
        if (!date || isNaN(value)) return;
        entries[editIndex] = { date, value, payment };
        entries.sort((a,b)=>new Date(a.date)-new Date(b.date));
        saveEntries();
        renderTable();
        closeEditEntryModal();
    }

    async function handleRowAction(e) {
        if (summaryMode) return;
        const btn = e.target.closest('button');
        if (!btn) return;
        const idx = parseInt(btn.dataset.index, 10);
        if (btn.classList.contains('edit-btn')) {
            openEditEntryModal(idx);
        } else if (btn.classList.contains('delete-btn')) {
            const confirmed = await DialogManager.confirm('Delete this entry?', 'Delete');
            if (confirmed) {
                entries.splice(idx, 1);
                saveEntries();
                renderTable();
            }
        }
    }

    function formatCurrency(val, currency = 'USD') {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(val);
    }

    function getEntriesFor(id) {
        if (id === 'summary') {
            const included = pensions.filter(p => p.show !== false);
            const dateSet = new Set();
            const dataMap = {};
            included.forEach(p => {
                const d = localStorage.getItem(getStorageKey(p.id));
                let arr = [];
                if (d) { try { arr = JSON.parse(d) || []; } catch (e) { arr = []; } }
                dataMap[p.id] = arr;
                arr.forEach(en => dateSet.add(en.date));
            });
            const dates = Array.from(dateSet).sort();
            const prevVals = {};
            included.forEach(p => { prevVals[p.id] = parseFloat(p.start) || 0; });
            return dates.map(date => {
                included.forEach(p => {
                    const entry = dataMap[p.id].find(e => e.date === date);
                    if (entry) prevVals[p.id] = entry.value;
                });
                const totalVal = included.reduce((s, p) => s + (prevVals[p.id] || 0), 0);
                return { date, value: totalVal };
            });
        } else {
            const data = localStorage.getItem(getStorageKey(id));
            let arr = [];
            if (data) { try { arr = JSON.parse(data) || []; } catch (e) { arr = []; } }
            arr.sort((a,b)=>new Date(a.date)-new Date(b.date));
            return arr.map(en => ({ date: en.date, value: parseFloat(en.value) }));
        }
    }


    function computeStats() {
        const current = summaryMode ? summaryInfo : pensions.find(p => p.id === currentPensionId);
        if (!current) return [];
        const type = current.type;
        const startVal = parseFloat(current.start) || 0;
        let prev = startVal;
        let ytdStart = startVal;
        let ytdPayments = 0;
        let totalPayments = 0;
        let currentYear = entries[0] ? new Date(entries[0].date).getFullYear() : new Date().getFullYear();
        return entries.map((entry, idx) => {
            const year = new Date(entry.date).getFullYear();
            if (year !== currentYear) {
                currentYear = year;
                ytdStart = prev;
                ytdPayments = 0;
            }
            const payment = type === 'payments' ? (parseFloat(entry.payment) || 0) : 0;
            const monthlyPL = entry.value - prev - payment;
            const monthlyPLPct = prev ? (monthlyPL / prev) * 100 : 0;
            ytdPayments += payment;
            totalPayments += payment;
            const ytdPL = entry.value - ytdStart - ytdPayments;
            const ytdPLPct = ytdStart ? (ytdPL / ytdStart) * 100 : 0;
            const totalPL = entry.value - startVal - totalPayments;
            const baseAmount = startVal + totalPayments;
            const totalPLPct = baseAmount ? (totalPL / baseAmount) * 100 : 0;
            prev = entry.value;
            return Object.assign({}, entry, {
                monthlyPL, monthlyPLPct,
                ytdPL, ytdPLPct,
                totalPL, totalPLPct,
                totalPayments,
                index: idx
            });
        });
    }

    function computeAnalysis(stats) {
        if (!stats || stats.length === 0) return null;
        const current = summaryMode ? summaryInfo : pensions.find(p => p.id === currentPensionId);
        const startVal = parseFloat(current.start) || 0;
        const startDate = new Date(stats[0].date);
        const endDate = new Date(stats[stats.length - 1].date);
        const years = (endDate - startDate) / (365.25 * 24 * 3600 * 1000);
        const endVal = stats[stats.length - 1].value;
        const cagr = years > 0 && startVal > 0 ? (Math.pow(endVal / startVal, 1 / years) - 1) * 100 : 0;

        let bestMonth = stats[0];
        let worstMonth = stats[0];
        stats.forEach(st => {
            if (st.monthlyPLPct > bestMonth.monthlyPLPct) bestMonth = st;
            if (st.monthlyPLPct < worstMonth.monthlyPLPct) worstMonth = st;
        });

        const yearEndMap = {};
        stats.forEach((st, idx) => {
            const year = new Date(st.date).getFullYear();
            const nextYear = idx < stats.length - 1 ? new Date(stats[idx + 1].date).getFullYear() : year;
            if (nextYear !== year || idx === stats.length - 1) {
                yearEndMap[year] = st.ytdPLPct;
            }
        });
        let bestYear = null;
        let worstYear = null;
        Object.keys(yearEndMap).forEach(y => {
            const pct = yearEndMap[y];
            if (bestYear === null || pct > yearEndMap[bestYear]) bestYear = y;
            if (worstYear === null || pct < yearEndMap[worstYear]) worstYear = y;
        });

        return {
            cagr,
            bestMonth: { date: bestMonth.date, pct: bestMonth.monthlyPLPct },
            worstMonth: { date: worstMonth.date, pct: worstMonth.monthlyPLPct },
            bestYear: bestYear ? { year: parseInt(bestYear, 10), pct: yearEndMap[bestYear] } : null,
            worstYear: worstYear ? { year: parseInt(worstYear, 10), pct: yearEndMap[worstYear] } : null
        };
    }

    function updateSummaryCards(stats) {
        const container = document.getElementById('pension-summary-cards');
        if (!container) return;
        if (!stats || stats.length === 0) {
            container.style.display = 'none';
            return;
        }
        const analysis = computeAnalysis(stats);
        if (!analysis) {
            container.style.display = 'none';
            return;
        }
        const cagrEl = document.getElementById('pension-current-cagr');
        const bestMonthEl = document.getElementById('pension-best-month');
        const worstMonthEl = document.getElementById('pension-worst-month');
        const bestYearEl = document.getElementById('pension-best-year');
        const worstYearEl = document.getElementById('pension-worst-year');

        cagrEl.textContent = analysis.cagr ? analysis.cagr.toFixed(2) + '%' : '---';
        bestMonthEl.textContent = analysis.bestMonth ? `${DateUtils.formatDate(analysis.bestMonth.date)} (${analysis.bestMonth.pct.toFixed(2)}%)` : '---';
        worstMonthEl.textContent = analysis.worstMonth ? `${DateUtils.formatDate(analysis.worstMonth.date)} (${analysis.worstMonth.pct.toFixed(2)}%)` : '---';
        bestYearEl.textContent = analysis.bestYear ? `${analysis.bestYear.year} (${analysis.bestYear.pct.toFixed(2)}%)` : '---';
        worstYearEl.textContent = analysis.worstYear ? `${analysis.worstYear.year} (${analysis.worstYear.pct.toFixed(2)}%)` : '---';

        container.style.display = 'flex';
    }

    function showChart() {
        if (!chartModal || !chartCanvas || !chartSelect) return;
        chartSelect.innerHTML = '';
        pensions.forEach(p => {
            const label = document.createElement('label');
            const cb = document.createElement('input');
            cb.type = 'checkbox';
            cb.value = p.id;
            cb.checked = !summaryMode && p.id === currentPensionId;
            label.appendChild(cb);
            label.appendChild(document.createTextNode(' ' + p.name));
            chartSelect.appendChild(label);
            cb.addEventListener('change', updateChart);
        });

        if (chartTypeValue) chartTypeValue.checked = true;
        if (chartTypeGrowth) chartTypeGrowth.checked = false;
        if (chartTypeValue) chartTypeValue.addEventListener('change', updateChart);
        if (chartTypeGrowth) chartTypeGrowth.addEventListener('change', updateChart);

        function updateChart() {
            const ids = Array.from(chartSelect.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.value);
            const chartType = chartTypeGrowth && chartTypeGrowth.checked ? 'growth' : 'value';
            const dateSet = new Set();
            const datasets = [];
            if (summaryMode) {
                const ents = getEntriesFor('summary');
                ents.forEach(en => dateSet.add(en.date));
                datasets.push({ id: 'summary', name: 'Summary', entries: ents, start: summaryInfo.start });
            }
            ids.forEach(id => {
                const ents = getEntriesFor(id);
                ents.forEach(en => dateSet.add(en.date));
                const p = pensions.find(p => p.id === id) || { start: 0 };
                const name = p.name || id;
                datasets.push({ id, name, entries: ents, start: parseFloat(p.start) || 0 });
            });
            const dates = Array.from(dateSet).sort();
            const chartDatasets = datasets.map((ds, idx) => {
                const map = new Map(ds.entries.map(e => [e.date, e.value]));
                const base = ds.start || (ds.entries[0] ? ds.entries[0].value : 0);
                const data = dates.map(d => {
                    const val = map.get(d);
                    if (chartType === 'growth') {
                        return val != null && base ? ((val - base) / base) * 100 : null;
                    }
                    return val ?? null;
                });
                const color = `hsl(${(idx * 360 / datasets.length) % 360},70%,60%)`;
                return { label: ds.name, data, borderColor: color, backgroundColor: color, fill: false, tension: 0.2, spanGaps: true };
            });
            if (pensionChart) pensionChart.destroy();
            const options = { responsive: true };
            if (chartType === 'growth') {
                options.scales = { y: { ticks: { callback: v => v + '%' } } };
            }
            pensionChart = new Chart(chartCanvas.getContext('2d'), {
                type: 'line',
                data: { labels: dates.map(DateUtils.formatDate), datasets: chartDatasets },
                options
            });
        }

        updateChart();
        chartModal.style.display = 'flex';
    }

    function closeChart() {
        if (chartModal) chartModal.style.display = 'none';
    }

    async function renderTable() {
        const tbody = document.getElementById('pension-body');
        if (!tbody) return;
        tbody.innerHTML = '';
        const stats = computeStats();
        const baseCurrency = Settings.getBaseCurrency ? Settings.getBaseCurrency() : 'USD';
        if (baseCurrencyLabel) baseCurrencyLabel.textContent = baseCurrency;
        if (paymentCurrencyLabel) paymentCurrencyLabel.textContent = baseCurrency;
        if (totalPaymentCurrencyLabel) totalPaymentCurrencyLabel.textContent = baseCurrency;
        stats.forEach(st => {
            const row = document.createElement('tr');
            row.dataset.index = st.index;

            const monthlyClass = st.monthlyPL < 0 ? 'growth-negative' : '';
            const ytdClass = st.ytdPL < 0 ? 'growth-negative' : '';
            const totalClass = st.totalPL < 0 ? 'growth-negative' : '';

            const monthlyPctClass = st.monthlyPLPct > 0 ? 'growth-positive' : st.monthlyPLPct < 0 ? 'growth-negative' : '';
            const ytdPctClass = st.ytdPLPct > 0 ? 'growth-positive' : st.ytdPLPct < 0 ? 'growth-negative' : '';
            const totalPctClass = st.totalPLPct > 0 ? 'growth-positive' : st.totalPLPct < 0 ? 'growth-negative' : '';

            const paymentVal = st.payment || 0;
            const valueVal = st.value;
            const monthlyVal = st.monthlyPL;
            const ytdVal = st.ytdPL;
            const totalVal = st.totalPL;

            const type = summaryMode ? summaryInfo.type : pensions.find(p=>p.id===currentPensionId).type;
            row.innerHTML = `
                <td>${DateUtils.formatDate(st.date)}</td>
                ${type==='payments'?`<td class="number-cell">${formatCurrency(paymentVal, baseCurrency)}</td><td class="number-cell">${formatCurrency(st.totalPayments, baseCurrency)}</td>`:''}
                <td class="number-cell">${formatCurrency(valueVal, baseCurrency)}</td>
                <td class="number-cell ${monthlyClass}">${formatCurrency(monthlyVal, baseCurrency)}</td>
                <td class="number-cell ${monthlyPctClass}">${st.monthlyPLPct.toFixed(2)}%</td>
                <td class="number-cell ${ytdClass}">${formatCurrency(ytdVal, baseCurrency)}</td>
                <td class="number-cell ${ytdPctClass}">${st.ytdPLPct.toFixed(2)}%</td>
                <td class="number-cell ${totalClass}">${formatCurrency(totalVal, baseCurrency)}</td>
                <td class="number-cell ${totalPctClass}">${st.totalPLPct.toFixed(2)}%</td>
                ${summaryMode ? '' : `<td class="actions-cell">
                    <button class="icon-btn edit-btn" data-index="${st.index}" title="Edit">
                        <svg width="16" height="16" viewBox="0 0 512 512"><polygon points="364.13 125.25 87 403 64 448 108.99 425 386.75 147.87 364.13 125.25" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32px"/><path d="M420.69,68.69,398.07,91.31l22.62,22.63,22.62-22.63a16,16,0,0,0,0-22.62h0A16,16,0,0,0,420.69,68.69Z" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32px"/></svg>
                    </button>
                    <button class="icon-btn delete-btn" data-index="${st.index}" title="Delete">
                        <svg width="16" height="16" viewBox="0 0 512 512"><path d="M112,112l20,320c.95,18.49,14.4,32,32,32H348c17.67,0,30.87-13.51,32-32l20-320" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32px"/><line x1="80" y1="112" x2="432" y2="112" style="stroke:currentColor;stroke-linecap:round;stroke-miterlimit:10;stroke-width:32px"/><path d="M192,112V72h0a23.93,23.93,0,0,1,24-24h80a23.93,23.93,0,0,1,24,24h0v40" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32px"/><line x1="256" y1="176" x2="256" y2="400" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32px"/><line x1="184" y1="176" x2="192" y2="400" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32px"/><line x1="328" y1="176" x2="320" y2="400" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32px"/></svg>
                    </button>
                </td>`}
            `;
            tbody.appendChild(row);
        });
        updateSummaryCards(stats);
    }

    function init() {
        loadPensionList();
        loadEntries();
        renderTabs();
        updatePaymentHeader();
        renderTable();

        pensionTabs.addEventListener('click', e => {
            const id = e.target.dataset.id;
            if (id) switchPension(id);
        });

        addPensionBtn.addEventListener('click', openNewPensionModal);
        newPensionCancel.addEventListener('click', closeNewPensionModal);
        pensionForm.addEventListener('submit', addPension);

        removePensionBtn.addEventListener('click', removePension);

        addEntryBtn.addEventListener('click', openEntryModal);
        entryCancel.addEventListener('click', closeEntryModal);
        entryForm.addEventListener('submit', addEntry);

        if (chartBtn) chartBtn.addEventListener('click', showChart);
        if (chartClose) chartClose.addEventListener('click', closeChart);
        if (chartModal) chartModal.addEventListener('click', e => { if (e.target === chartModal) closeChart(); });

        document.getElementById('pension-body').addEventListener('click', handleRowAction);
        editCancel.addEventListener('click', closeEditEntryModal);
        editEntryForm.addEventListener('submit', saveEditEntry);
        editEntryModal.addEventListener('click', e => { if (e.target === editEntryModal) closeEditEntryModal(); });

        newPensionModal.addEventListener('click', e => { if (e.target === newPensionModal) closeNewPensionModal(); });
        entryModal.addEventListener('click', e => { if (e.target === entryModal) closeEntryModal(); });

        if (summaryToggle) {
            summaryToggle.addEventListener('change', () => {
                const p = pensions.find(p => p.id === currentPensionId);
                if (p) {
                    p.show = summaryToggle.checked;
                    savePensionList();
                }
            });
        }
    }

    function exportData(format = 'json') {
        const data = pensions.map(p => {
            let entriesData = localStorage.getItem(getStorageKey(p.id));
            let arr = [];
            if (entriesData) {
                try { arr = JSON.parse(entriesData) || []; } catch (e) { arr = []; }
            }
            return { name: p.name, type: p.type, start: parseFloat(p.start) || 0, entries: arr };
        });
        if (format === 'csv') {
            const lines = ['name,type,start,date,value,payment'];
            function esc(val) {
                if (val === undefined || val === null) return '';
                const str = String(val).replace(/"/g, '""');
                return /[",\n]/.test(str) ? '"' + str + '"' : str;
            }
            data.forEach(p => {
                if (p.entries.length === 0) {
                    lines.push(`${esc(p.name)},${p.type},${p.start},,,`);
                } else {
                    p.entries.forEach(en => {
                        lines.push(`${esc(p.name)},${p.type},${p.start},${en.date},${en.value},${en.payment ?? ''}`);
                    });
                }
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
            const map = {};
            lines.forEach(line => {
                const parts = line.split(',');
                const [name, type, start, date, value, payment] = parts;
                const key = name + '|' + type + '|' + start;
                if (!map[key]) {
                    map[key] = { name, type, start: parseFloat(start) || 0, entries: [] };
                }
                if (date) {
                    map[key].entries.push({ date, value: parseFloat(value), payment: parseFloat(payment) || 0 });
                }
            });
            arr = Object.values(map);
        } else {
            try { arr = JSON.parse(text) || []; } catch (e) { arr = []; }
        }
        arr.forEach(p => {
            const id = 'pen' + Date.now() + Math.random().toString(36).slice(2,5);
            pensions.push({ id, name: p.name, type: p.type, start: parseFloat(p.start) || 0, show: true });
            localStorage.setItem(getStorageKey(id), JSON.stringify((p.entries || []).map(en => ({
                date: en.date,
                value: parseFloat(en.value),
                payment: parseFloat(en.payment) || 0
            }))));
        });
        savePensionList();
        if (arr.length > 0) {
            switchPension(pensions[pensions.length - 1].id);
        }
    }

    function deleteAllData() {
        pensions.forEach(p => {
            localStorage.removeItem(getStorageKey(p.id));
        });
        localStorage.removeItem(LIST_KEY);
        pensions = [];
        entries = [];
        loadPensionList();
        loadEntries();
        renderTabs();
        updatePaymentHeader();
        renderTable();
    }

    return { init, exportData, importData, deleteAllData };
})();
