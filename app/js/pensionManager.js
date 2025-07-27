const PensionManager = (function() {
    'use strict';

    const LIST_KEY = 'pensionList';
    const STORAGE_PREFIX = 'pensionData_';
    let pensions = [];
    let currentPensionId = null;
    let entries = [];

    const pensionTabs = document.getElementById('pension-tabs');
    const addPensionBtn = document.getElementById('add-pension-btn');
    const removePensionBtn = document.getElementById('remove-pension-btn');
    const addEntryBtn = document.getElementById('add-pension-entry-btn');

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
    const paymentHeader = document.querySelector('#pension-table .payment-col');

    function getStorageKey(id) {
        return STORAGE_PREFIX + id;
    }

    function loadPensionList() {
        const list = localStorage.getItem(LIST_KEY);
        if (list) {
            try { pensions = JSON.parse(list) || []; } catch (e) { pensions = []; }
        }
        if (pensions.length === 0) {
            pensions = [{ id: 'pen1', name: 'Pension 1', type: 'growth', start: 0 }];
            savePensionList();
            localStorage.setItem(getStorageKey('pen1'), '[]');
        }
        currentPensionId = pensions[0].id;
    }

    function savePensionList() {
        localStorage.setItem(LIST_KEY, JSON.stringify(pensions));
    }

    function loadEntries() {
        const data = localStorage.getItem(getStorageKey(currentPensionId));
        if (data) {
            try { entries = JSON.parse(data) || []; } catch (e) { entries = []; }
        } else {
            entries = [];
        }
    }

    function saveEntries() {
        localStorage.setItem(getStorageKey(currentPensionId), JSON.stringify(entries));
    }

    function updatePaymentHeader() {
        const current = pensions.find(p => p.id === currentPensionId);
        if (!paymentHeader) return;
        paymentHeader.style.display = current && current.type === 'payments' ? 'table-cell' : 'none';
    }

    function renderTabs() {
        if (!pensionTabs) return;
        pensionTabs.innerHTML = '';
        pensions.forEach(p => {
            const btn = document.createElement('button');
            btn.className = 'sub-nav-tab' + (p.id === currentPensionId ? ' active' : '');
            btn.textContent = p.name;
            btn.dataset.id = p.id;
            pensionTabs.appendChild(btn);
        });
    }

    function switchPension(id) {
        currentPensionId = id;
        loadEntries();
        renderTabs();
        updatePaymentHeader();
        renderTable();
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
        pensions.push({ id, name, type, start });
        savePensionList();
        localStorage.setItem(getStorageKey(id), '[]');
        switchPension(id);
        updatePaymentHeader();
        closeNewPensionModal();
    }

    function removePension() {
        if (pensions.length <= 1) return;
        const idx = pensions.findIndex(p => p.id === currentPensionId);
        if (idx !== -1) {
            if (!confirm('Delete this pension?')) return;
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

    function formatCurrency(val) {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
    }

    function computeStats() {
        const current = pensions.find(p => p.id === currentPensionId);
        if (!current) return [];
        const type = current.type;
        const startVal = parseFloat(current.start) || 0;
        let prev = startVal;
        let ytdStart = startVal;
        let ytdPayments = 0;
        let totalPayments = 0;
        let currentYear = entries[0] ? new Date(entries[0].date).getFullYear() : new Date().getFullYear();
        return entries.map(entry => {
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
            const totalPLPct = startVal ? (totalPL / startVal) * 100 : 0;
            prev = entry.value;
            return Object.assign({}, entry, {
                monthlyPL, monthlyPLPct,
                ytdPL, ytdPLPct,
                totalPL, totalPLPct
            });
        });
    }

    function renderTable() {
        const tbody = document.getElementById('pension-body');
        if (!tbody) return;
        tbody.innerHTML = '';
        const stats = computeStats();
        stats.forEach(st => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${st.date}</td>
                ${pensions.find(p=>p.id===currentPensionId).type==='payments'?`<td class="number-cell">${formatCurrency(st.payment)}</td>`:''}
                <td class="number-cell">${formatCurrency(st.value)}</td>
                <td class="number-cell">${formatCurrency(st.monthlyPL)}</td>
                <td class="number-cell">${st.monthlyPLPct.toFixed(2)}%</td>
                <td class="number-cell">${formatCurrency(st.ytdPL)}</td>
                <td class="number-cell">${st.ytdPLPct.toFixed(2)}%</td>
                <td class="number-cell">${formatCurrency(st.totalPL)}</td>
                <td class="number-cell">${st.totalPLPct.toFixed(2)}%</td>
            `;
            tbody.appendChild(row);
        });
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

        newPensionModal.addEventListener('click', e => { if (e.target === newPensionModal) closeNewPensionModal(); });
        entryModal.addEventListener('click', e => { if (e.target === entryModal) closeEntryModal(); });
    }

    return { init };
})();
