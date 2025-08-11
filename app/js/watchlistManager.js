const WatchlistManager = (function() {
    const STORAGE_KEY = 'watchlistData';
    let watchlist = [];

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

    function save() {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(watchlist)); } catch (e) {}
    }

    function load() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            if (data) watchlist = JSON.parse(data) || [];
        } catch (e) {
            watchlist = [];
        }
    }

    function formatNumber(val) {
        return typeof val === 'number' ? val.toFixed(2) : '--';
    }

    function formatPercent(val) {
        return typeof val === 'number' ? val.toFixed(2) + '%' : '--';
    }

    function render() {
        if (!tbody) return;
        tbody.innerHTML = '';
        watchlist.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${item.ticker}</td>
                <td>${item.name || ''}</td>
                <td>${item.currency || ''}</td>
                <td class="number-cell">${formatNumber(item.price)}</td>
                <td class="number-cell">${formatNumber(item.change)}</td>
                <td class="number-cell">${formatPercent(item.changePct)}</td>
                <td class="number-cell">${formatNumber(item.high)}</td>
                <td class="number-cell">${formatNumber(item.low)}</td>
                <td class="number-cell">${formatNumber(item.open)}</td>
                <td class="number-cell">${formatNumber(item.prevClose)}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    function openModal() {
        if (modal) {
            modal.style.display = 'block';
            tickerInput.value = '';
            nameInput.value = '';
            if (currencySelect) currencySelect.value = 'USD';
        }
    }

    function closeModal() {
        if (modal) modal.style.display = 'none';
    }

    function addStock(e) {
        e.preventDefault();
        const ticker = (tickerInput.value || '').trim().toUpperCase();
        if (!ticker) return;
        if (watchlist.some(w => w.ticker === ticker)) {
            closeModal();
            form.reset();
            return;
        }
        const item = {
            ticker,
            name: (nameInput.value || '').trim(),
            currency: currencySelect.value || 'USD'
        };
        watchlist.push(item);
        save();
        render();
        closeModal();
        form.reset();
    }

    async function fetchLastPrices() {
        if (watchlist.length === 0) return;
        const updates = watchlist.map(async item => {
            try {
                const { raw } = await QuotesService.fetchQuote(item.ticker);
                if (raw) {
                    item.price = typeof raw.c === 'number' ? raw.c : null;
                    item.change = typeof raw.d === 'number' ? raw.d : null;
                    item.changePct = typeof raw.dp === 'number' ? raw.dp : null;
                    item.high = typeof raw.h === 'number' ? raw.h : null;
                    item.low = typeof raw.l === 'number' ? raw.l : null;
                    item.open = typeof raw.o === 'number' ? raw.o : null;
                    item.prevClose = typeof raw.pc === 'number' ? raw.pc : null;
                }
            } catch (e) {}
        });
        await Promise.all(updates);
        save();
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
        window.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
    }

    return { init, fetchLastPrices };
})();
