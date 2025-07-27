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

    const editEntryModal = document.getElementById('pension-edit-modal');
    const editEntryForm = document.getElementById('pension-edit-form');
    const editDateInput = document.getElementById('pension-edit-date');
    const editValueInput = document.getElementById('pension-edit-value');
    const editPaymentInput = document.getElementById('pension-edit-payment');
    const editCancel = document.getElementById('cancel-pension-edit');
    let editIndex = null;
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
            const totalPLPct = startVal ? (totalPL / startVal) * 100 : 0;
            prev = entry.value;
            return Object.assign({}, entry, {
                monthlyPL, monthlyPLPct,
                ytdPL, ytdPLPct,
                totalPL, totalPLPct,
                index: idx
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
            row.dataset.index = st.index;
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
                <td class="actions-cell">
                    <button class="icon-btn edit-btn" data-index="${st.index}" title="Edit">
                        <svg width="16" height="16" viewBox="0 0 512 512"><polygon points="364.13 125.25 87 403 64 448 108.99 425 386.75 147.87 364.13 125.25" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32px"/><path d="M420.69,68.69,398.07,91.31l22.62,22.63,22.62-22.63a16,16,0,0,0,0-22.62h0A16,16,0,0,0,420.69,68.69Z" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32px"/></svg>
                    </button>
                    <button class="icon-btn delete-btn" data-index="${st.index}" title="Delete">
                        <svg width="16" height="16" viewBox="0 0 512 512"><path d="M112,112l20,320c.95,18.49,14.4,32,32,32H348c17.67,0,30.87-13.51,32-32l20-320" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32px"/><line x1="80" y1="112" x2="432" y2="112" style="stroke:currentColor;stroke-linecap:round;stroke-miterlimit:10;stroke-width:32px"/><path d="M192,112V72h0a23.93,23.93,0,0,1,24-24h80a23.93,23.93,0,0,1,24,24h0v40" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32px"/><line x1="256" y1="176" x2="256" y2="400" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32px"/><line x1="184" y1="176" x2="192" y2="400" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32px"/><line x1="328" y1="176" x2="320" y2="400" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32px"/></svg>
                    </button>
                </td>
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

        document.getElementById('pension-body').addEventListener('click', handleRowAction);
        editCancel.addEventListener('click', closeEditEntryModal);
        editEntryForm.addEventListener('submit', saveEditEntry);
        editEntryModal.addEventListener('click', e => { if (e.target === editEntryModal) closeEditEntryModal(); });

        newPensionModal.addEventListener('click', e => { if (e.target === newPensionModal) closeNewPensionModal(); });
        entryModal.addEventListener('click', e => { if (e.target === entryModal) closeEntryModal(); });
    }

    return { init };
})();
