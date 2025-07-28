const fs = require('fs');
const path = require('path');
const {JSDOM} = require('jsdom');
const vm = require('vm');

test('FinancialDashboard global object exists with init and removeTicker', () => {
  const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {url: 'http://localhost'});
  // prevent automatic init on DOMContentLoaded
  dom.window.document.addEventListener = () => {};
  const context = vm.createContext(dom.window);
  [
    'dialogManager.js',
    'dateUtils.js',
    'tabManager.js',
    'portfolioStorage.js',
    'portfolioManager.js',
    'pensionManager.js',
    'calculator.js',
    'stockTracker.js',
    'stockFinance.js',
    'settings.js',
    'forexData.js',
    'financialDashboard.js',
    'marketStatus.js'
  ].forEach(file => {
    const content = fs.readFileSync(path.resolve(__dirname, `../app/js/${file}`), 'utf8');
    vm.runInContext(content, context);
  });
  const fd = vm.runInContext('FinancialDashboard', context);
  expect(fd).toBeDefined();
  expect(typeof fd.init).toBe('function');
  expect(typeof fd.removeTicker).toBe('function');

  const ms = vm.runInContext('MarketStatus', context);
  expect(ms).toBeDefined();
  expect(typeof ms.init).toBe('function');
});

test('fetchQuote returns price and currency', async () => {
  const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {url: 'http://localhost'});
  const context = vm.createContext(dom.window);
  dom.window.fetch = jest.fn().mockResolvedValue({
    json: () => Promise.resolve({ c: 123.45, currency: 'EUR' })
  });
  const content = fs.readFileSync(path.resolve(__dirname, '../app/js/portfolioManager.js'), 'utf8');
  vm.runInContext(content, context);
  const result = await vm.runInContext('PortfolioManager.fetchQuote("TEST")', context);
  expect(result).toEqual({ price: 123.45, currency: 'EUR' });
});

test('Settings module saves currency to localStorage', () => {
  const html = '<!DOCTYPE html><html><body>' +
    '<select id="base-currency-select"></select>' +
    '</body></html>';
  const dom = new JSDOM(html, {url: 'http://localhost'});
  const { window } = dom;
  const context = vm.createContext(window);
  const content = fs.readFileSync(path.resolve(__dirname, '../app/js/settings.js'), 'utf8');
  vm.runInContext(content, context);
  vm.runInContext('Settings.init()', context);
  vm.runInContext('document.getElementById("base-currency-select").value = "GBP"; document.getElementById("base-currency-select").dispatchEvent(new window.Event("change"));', context);
  expect(window.localStorage.getItem('pf_base_currency')).toBe('GBP');
});

test('DateUtils.formatDate formats date correctly', () => {
  const context = vm.createContext({});
  const content = fs.readFileSync(path.resolve(__dirname, '../app/js/dateUtils.js'), 'utf8');
  vm.runInContext(content, context);
  const result = vm.runInContext('DateUtils.formatDate("2024-05-01")', context);
  expect(result).toBe('01/05/2024');
});

test('Edit modal focuses name input when opened', () => {
  const html = `<!DOCTYPE html><html><body>
    <div id="edit-investment-modal" class="modal">
      <div class="modal-content">
        <div id="edit-record-group" style="display:none;">
          <select id="edit-record-select"></select>
        </div>
        <input type="text" id="edit-name">
        <input type="number" id="edit-quantity">
        <input type="number" id="edit-purchase-price">
        <input type="date" id="edit-purchase-date">
        <input type="number" id="edit-last-price">
        <select id="edit-currency"></select>
        <span id="edit-total-value"></span>
      </div>
    </div>`;
  const dom = new JSDOM(html, {url: 'http://localhost'});
  dom.window.fetch = jest.fn().mockResolvedValue({ json: () => Promise.resolve({ c: 1, currency: 'USD' }) });
  const context = vm.createContext(dom.window);
  let pm = fs.readFileSync(path.resolve(__dirname, '../app/js/portfolioManager.js'), 'utf8');
  pm = pm.replace(
    'return { init, fetchQuote, fetchLastPrices, exportData, importData, deleteAllData, updatePortfolioPrices };',
    'window.__setInvestments = arr => { investments = arr; }; window.__openEditModal = openEditModal; return { init, fetchQuote, fetchLastPrices, exportData, importData, deleteAllData, updatePortfolioPrices };'
  );
  vm.runInContext(pm, context);
  vm.runInContext('__setInvestments([{ ticker: "AAA", name: "Test", quantity: 1, purchasePrice: 1, lastPrice: 1, tradeDate: "2024-01-01", currency: "USD" }])', context);
  vm.runInContext('__openEditModal(0)', context);
  expect(dom.window.document.activeElement.id).toBe('edit-name');
});

