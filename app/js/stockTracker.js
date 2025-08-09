let stockData = {
    tickers: [],
    startYear: new Date().getFullYear() - 5,
    prices: {}
};

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
        if (btn) btn.textContent = editMode ? I18n.t('stockTracker.actions.done') : I18n.t('stockTracker.actions.edit');
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
        headerRow.innerHTML = `<tr><th>${I18n.t('stockTracker.table.year')}</th>` +
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
        totalGrowthRow.innerHTML = `<td><strong>${I18n.t('stockTracker.table.totalGrowth')}</strong></td>`;

       const cagrRow = document.createElement('tr');
       cagrRow.className = 'summary-row';
       cagrRow.innerHTML = `<td><strong>${I18n.t('stockTracker.table.cagr')}</strong></td>`;

        const chartRow = document.createElement('tr');
        chartRow.className = 'summary-row';
        chartRow.innerHTML = `<td><strong>${I18n.t('stockTracker.table.chart')}</strong></td>`;

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
        if (titleEl) titleEl.textContent = I18n.t('stockTracker.chart.title');

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


    function exportData(format = 'json') {
        if (format === 'csv') {
            const lines = ['ticker,year,price'];
            stockData.tickers.forEach(t => {
                const prices = stockData.prices[t] || {};
                Object.keys(prices).forEach(y => {
                    lines.push(`${t},${y},${prices[y]}`);
                });
            });
            return lines.join('\n');
        }
        return JSON.stringify(stockData, null, 2);
    }

    function importData(text, format = 'json') {
        let obj = null;
        if (format === 'csv') {
            const lines = text.trim().split(/\r?\n/).filter(l => l.trim());
            lines.shift();
            const prices = {};
            const tickers = new Set();
            lines.forEach(line => {
                const parts = line.split(',');
                const ticker = (parts[0] || '').trim().toUpperCase();
                const year = parseInt(parts[1]);
                const price = parseFloat(parts[2]);
                if (!ticker) return;
                tickers.add(ticker);
                if (!prices[ticker]) prices[ticker] = {};
                if (!isNaN(year) && !isNaN(price)) prices[ticker][year] = price;
            });
            const years = Object.values(prices).flatMap(p => Object.keys(p).map(y => parseInt(y)));
            const startYear = years.length ? Math.min(...years) : stockData.startYear;
            obj = { tickers: Array.from(tickers), startYear, prices };
        } else {
            try { obj = JSON.parse(text); } catch (e) { obj = null; }
        }
        if (!obj) return;
        stockData.tickers = Array.isArray(obj.tickers) ? obj.tickers : [];
        stockData.startYear = obj.startYear || stockData.startYear;
        stockData.prices = obj.prices || {};
        saveData();
        if (document.getElementById('ticker-tags')) updateTickerTags();
        if (stockData.tickers.length > 0 && document.getElementById('performance-table')) {
            generatePerformanceTable();
        } else {
            const cont = document.getElementById('performance-table-container');
            if (cont) cont.style.display = 'none';
        }
        if (document.getElementById('stock-summary-cards')) updateSummaryCards();
    }

    function deleteAllData() {
        localStorage.removeItem(STORAGE_KEY);
        stockData = { tickers: [], startYear: new Date().getFullYear() - 5, prices: {} };
        if (document.getElementById('ticker-tags')) updateTickerTags();
        const cont = document.getElementById('performance-table-container');
        if (cont) cont.style.display = 'none';
        if (document.getElementById('stock-summary-cards')) updateSummaryCards();
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
        removeTicker,
        exportData,
        importData,
        deleteAllData,
        fetchLatestPrices
    };
})();
