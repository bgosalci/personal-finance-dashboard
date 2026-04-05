const PensionManager = (function() {
    'use strict';

    const LIST_KEY = 'pensionList';
    const STORAGE_PREFIX = 'pensionData_';
    // Use StorageUtils for consistent access (in-memory fallback for tests/private browsing)
    const storage = StorageUtils.getStorage();
    // Delegate to shared utility — single definition lives in core/utils.js
    const formatInputValue = Utils.formatInputValue;
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
    const rangeToolBtn = document.getElementById('pension-range-tool-btn');
    const rangeResult = document.getElementById('pension-range-result');
    const rangeHint = document.getElementById('pension-range-hint');
    const rangeValues = document.getElementById('pension-range-values');
    const rangeFrom = document.getElementById('pension-range-from');
    const rangeTo = document.getElementById('pension-range-to');
    const rangeDiff = document.getElementById('pension-range-diff');
    const rangePct = document.getElementById('pension-range-pct');
    const rangeDuration = document.getElementById('pension-range-duration');
    const rangeClear = document.getElementById('pension-range-clear');
    let pensionChart = null;
    let rangeToolActive = false;
    let selectedPoints = [];

    const selectionLinesPlugin = {
        id: 'selectionLines',
        afterDraw(chart) {
            const indices = chart._selectionIndices || [];
            if (!indices.length) return;
            const ctx = chart.ctx;
            const xAxis = chart.scales.x;
            const yAxis = chart.scales.y;
            const colors = ['#22c55e', '#3b82f6'];
            indices.forEach((xIdx, i) => {
                const x = xAxis.getPixelForValue(xIdx);
                ctx.save();
                ctx.strokeStyle = colors[i];
                ctx.lineWidth = 2;
                ctx.setLineDash([5, 4]);
                ctx.beginPath();
                ctx.moveTo(x, yAxis.top);
                ctx.lineTo(x, yAxis.bottom);
                ctx.stroke();
                ctx.restore();
            });
        }
    };

    const crosshairPlugin = {
        id: 'crosshair',
        afterDraw(chart) {
            const pos = chart._crosshairPos;
            if (!pos) return;
            const { x, y } = pos;
            const ctx = chart.ctx;
            const xAxis = chart.scales.x;
            const yAxis = chart.scales.y;
            if (x < xAxis.left || x > xAxis.right || y < yAxis.top || y > yAxis.bottom) return;
            ctx.save();
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            ctx.strokeStyle = isDark ? 'rgba(200, 200, 200, 0.5)' : 'rgba(80, 80, 80, 0.6)';
            ctx.lineWidth = 1;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.moveTo(x, yAxis.top);
            ctx.lineTo(x, yAxis.bottom);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(xAxis.left, y);
            ctx.lineTo(xAxis.right, y);
            ctx.stroke();
            ctx.restore();
        }
    };

    function formatRangeDuration(rawDate1, rawDate2) {
        const d1 = new Date(rawDate1), d2 = new Date(rawDate2);
        const later = d1 < d2 ? d2 : d1, earlier = d1 < d2 ? d1 : d2;
        let years = later.getFullYear() - earlier.getFullYear();
        let months = later.getMonth() - earlier.getMonth();
        let days = later.getDate() - earlier.getDate();
        if (days < 0) { months--; days += new Date(later.getFullYear(), later.getMonth(), 0).getDate(); }
        if (months < 0) { years--; months += 12; }
        const parts = [];
        if (years > 0) parts.push(`${years} yr${years !== 1 ? 's' : ''}`);
        if (months > 0) parts.push(`${months} mo`);
        if (days > 0 && years === 0) parts.push(`${days} day${days !== 1 ? 's' : ''}`);
        return parts.length ? parts.join(' ') : '0 days';
    }

    function clearSelection() {
        selectedPoints = [];
        if (pensionChart) { pensionChart._selectionIndices = []; pensionChart.update('none'); }
        updateRangeDisplay();
    }

    function updateRangeDisplay() {
        if (!rangeHint || !rangeValues) return;
        if (selectedPoints.length === 0) {
            rangeHint.textContent = I18n.t('pension.chart.rangeSelectFirst');
            rangeHint.style.display = '';
            rangeValues.style.display = 'none';
        } else if (selectedPoints.length === 1) {
            rangeHint.textContent = I18n.t('pension.chart.rangeSelectSecond');
            rangeHint.style.display = '';
            rangeValues.style.display = 'none';
            if (pensionChart) { pensionChart._selectionIndices = [selectedPoints[0].index]; pensionChart.update('none'); }
        } else {
            const [p1, p2] = [...selectedPoints].sort((a, b) => a.index - b.index);
            const diff = p2.value - p1.value;
            const pct = p1.value !== 0 ? (diff / p1.value) * 100 : 0;
            const baseCurrency = Settings.getBaseCurrency ? Settings.getBaseCurrency() : 'USD';
            rangeFrom.textContent = `${p1.label}: ${formatCurrency(p1.value, baseCurrency)}`;
            rangeTo.textContent = `${p2.label}: ${formatCurrency(p2.value, baseCurrency)}`;
            const diffSign = diff >= 0 ? '+' : '';
            rangeDiff.textContent = `${diffSign}${formatCurrency(diff, baseCurrency)}`;
            rangeDiff.className = 'range-diff ' + (diff >= 0 ? 'positive' : 'negative');
            rangePct.textContent = `(${diffSign}${pct.toFixed(2)}%)`;
            rangePct.className = 'range-pct ' + (pct >= 0 ? 'positive' : 'negative');
            if (rangeDuration) rangeDuration.textContent = formatRangeDuration(p1.rawDate, p2.rawDate);
            rangeHint.style.display = 'none';
            rangeValues.style.display = 'flex';
            if (pensionChart) { pensionChart._selectionIndices = [p1.index, p2.index]; pensionChart.update('none'); }
        }
    }

    function setupAmountInput(input) {
        if (!input) return;
        input.addEventListener('input', (e) => {
            e.target.value = formatInputValue(e.target.value);
        });
        input.addEventListener('blur', (e) => {
            e.target.value = formatInputValue(e.target.value, true);
        });
    }

    function getStorageKey(id) {
        return STORAGE_PREFIX + id;
    }

    function loadPensionList() {
        const list = storage.getItem(LIST_KEY);
        if (list) {
            try { pensions = JSON.parse(list) || []; } catch (e) { pensions = []; }
        }
        pensions.forEach(p => { if (p.show === undefined) p.show = true; });
        if (pensions.length === 0) {
            pensions = [{ id: 'pen1', name: 'Pension 1', type: 'growth', start: 0, show: true }];
            savePensionList();
            storage.setItem(getStorageKey('pen1'), '[]');
        }
        currentPensionId = pensions[0].id;
    }

    function savePensionList() {
        storage.setItem(LIST_KEY, JSON.stringify(pensions));
    }

    function loadEntries() {
        if (summaryMode) {
            const included = pensions.filter(p => p.show !== false);
            summaryInfo.start = included.reduce((a, p) => a + (parseFloat(p.start) || 0), 0);
            summaryInfo.type = included.some(p => p.type === 'payments') ? 'payments' : 'growth';
            const dateSet = new Set();
            const dataMap = {};
            included.forEach(p => {
                const d = storage.getItem(getStorageKey(p.id));
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
            const data = storage.getItem(getStorageKey(currentPensionId));
            if (data) {
                try { entries = JSON.parse(data) || []; } catch (e) { entries = []; }
            } else {
                entries = [];
            }
        }
    }

    function saveEntries() {
        storage.setItem(getStorageKey(currentPensionId), JSON.stringify(entries));
    }

    function updatePaymentHeader() {
        const current = summaryMode ? summaryInfo : pensions.find(p => p.id === currentPensionId);
        if (!paymentHeader || !totalPaymentHeader) return;
        const show = current && current.type === 'payments' ? 'table-cell' : 'none';
        paymentHeader.style.display = show;
        totalPaymentHeader.style.display = show;
    }

    function formatDisplayDate(dateStr) {
        if (!dateStr) return '';
        const [year, month, day] = dateStr.split('-');
        return `${day}/${month}/${year}`;
    }

    function renderTabs() {
        if (!pensionTabs) return;
        const activeId = summaryMode ? 'summary' : currentPensionId;
        pensionTabs.innerHTML = '';
        const summaryTab = document.createElement('button');
        summaryTab.className = 'sub-nav-tab';
        summaryTab.dataset.id = 'summary';
        summaryTab.setAttribute('data-i18n', 'common.summary');
        summaryTab.textContent = I18n.t('common.summary');
        pensionTabs.appendChild(summaryTab);
        pensions.forEach(p => {
            const btn = document.createElement('button');
            btn.className = 'sub-nav-tab';
            btn.textContent = p.name;
            btn.dataset.id = p.id;
            pensionTabs.appendChild(btn);
        });
        pensionTabs.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
        const activeBtn = pensionTabs.querySelector(`button[data-id="${activeId}"]`);
        if (activeBtn) activeBtn.classList.add('active');
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
        storage.setItem(getStorageKey(id), '[]');
        switchPension(id);
        updatePaymentHeader();
        closeNewPensionModal();
    }

    async function removePension() {
        if (pensions.length <= 1) return;
        const idx = pensions.findIndex(p => p.id === currentPensionId);
        if (idx !== -1) {
            const confirmed = await DialogManager.confirm(I18n.t('dialog.deletePension'), I18n.t('dialog.delete'));
            if (!confirmed) return;
            storage.removeItem(getStorageKey(currentPensionId));
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
        const value = parseFloat(entryValueInput.value.replace(/,/g, ''));
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
        editValueInput.value = formatInputValue(String(entry.value), true);
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
        const value = parseFloat(editValueInput.value.replace(/,/g, ''));
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
            const confirmed = await DialogManager.confirm(I18n.t('dialog.deleteEntry'), I18n.t('dialog.delete'));
            if (confirmed) {
                entries.splice(idx, 1);
                saveEntries();
                renderTable();
            }
        }
    }

    function formatCurrency(val, currency = 'USD') {
        return I18n.formatCurrency(val, currency);
    }

    function getEntriesFor(id) {
        if (id === 'summary') {
            const included = pensions.filter(p => p.show !== false);
            const dateSet = new Set();
            const dataMap = {};
            included.forEach(p => {
                const d = storage.getItem(getStorageKey(p.id));
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
            const data = storage.getItem(getStorageKey(id));
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

    function xirr(cashFlows, dates, guess = 0.1) {
        const TOLERANCE = 1e-6;
        const MAX_ITER = 100;
        const days = dates.map(d => (new Date(d) - new Date(dates[0])) / (1000 * 60 * 60 * 24));
        let rate = guess;
        for (let i = 0; i < MAX_ITER; i++) {
            let npv = 0;
            let dnpv = 0;
            for (let j = 0; j < cashFlows.length; j++) {
                const t = days[j] / 365.25;
                const factor = Math.pow(1 + rate, t);
                npv += cashFlows[j] / factor;
                dnpv -= t * cashFlows[j] / (factor * (1 + rate));
            }
            if (dnpv === 0) return null;
            const newRate = rate - npv / dnpv;
            if (Math.abs(newRate - rate) < TOLERANCE) return newRate;
            rate = newRate;
        }
        return null;
    }

    function computeAnalysis(stats) {
        if (!stats || stats.length === 0) return null;
        const current = summaryMode ? summaryInfo : pensions.find(p => p.id === currentPensionId);
        const startVal = parseFloat(current.start) || 0;
        const endVal = stats[stats.length - 1].value;

        const xirrFlows = [];
        const xirrDates = [];
        if (startVal > 0) {
            xirrFlows.push(-startVal);
            xirrDates.push(stats[0].date);
        }
        if (current.type === 'payments') {
            entries.forEach(en => {
                const pmt = parseFloat(en.payment) || 0;
                if (pmt > 0) {
                    xirrFlows.push(-pmt);
                    xirrDates.push(en.date);
                }
            });
        }
        xirrFlows.push(endVal);
        xirrDates.push(stats[stats.length - 1].date);

        let cagr = null;
        if (xirrFlows.length >= 2) {
            const rate = xirr(xirrFlows, xirrDates);
            if (rate !== null && isFinite(rate)) cagr = rate * 100;
        }

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

        const cagrEl = document.getElementById('pension-current-cagr');
        const bestMonthEl = document.getElementById('pension-best-month');
        const worstMonthEl = document.getElementById('pension-worst-month');
        const bestYearEl = document.getElementById('pension-best-year');
        const worstYearEl = document.getElementById('pension-worst-year');
        const totalValueEl = document.getElementById('pension-total-value');

        const baseCurrency = Settings.getBaseCurrency ? Settings.getBaseCurrency() : 'USD';
        const current = summaryMode ? summaryInfo : pensions.find(p => p.id === currentPensionId);
        const startVal = current ? parseFloat(current.start) || 0 : 0;
        const latestVal = stats && stats.length ? stats[stats.length - 1].value : startVal;
        if (totalValueEl) totalValueEl.textContent = formatCurrency(latestVal, baseCurrency);

        const hideProjection = () => {
            const sc = document.getElementById('pension-projection-scenarios');
            if (sc) sc.style.display = 'none';
        };

        if (!stats || stats.length === 0) {
            cagrEl.textContent = bestMonthEl.textContent = worstMonthEl.textContent =
                bestYearEl.textContent = worstYearEl.textContent = '---';
            hideProjection();
            container.style.display = 'flex';
            return;
        }

        const analysis = computeAnalysis(stats);
        if (!analysis) {
            cagrEl.textContent = bestMonthEl.textContent = worstMonthEl.textContent =
                bestYearEl.textContent = worstYearEl.textContent = '---';
            hideProjection();
            container.style.display = 'flex';
            return;
        }

        cagrEl.textContent = analysis.cagr != null ? analysis.cagr.toFixed(2) + '%' : '---';
        bestMonthEl.textContent = analysis.bestMonth ? `${formatDisplayDate(analysis.bestMonth.date)} (${analysis.bestMonth.pct.toFixed(2)}%)` : '---';
        worstMonthEl.textContent = analysis.worstMonth ? `${formatDisplayDate(analysis.worstMonth.date)} (${analysis.worstMonth.pct.toFixed(2)}%)` : '---';
        bestYearEl.textContent = analysis.bestYear ? `${analysis.bestYear.year} (${analysis.bestYear.pct.toFixed(2)}%)` : '---';
        worstYearEl.textContent = analysis.worstYear ? `${analysis.worstYear.year} (${analysis.worstYear.pct.toFixed(2)}%)` : '---';

        const formulaEl = document.getElementById('pension-projection-formula');
        const scenariosEl = document.getElementById('pension-projection-scenarios');
        const lowRateEl = document.getElementById('pension-projection-low-rate');
        const baseRateEl = document.getElementById('pension-projection-base-rate');
        const highRateEl = document.getElementById('pension-projection-high-rate');
        const lowEl = document.getElementById('pension-projected-low');
        const baseEl = document.getElementById('pension-projected-base');
        const highEl = document.getElementById('pension-projected-high');

        const clearProjection = (msg) => {
            if (formulaEl) formulaEl.textContent = msg || '';
            if (scenariosEl) scenariosEl.style.display = 'none';
        };

        const dob = Settings.getDob ? Settings.getDob() : '';
        const retAge = Settings.getRetirementAge ? Settings.getRetirementAge() : null;
        const yearsLeft = getYearsToRetirement(dob, retAge);

        const lastEntry = entries.length > 0 ? entries[entries.length - 1] : null;
        const latestPayment = lastEntry ? (parseFloat(lastEntry.payment) || 0) : 0;

        if (yearsLeft === null || analysis.cagr === null) {
            clearProjection(yearsLeft === null ? 'Set Date of Birth and Retirement Age in Settings to see projection.' : '');
        } else if (yearsLeft <= 0) {
            clearProjection('Retirement age reached');
        } else {
            const baseCagr = analysis.cagr;
            const conservativeCagr = Math.max(1, baseCagr - 5);
            const optimisticCagr = baseCagr + 5;
            const yrs = Math.round(yearsLeft * 10) / 10;

            const lowVal = calculateRetirementProjection(latestVal, latestPayment, conservativeCagr, yearsLeft);
            const baseVal = calculateRetirementProjection(latestVal, latestPayment, baseCagr, yearsLeft);
            const highVal = calculateRetirementProjection(latestVal, latestPayment, optimisticCagr, yearsLeft);

            if (formulaEl) {
                formulaEl.textContent = `FV = PV\u00d7(1+r)\u207F + PMT\u00d7((1+r)\u207F\u22121)/r | Current: ${formatCurrency(latestVal, baseCurrency)}, Monthly: ${formatCurrency(latestPayment, baseCurrency)}, Years: ${yrs}`;
            }
            if (scenariosEl) scenariosEl.style.display = 'flex';
            if (lowRateEl) lowRateEl.textContent = `${conservativeCagr.toFixed(1)}% p.a.`;
            if (baseRateEl) baseRateEl.textContent = `${baseCagr.toFixed(1)}% p.a.`;
            if (highRateEl) highRateEl.textContent = `${optimisticCagr.toFixed(1)}% p.a.`;
            if (lowEl) lowEl.textContent = lowVal !== null ? formatCurrency(lowVal, baseCurrency) : '---';
            if (baseEl) baseEl.textContent = baseVal !== null ? formatCurrency(baseVal, baseCurrency) : '---';
            if (highEl) highEl.textContent = highVal !== null ? formatCurrency(highVal, baseCurrency) : '---';
        }

        renderMarketAvgProjection(latestVal, latestPayment, yearsLeft, baseCurrency);
        renderCustomRateProjection(latestVal, latestPayment, yearsLeft, baseCurrency);

        container.style.display = 'flex';
    }

    function renderMarketAvgProjection(latestVal, latestPayment, yearsLeft, baseCurrency) {
        const scenariosEl = document.getElementById('pension-market-avg-scenarios');
        const formulaEl = document.getElementById('pension-market-avg-formula');
        const lowEl = document.getElementById('pension-market-avg-low');
        const baseEl = document.getElementById('pension-market-avg-base');
        const highEl = document.getElementById('pension-market-avg-high');

        if (!scenariosEl) return;

        if (!yearsLeft || yearsLeft <= 0) {
            scenariosEl.style.display = 'none';
            if (formulaEl) formulaEl.textContent = '';
            return;
        }

        const yrs = Math.round(yearsLeft * 10) / 10;
        const lowVal = calculateRetirementProjection(latestVal, latestPayment, 7, yearsLeft);
        const baseVal = calculateRetirementProjection(latestVal, latestPayment, 10, yearsLeft);
        const highVal = calculateRetirementProjection(latestVal, latestPayment, 12, yearsLeft);

        if (formulaEl) {
            formulaEl.textContent = `S\u0026P 500 historical averages | Current: ${formatCurrency(latestVal, baseCurrency)}, Monthly: ${formatCurrency(latestPayment, baseCurrency)}, Years: ${yrs}`;
        }
        scenariosEl.style.display = 'flex';
        if (lowEl) lowEl.textContent = lowVal !== null ? formatCurrency(lowVal, baseCurrency) : '---';
        if (baseEl) baseEl.textContent = baseVal !== null ? formatCurrency(baseVal, baseCurrency) : '---';
        if (highEl) highEl.textContent = highVal !== null ? formatCurrency(highVal, baseCurrency) : '---';
    }

    function renderCustomRateProjection(latestVal, latestPayment, yearsLeft, baseCurrency) {
        const scenariosEl = document.getElementById('pension-custom-rate-scenarios');
        const formulaEl = document.getElementById('pension-custom-rate-formula');
        const rateDisplay = document.getElementById('pension-custom-rate-display');
        const projectedEl = document.getElementById('pension-custom-projected');

        if (!scenariosEl) return;

        const savedRate = localStorage.getItem('pensionCustomRate');
        const rate = savedRate !== null ? parseFloat(savedRate) : NaN;

        if (!yearsLeft || yearsLeft <= 0 || isNaN(rate)) {
            scenariosEl.style.display = 'none';
            if (formulaEl) formulaEl.textContent = yearsLeft && yearsLeft > 0 ? 'Enter a growth rate above to see your projection.' : '';
            return;
        }

        const yrs = Math.round(yearsLeft * 10) / 10;
        const projVal = calculateRetirementProjection(latestVal, latestPayment, rate, yearsLeft);

        if (formulaEl) {
            formulaEl.textContent = `Current: ${formatCurrency(latestVal, baseCurrency)}, Monthly: ${formatCurrency(latestPayment, baseCurrency)}, Years: ${yrs}`;
        }
        scenariosEl.style.display = 'flex';
        if (rateDisplay) rateDisplay.textContent = `${rate.toFixed(1)}% p.a.`;
        if (projectedEl) projectedEl.textContent = projVal !== null ? formatCurrency(projVal, baseCurrency) : '---';
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

        function updateChart() {
            clearSelection();
            const ids = Array.from(chartSelect.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.value);
            const dateSet = new Set();
            const datasets = [];
            if (summaryMode) {
                const ents = getEntriesFor('summary');
                ents.forEach(en => dateSet.add(en.date));
                datasets.push({ id: 'summary', name: I18n.t('common.summary'), entries: ents });
            }
            ids.forEach(id => {
                const ents = getEntriesFor(id);
                ents.forEach(en => dateSet.add(en.date));
                const name = (pensions.find(p => p.id === id) || {}).name || id;
                datasets.push({ id, name, entries: ents });
            });
            const rawDates = Array.from(dateSet).sort();
            const labels = rawDates.map(formatDisplayDate);
            const chartDatasets = datasets.map((ds, idx) => {
                const map = new Map(ds.entries.map(e => [e.date, e.value]));
                const data = rawDates.map(d => map.get(d) ?? null);
                const color = `hsl(${(idx * 360 / datasets.length) % 360},70%,60%)`;
                return { label: ds.name, data, borderColor: color, backgroundColor: color, fill: false, tension: 0.2, spanGaps: true };
            });
            if (pensionChart) pensionChart.destroy();
            pensionChart = new Chart(chartCanvas.getContext('2d'), {
                type: 'line',
                data: { labels, datasets: chartDatasets },
                options: {
                    responsive: true,
                    onClick(event) {
                        if (!rangeToolActive) return;
                        const pts = pensionChart.getElementsAtEventForMode(event, 'nearest', { intersect: false }, false);
                        if (!pts.length) return;
                        const { datasetIndex, index } = pts[0];
                        const value = pensionChart.data.datasets[datasetIndex].data[index];
                        if (value === null) return;
                        const label = pensionChart.data.labels[index];
                        if (selectedPoints.length === 1 && selectedPoints[0].index === index && selectedPoints[0].datasetIndex === datasetIndex) return;
                        if (selectedPoints.length >= 2) selectedPoints = [];
                        selectedPoints.push({ label, value, index, datasetIndex, rawDate: rawDates[index] });
                        updateRangeDisplay();
                    }
                },
                plugins: [selectionLinesPlugin, crosshairPlugin]
            });
        }

        updateChart();

        chartCanvas.addEventListener('mousemove', (e) => {
            if (!pensionChart) return;
            const rect = chartCanvas.getBoundingClientRect();
            pensionChart._crosshairPos = { x: e.clientX - rect.left, y: e.clientY - rect.top };
            pensionChart.update('none');
        });
        chartCanvas.addEventListener('mouseleave', () => {
            if (!pensionChart) return;
            pensionChart._crosshairPos = null;
            pensionChart.update('none');
        });

        chartModal.style.display = 'flex';
    }

    function closeChart() {
        if (chartModal) chartModal.style.display = 'none';
        rangeToolActive = false;
        if (rangeToolBtn) rangeToolBtn.classList.remove('active');
        if (rangeResult) rangeResult.style.display = 'none';
        clearSelection();
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
                <td>${formatDisplayDate(st.date)}</td>
                ${type==='payments'?`<td class="number-cell">${formatCurrency(paymentVal, baseCurrency)}</td><td class="number-cell">${formatCurrency(st.totalPayments, baseCurrency)}</td>`:''}
                <td class="number-cell">${formatCurrency(valueVal, baseCurrency)}</td>
                <td class="number-cell ${monthlyClass}">${formatCurrency(monthlyVal, baseCurrency)}</td>
                <td class="number-cell ${monthlyPctClass}">${st.monthlyPLPct.toFixed(2)}%</td>
                <td class="number-cell ${ytdClass}">${formatCurrency(ytdVal, baseCurrency)}</td>
                <td class="number-cell ${ytdPctClass}">${st.ytdPLPct.toFixed(2)}%</td>
                <td class="number-cell ${totalClass}">${formatCurrency(totalVal, baseCurrency)}</td>
                <td class="number-cell ${totalPctClass}">${st.totalPLPct.toFixed(2)}%</td>
                ${summaryMode ? '' : `<td class="actions-cell">
                    <button class="icon-btn edit-btn" data-index="${st.index}" title="Edit" aria-label="Edit">
                        <svg width="16" height="16" viewBox="0 0 512 512"><polygon points="364.13 125.25 87 403 64 448 108.99 425 386.75 147.87 364.13 125.25" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32px"/><path d="M420.69,68.69,398.07,91.31l22.62,22.63,22.62-22.63a16,16,0,0,0,0-22.62h0A16,16,0,0,0,420.69,68.69Z" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32px"/></svg>
                    </button>
                    <button class="icon-btn delete-btn" data-index="${st.index}" title="Delete" aria-label="Delete">
                        <svg width="16" height="16" viewBox="0 0 512 512"><path d="M112,112l20,320c.95,18.49,14.4,32,32,32H348c17.67,0,30.87-13.51,32-32l20-320" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32px"/><line x1="80" y1="112" x2="432" y2="112" style="stroke:currentColor;stroke-linecap:round;stroke-miterlimit:10;stroke-width:32px"/><path d="M192,112V72h0a23.93,23.93,0,0,1,24-24h80a23.93,23.93,0,0,1,24,24h0v40" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32px"/><line x1="256" y1="176" x2="256" y2="400" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32px"/><line x1="184" y1="176" x2="192" y2="400" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32px"/><line x1="328" y1="176" x2="320" y2="400" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32px"/></svg>
                    </button>
                </td>`}
            `;
            tbody.appendChild(row);
        });
        updateSummaryCards(stats);
    }

    function init() {
        setupAmountInput(entryValueInput);
        setupAmountInput(editValueInput);
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
        if (rangeToolBtn) rangeToolBtn.addEventListener('click', () => {
            rangeToolActive = !rangeToolActive;
            rangeToolBtn.classList.toggle('active', rangeToolActive);
            if (rangeResult) rangeResult.style.display = rangeToolActive ? 'flex' : 'none';
            if (rangeToolActive) updateRangeDisplay();
            else clearSelection();
        });
        if (rangeClear) rangeClear.addEventListener('click', clearSelection);

        document.getElementById('pension-body').addEventListener('click', handleRowAction);
        editCancel.addEventListener('click', closeEditEntryModal);
        editEntryForm.addEventListener('submit', saveEditEntry);
        editEntryModal.addEventListener('click', e => { if (e.target === editEntryModal) closeEditEntryModal(); });

        newPensionModal.addEventListener('click', e => { if (e.target === newPensionModal) closeNewPensionModal(); });
        entryModal.addEventListener('click', e => { if (e.target === entryModal) closeEntryModal(); });

        const customRateInput = document.getElementById('pension-custom-rate-input');
        if (customRateInput) {
            const saved = localStorage.getItem('pensionCustomRate');
            if (saved !== null) customRateInput.value = saved;
            customRateInput.addEventListener('input', () => {
                const val = customRateInput.value.trim();
                if (val === '' || isNaN(parseFloat(val))) {
                    localStorage.removeItem('pensionCustomRate');
                } else {
                    localStorage.setItem('pensionCustomRate', parseFloat(val));
                }
                const stats = computeStats();
                const analysis = computeAnalysis(stats);
                if (!stats || !analysis) return;
                const baseCurrency = Settings.getBaseCurrency ? Settings.getBaseCurrency() : 'USD';
                const current = summaryMode ? summaryInfo : pensions.find(p => p.id === currentPensionId);
                const startVal = current ? parseFloat(current.start) || 0 : 0;
                const latestVal = stats.length ? stats[stats.length - 1].value : startVal;
                const lastEntry = entries.length > 0 ? entries[entries.length - 1] : null;
                const latestPayment = lastEntry ? (parseFloat(lastEntry.payment) || 0) : 0;
                const dob = Settings.getDob ? Settings.getDob() : '';
                const retAge = Settings.getRetirementAge ? Settings.getRetirementAge() : null;
                const yearsLeft = getYearsToRetirement(dob, retAge);
                renderCustomRateProjection(latestVal, latestPayment, yearsLeft, baseCurrency);
            });
        }

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
            let entriesData = storage.getItem(getStorageKey(p.id));
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
            storage.setItem(getStorageKey(id), JSON.stringify((p.entries || []).map(en => ({
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
            storage.removeItem(getStorageKey(p.id));
        });
        storage.removeItem(LIST_KEY);
        pensions = [];
        entries = [];
        loadPensionList();
        loadEntries();
        renderTabs();
        updatePaymentHeader();
        renderTable();
    }

    function calculateRetirementProjection(currentValue, monthlyContribution, annualGrowthRatePct, yearsToRetirement) {
        if (
            typeof currentValue !== 'number' || isNaN(currentValue) ||
            typeof monthlyContribution !== 'number' || isNaN(monthlyContribution) ||
            typeof annualGrowthRatePct !== 'number' || isNaN(annualGrowthRatePct) ||
            typeof yearsToRetirement !== 'number' || isNaN(yearsToRetirement) ||
            yearsToRetirement <= 0
        ) return null;

        const months = yearsToRetirement * 12;
        const monthlyRate = Math.pow(1 + annualGrowthRatePct / 100, 1 / 12) - 1;
        if (Math.abs(monthlyRate) < 1e-10) {
            return currentValue + monthlyContribution * months;
        }
        const growthFactor = Math.pow(1 + monthlyRate, months);
        return currentValue * growthFactor + monthlyContribution * ((growthFactor - 1) / monthlyRate);
    }

    function getYearsToRetirement(dob, retirementAge) {
        if (!dob || retirementAge == null || isNaN(retirementAge)) return null;
        const dobDate = new Date(dob);
        if (isNaN(dobDate.getTime())) return null;
        const retirementDate = new Date(dobDate);
        retirementDate.setFullYear(dobDate.getFullYear() + retirementAge);
        return (retirementDate - new Date()) / (1000 * 60 * 60 * 24 * 365.25);
    }

    return { init, exportData, importData, deleteAllData, calculateRetirementProjection, getYearsToRetirement };
})();

if (typeof module !== 'undefined') module.exports = PensionManager;