test('Add Portfolio prompt focuses text input when opened', () => {
  const html = `<!DOCTYPE html><html><body>
    <div id="dialog-modal" class="modal">
      <div class="modal-content">
        <span id="dialog-close">&times;</span>
        <p id="dialog-message"></p>
        <div id="dialog-input-group" class="form-group">
          <input type="text" id="dialog-input">
        </div>
        <button id="dialog-cancel">No</button>
        <button id="dialog-ok">Yes</button>
      </div>
    </div>`;
  const dom = new JSDOM(html, {url: 'http://localhost'});
  const context = vm.createContext(dom.window);
  const dm = fs.readFileSync(path.resolve(__dirname, '../app/js/dialogManager.js'), 'utf8');
  vm.runInContext(dm, context);
  vm.runInContext('DialogManager.prompt("Enter portfolio name:")', context);
  expect(dom.window.document.activeElement.id).toBe('dialog-input');
});

test('fetchLastPrices updates multiple portfolios', async () => {
  const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {url: 'http://localhost'});
  const { window } = dom;
  const ids = [
    'add-investment-btn','get-last-price-btn','add-portfolio-btn','remove-portfolio-btn','portfolio-tabs',
    'investment-modal','investment-form','investment-ticker','investment-close','cancel-investment-btn','save-add-another-btn','investment-total-value',
    'edit-investment-modal','edit-investment-form','edit-investment-close','edit-cancel-btn','edit-record-group','edit-record-select','edit-total-value',
    'transaction-history-btn','transaction-history-modal','transaction-history-close','transaction-history-body','portfolio-menu-toggle','portfolio-actions-menu','summary-toggle',
    'portfolio-body','portfolio-total-value','portfolio-total-pl','portfolio-total-plpct','portfolio-base-currency-label','investment-spread-chart','plpct-chart'
  ];
  ids.forEach(id => { const el = window.document.createElement(id.includes('chart') ? 'canvas' : 'div'); el.id = id; window.document.body.appendChild(el); });

  const context = vm.createContext(window);
  context.Chart = function() { this.data={labels:[],datasets:[{data:[]}]}; this.options={plugins:{tooltip:{callbacks:{}},title:{},legend:{}}}; this.update=() => {}; };
  context.Settings = { getBaseCurrency: () => 'USD' };
  context.ForexData = { getRates: () => Promise.resolve({ conversion_rates: { USD: 1 } }) };
  window.HTMLCanvasElement.prototype.getContext = () => ({
    fillRect: () => {},
    clearRect: () => {},
    getContext: () => ({})
  });

  window.fetch = jest.fn(url => {
    if (url.includes('AAA')) {
      return Promise.resolve({ json: () => Promise.resolve({ c: 111, currency: 'USD' }) });
    }
    return Promise.resolve({ json: () => Promise.resolve({ c: 222, currency: 'USD' }) });
  });

  window.localStorage.setItem('portfolioList', JSON.stringify([
    { id: 'pf1', name: 'One', show: true },
    { id: 'pf2', name: 'Two', show: true }
  ]));
  window.localStorage.setItem('portfolioData_pf1', JSON.stringify([{ ticker: 'AAA', quantity: 1, purchasePrice: 1, lastPrice: 1, tradeDate: '2024-05-01', currency: 'USD' }]));
  window.localStorage.setItem('portfolioData_pf2', JSON.stringify([{ ticker: 'BBB', quantity: 1, purchasePrice: 1, lastPrice: 1, tradeDate: '2024-05-01', currency: 'USD' }]));

  const pmCode = fs.readFileSync(path.resolve(__dirname, '../app/js/portfolioManager.js'), 'utf8');
  vm.runInContext(pmCode, context);
  vm.runInContext('PortfolioManager.init()', context);
  await vm.runInContext('PortfolioManager.fetchLastPrices()', context);

  const pf1 = JSON.parse(window.localStorage.getItem('portfolioData_pf1'));
  const pf2 = JSON.parse(window.localStorage.getItem('portfolioData_pf2'));
  expect(pf1[0].lastPrice).toBe(111);
  expect(pf2[0].lastPrice).toBe(222);
});

