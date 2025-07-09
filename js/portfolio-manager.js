export const PortfolioManager = (function() {
    'use strict';
    
    const STORAGE_KEY = 'portfolioData';
    let investments = [];
    let pieChart = null;
    let barChart = null;

    const addBtn = document.getElementById('add-investment-btn');
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

    function loadData() {
        const data = localStorage.getItem(STORAGE_KEY);
        if (data) {
            try {
                investments = JSON.parse(data) || [];
            } catch (e) {
                investments = [];
            }
        }
    }

    function saveData() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(investments));
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

    function updateCharts() {
        const labels = investments.map(inv => inv.ticker);
        const values = investments.map(inv => inv.quantity * inv.lastPrice);
        const total = values.reduce((a, b) => a + b, 0);
        const plPercents = investments.map(inv => {
            const cost = inv.quantity * inv.avgPrice;
            const value = inv.quantity * inv.lastPrice;
            return cost ? ((value - cost) / cost) * 100 : 0;
        });
        const colors = labels.map((_, i) => `hsl(${(i * 360 / labels.length) % 360},70%,60%)`);

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
                                    return `${ctx.label}: ${pct.toFixed(1)}%`;
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
                return `${ctx.label}: ${pct.toFixed(1)}%`;
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
                                label: (ctx) => `${ctx.label}: ${ctx.parsed.toFixed(1)}%`
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
                investments.splice(idx, 1);
                saveData();
                renderTable();
            }
        }
    }

    function init() {
        loadData();
        addBtn.addEventListener('click', openModal);
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