test('computeStats includes payments in total percent', () => {
  const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', { url: 'http://localhost' });
  const context = vm.createContext(dom.window);
  let pmCode = fs.readFileSync(path.resolve(__dirname, '../app/js/pensionManager.js'), 'utf8');
  pmCode = pmCode.replace(
    'return { init, exportData, importData, deleteAllData };',
    'window.__setData = (p, e, id) => { pensions = p; entries = e; currentPensionId = id; summaryMode = false; }; window.__computeStats = computeStats; return { init, exportData, importData, deleteAllData };'
  );
  vm.runInContext(pmCode, context);
  vm.runInContext('__setData(' +
    JSON.stringify([{ id: "pen1", name: "Test", type: "payments", start: 0 }]) + ', ' +
    JSON.stringify([
      { date: "2024-01-01", value: 100, payment: 100 },
      { date: "2024-02-01", value: 220, payment: 100 }
    ]) + ', "pen1")', context);
  const stats = vm.runInContext('__computeStats()', context);
  expect(stats[1].totalPLPct).toBeCloseTo(10);
});

test('computeStats returns cumulative payments', () => {
  const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', { url: 'http://localhost' });
  const context = vm.createContext(dom.window);
  let pmCode = fs.readFileSync(path.resolve(__dirname, '../app/js/pensionManager.js'), 'utf8');
  pmCode = pmCode.replace(
    'return { init, exportData, importData, deleteAllData };',
    'window.__setData = (p, e, id) => { pensions = p; entries = e; currentPensionId = id; summaryMode = false; }; window.__computeStats = computeStats; return { init, exportData, importData, deleteAllData };'
  );
  vm.runInContext(pmCode, context);
  vm.runInContext('__setData(' +
    JSON.stringify([{ id: "pen1", name: "Test", type: "payments", start: 0 }]) + ', ' +
    JSON.stringify([
      { date: "2024-01-01", value: 100, payment: 100 },
      { date: "2024-02-01", value: 220, payment: 50 }
    ]) + ', "pen1")', context);
  const stats = vm.runInContext('__computeStats()', context);
  expect(stats[0].totalPayments).toBe(100);
  expect(stats[1].totalPayments).toBe(150);
});

test('Pension growth chart calculates percentage data', () => {
  const html = `<!DOCTYPE html><html><body>
    <div id="pension-chart-popup" class="modal">
      <div class="modal-content">
        <div class="chart-control-panel">
          <div class="chart-type">
            <input type="radio" id="pension-chart-type-value" name="pension-chart-type" value="value">
            <input type="radio" id="pension-chart-type-growth" name="pension-chart-type" value="growth">
          </div>
          <div id="pension-chart-select"></div>
        </div>
        <canvas id="pension-chart-canvas"></canvas>
      </div>
    </div>`;
  const dom = new JSDOM(html, { url: 'http://localhost' });
  const { window } = dom;
  const context = vm.createContext(window);
  window.HTMLCanvasElement.prototype.getContext = () => ({}) ;
  context.Chart = function(ctx, opts) { window.chartOptions = opts; this.destroy = () => {}; };
  context.DateUtils = { formatDate: d => d };
  let pmCode = fs.readFileSync(path.resolve(__dirname, '../app/js/pensionManager.js'), 'utf8');
  pmCode = pmCode.replace(
    'return { init, exportData, importData, deleteAllData };',
    'window.__setData = (p, e, id) => { pensions = p; entries = e; currentPensionId = id; summaryMode = false; }; window.__showChart = showChart; return { init, exportData, importData, deleteAllData };'
  );
  vm.runInContext(pmCode, context);
  window.localStorage.setItem('pensionData_pen1', JSON.stringify([
    { date: '2024-01-01', value: 100 },
    { date: '2024-02-01', value: 120 }
  ]));
  vm.runInContext('__setData(' + JSON.stringify([{ id: "pen1", name: "P1", type: "growth", start: 100 }]) + ', [], "pen1")', context);
  vm.runInContext('__showChart()', context);
  window.document.getElementById('pension-chart-type-growth').checked = true;
  window.document.getElementById('pension-chart-type-growth').dispatchEvent(new window.Event('change'));
  const data = window.chartOptions.data.datasets[0].data;
  expect(data[0]).toBe(0);
  expect(data[1]).toBeCloseTo(20);
  expect(window.chartOptions.options.scales.y.ticks.callback(10)).toBe('10%');
});

test('Pension growth chart shows multiple pensions', () => {
  const html = `<!DOCTYPE html><html><body>
    <div id="pension-chart-popup" class="modal">
      <div class="modal-content">
        <div class="chart-control-panel">
          <div class="chart-type">
            <input type="radio" id="pension-chart-type-value" name="pension-chart-type" value="value">
            <input type="radio" id="pension-chart-type-growth" name="pension-chart-type" value="growth">
          </div>
          <div id="pension-chart-select"></div>
        </div>
        <canvas id="pension-chart-canvas"></canvas>
      </div>
    </div>`;
  const dom = new JSDOM(html, { url: 'http://localhost' });
  const { window } = dom;
  const context = vm.createContext(window);
  window.HTMLCanvasElement.prototype.getContext = () => ({}) ;
  context.Chart = function(ctx, opts) { window.chartOptions = opts; this.destroy = () => {}; };
  context.DateUtils = { formatDate: d => d };
  let pmCode = fs.readFileSync(path.resolve(__dirname, '../app/js/pensionManager.js'), 'utf8');
  pmCode = pmCode.replace(
    'return { init, exportData, importData, deleteAllData };',
    'window.__setData = (p, e, id) => { pensions = p; entries = e; currentPensionId = id; summaryMode = false; }; window.__showChart = showChart; return { init, exportData, importData, deleteAllData };'
  );
  vm.runInContext(pmCode, context);
  window.localStorage.setItem('pensionData_pen1', JSON.stringify([
    { date: '2024-01-01', value: 100 },
    { date: '2024-02-01', value: 120 }
  ]));
  window.localStorage.setItem('pensionData_pen2', JSON.stringify([
    { date: '2024-01-01', value: 50 },
    { date: '2024-02-01', value: 60 }
  ]));
  vm.runInContext('__setData(' + JSON.stringify([
    { id: "pen1", name: "P1", type: "growth", start: 100 },
    { id: "pen2", name: "P2", type: "payments", start: 0 }
  ]) + ', [], "pen1")', context);
  vm.runInContext('__showChart()', context);
  const cb2 = window.document.querySelector('#pension-chart-select input[value="pen2"]');
  cb2.checked = true;
  cb2.dispatchEvent(new window.Event('change'));
  window.document.getElementById('pension-chart-type-growth').checked = true;
  window.document.getElementById('pension-chart-type-growth').dispatchEvent(new window.Event('change'));
  const sets = window.chartOptions.data.datasets;
  expect(sets.length).toBe(2);
  expect(sets[1].data[0]).toBe(0);
  expect(sets[1].data[1]).toBeCloseTo(20);
});
