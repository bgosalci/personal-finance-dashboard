const fs = require('fs');
const path = require('path');
const {JSDOM} = require('jsdom');
const vm = require('vm');
const i18nCode = fs.readFileSync(path.resolve(__dirname, '../app/js/i18n.js'), 'utf8');

test('FinancialDashboard global object exists with init and removeTicker', () => {
  const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {url: 'http://localhost'});
  dom.window.document.addEventListener = () => {};
  const context = vm.createContext(dom.window);
  vm.runInContext(i18nCode, context);
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

test('I18n falls back to embedded locale when fetch unavailable', async () => {
  const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {url: 'http://localhost'});
  const context = vm.createContext(dom.window);
  context.location = { protocol: 'file:' };
  vm.runInContext(i18nCode, context);
  await vm.runInContext('I18n.setLocale("en")', context);
  const title = vm.runInContext('I18n.t("header.title")', context);
  expect(title).toBe('Financial Dashboard');
});

test('fetchQuote returns price and currency', async () => {
  const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {url: 'http://localhost'});
  const context = vm.createContext(dom.window);
  vm.runInContext(i18nCode, context);
  dom.window.fetch = jest.fn().mockResolvedValue({
    json: () => Promise.resolve({ c: 123.45, currency: 'EUR' })
  });
  const content = fs.readFileSync(path.resolve(__dirname, '../app/js/portfolioManager.js'), 'utf8');
  vm.runInContext(content, context);
  const result = await vm.runInContext('PortfolioManager.fetchQuote("TEST")', context);
  expect(result).toEqual({ price: 123.45, currency: 'EUR' });
});

test('fetchQuote caches access error for one day', async () => {
  const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {url: 'http://localhost'});
  const fetchMock = jest.fn()
    .mockResolvedValueOnce({ json: () => Promise.resolve({ error: "You don't have access to this resource." }) })
    .mockResolvedValue({ json: () => Promise.resolve({ c: 200, currency: 'USD' }) });
  dom.window.fetch = fetchMock;
  const context = vm.createContext(dom.window);
  vm.runInContext(i18nCode, context);
  const content = fs.readFileSync(path.resolve(__dirname, '../app/js/portfolioManager.js'), 'utf8');
  vm.runInContext(content, context);
  const first = await vm.runInContext('PortfolioManager.fetchQuote("VUSA.L")', context);
  expect(first).toEqual({ price: null, currency: 'USD' });
  expect(fetchMock).toHaveBeenCalledTimes(1);
  const second = await vm.runInContext('PortfolioManager.fetchQuote("VUSA.L")', context);
  expect(second).toEqual({ price: null, currency: 'USD' });
  expect(fetchMock).toHaveBeenCalledTimes(1);
});

test('Settings module saves currency to localStorage', () => {
  const html = '<!DOCTYPE html><html><body>' +
    '<select id="base-currency-select"></select>' +
    '<span id="app-version"></span>' +
    '</body></html>';
  const dom = new JSDOM(html, {url: 'http://localhost'});
  const { window } = dom;
  const context = vm.createContext(window);
  vm.runInContext(i18nCode, context);
  const verCode = fs.readFileSync(path.resolve(__dirname, '../app/js/appVersion.js'), 'utf8');
  vm.runInContext(verCode, context);
  const content = fs.readFileSync(path.resolve(__dirname, '../app/js/settings.js'), 'utf8');
  vm.runInContext(content, context);
  vm.runInContext('Settings.init()', context);
  vm.runInContext('document.getElementById("base-currency-select").value = "GBP"; document.getElementById("base-currency-select").dispatchEvent(new window.Event("change"));', context);
  expect(window.localStorage.getItem('pf_base_currency')).toBe('GBP');
  expect(window.document.getElementById('app-version').textContent).toBe('1.2.1');
});

test('Finnhub API key visibility toggle', () => {
  const html = '<!DOCTYPE html><html><body>' +
    '<input type="password" id="settings-finnhub-api-key">' +
    '<input type="checkbox" id="settings-finnhub-api-key-toggle">' +
    '</body></html>';
  const dom = new JSDOM(html, {url: 'http://localhost'});
  const { window } = dom;
  const context = vm.createContext(window);
  vm.runInContext(i18nCode, context);
  const content = fs.readFileSync(path.resolve(__dirname, '../app/js/settings.js'), 'utf8');
  vm.runInContext(content, context);
  vm.runInContext('Settings.init()', context);
  expect(window.document.getElementById('settings-finnhub-api-key').type).toBe('password');
  window.document.getElementById('settings-finnhub-api-key-toggle').checked = true;
  window.document.getElementById('settings-finnhub-api-key-toggle').dispatchEvent(new window.Event('change'));
  expect(window.document.getElementById('settings-finnhub-api-key').type).toBe('text');
});

test('DateUtils.formatDate formats date correctly', () => {
  const context = vm.createContext({});
  vm.runInContext(i18nCode, context);
  const content = fs.readFileSync(path.resolve(__dirname, '../app/js/dateUtils.js'), 'utf8');
  vm.runInContext(content, context);
  const result = vm.runInContext('DateUtils.formatDate("2024-05-01")', context);
  const expected = new Intl.DateTimeFormat('en', { year: 'numeric', month: 'numeric', day: 'numeric' }).format(new Date('2024-05-01'));
  expect(result).toBe(expected);
});

test('pension summary tab updates translation on locale change', async () => {
  const html = '<!DOCTYPE html><html><body>' +
    '<div id="pension-tabs"></div>' +
    '<button id="add-pension-btn"></button>' +
    '<button id="remove-pension-btn"></button>' +
    '<button id="add-pension-entry-btn"></button>' +
    '<input type="checkbox" id="pension-summary-toggle">' +
    '<table id="pension-table"><thead><tr><th class="payment-col"></th><th class="total-payment-col"></th></tr></thead></table>' +
    '</body></html>';
  const dom = new JSDOM(html, { url: 'http://localhost' });
  const context = vm.createContext(dom.window);
  vm.runInContext(i18nCode, context);
  let penCode = fs.readFileSync(path.resolve(__dirname, '../app/js/pensionManager.js'), 'utf8');
  penCode = penCode.replace(
    'return { init, exportData, importData, deleteAllData };',
    'window.__renderTabs=renderTabs; return { init, exportData, importData, deleteAllData };'
  );
  vm.runInContext(penCode, context);
  await vm.runInContext('I18n.setLocale("en")', context);
  context.__renderTabs();
  const btn = dom.window.document.querySelector('#pension-tabs button');
  expect(btn.textContent).toBe('Summary');
  await vm.runInContext('I18n.setLocale("fr")', context);
  expect(btn.textContent).toBe('Résumé');
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
  vm.runInContext(i18nCode, context);
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
  vm.runInContext(i18nCode, context);
  const dm = fs.readFileSync(path.resolve(__dirname, '../app/js/dialogManager.js'), 'utf8');
  vm.runInContext(dm, context);
  vm.runInContext('DialogManager.prompt(I18n.t("dialog.enterPortfolioName"))', context);
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
  vm.runInContext(i18nCode, context);
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
  vm.runInContext(i18nCode, context);
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
  vm.runInContext(i18nCode, context);
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

test('initial tabs highlight only selected portfolio and pension', () => {
  const html = '<!DOCTYPE html><html><body>' +
    '<div id="portfolio-tabs"></div>' +
    '<div id="pension-tabs"></div>' +
    '</body></html>';
  const dom = new JSDOM(html, { url: 'http://localhost' });
  const context = vm.createContext(dom.window);
  vm.runInContext(i18nCode, context);

  let pmCode = fs.readFileSync(path.resolve(__dirname, '../app/js/portfolioManager.js'), 'utf8');
  pmCode = pmCode.replace(
    'return { init, fetchQuote, fetchLastPrices, exportData, importData, deleteAllData, updatePortfolioPrices };',
    'window.__setPortfolios=(p,id,s)=>{ portfolios=p; currentPortfolioId=id; summaryMode=s; }; window.__renderPortfolioTabs=renderPortfolioTabs; return { init, fetchQuote, fetchLastPrices, exportData, importData, deleteAllData, updatePortfolioPrices };'
  );
  vm.runInContext(pmCode, context);

  let penCode = fs.readFileSync(path.resolve(__dirname, '../app/js/pensionManager.js'), 'utf8');
  penCode = penCode.replace(
    'return { init, exportData, importData, deleteAllData };',
    'window.__setPensions=(p,id,s)=>{ pensions=p; currentPensionId=id; summaryMode=s; }; window.__renderPensionTabs=renderTabs; return { init, exportData, importData, deleteAllData };'
  );
  vm.runInContext(penCode, context);

  vm.runInContext('__setPortfolios([{id:"pf1",name:"One"},{id:"pf2",name:"Two"}],"pf1",false); __renderPortfolioTabs();', context);
  vm.runInContext('__setPensions([{id:"pen1",name:"A"},{id:"pen2",name:"B"}],"pen1",false); __renderPensionTabs();', context);

  const doc = dom.window.document;
  const pfActive = doc.querySelectorAll('#portfolio-tabs button.active');
  const penActive = doc.querySelectorAll('#pension-tabs button.active');

  expect(pfActive.length).toBe(1);
  expect(pfActive[0].dataset.id).toBe('pf1');
  expect(penActive.length).toBe(1);
  expect(penActive[0].dataset.id).toBe('pen1');
});

test('selecting portfolio summary does not change active pension tab', () => {
  const html = '<!DOCTYPE html><html><body>' +
    '<div id="portfolio-tabs"></div>' +
    '<div id="pension-tabs"></div>' +
    '</body></html>';
  const dom = new JSDOM(html, { url: 'http://localhost' });
  const context = vm.createContext(dom.window);
  vm.runInContext(i18nCode, context);

  let pmCode = fs.readFileSync(path.resolve(__dirname, '../app/js/portfolioManager.js'), 'utf8');
  pmCode = pmCode.replace(
    'return { init, fetchQuote, fetchLastPrices, exportData, importData, deleteAllData, updatePortfolioPrices };',
    'window.__setPortfolios=(p,id,s)=>{ portfolios=p; currentPortfolioId=id; summaryMode=s; }; window.__renderPortfolioTabs=renderPortfolioTabs; return { init, fetchQuote, fetchLastPrices, exportData, importData, deleteAllData, updatePortfolioPrices };'
  );
  vm.runInContext(pmCode, context);

  let penCode = fs.readFileSync(path.resolve(__dirname, '../app/js/pensionManager.js'), 'utf8');
  penCode = penCode.replace(
    'return { init, exportData, importData, deleteAllData };',
    'window.__setPensions=(p,id,s)=>{ pensions=p; currentPensionId=id; summaryMode=s; }; window.__renderPensionTabs=renderTabs; return { init, exportData, importData, deleteAllData };'
  );
  vm.runInContext(penCode, context);

  vm.runInContext('__setPortfolios([{id:"pf1",name:"One"},{id:"pf2",name:"Two"}],"pf1",false); __renderPortfolioTabs();', context);
  vm.runInContext('__setPensions([{id:"pen1",name:"A"},{id:"pen2",name:"B"}],"pen1",false); __renderPensionTabs();', context);

  vm.runInContext('__setPortfolios([{id:"pf1",name:"One"},{id:"pf2",name:"Two"}],"pf1",true); __renderPortfolioTabs();', context);

  const doc = dom.window.document;
  const pfActive = doc.querySelectorAll('#portfolio-tabs button.active');
  const penActive = doc.querySelectorAll('#pension-tabs button.active');

  expect(pfActive.length).toBe(1);
  expect(pfActive[0].dataset.id).toBe('summary');
  expect(penActive.length).toBe(1);
  expect(penActive[0].dataset.id).toBe('pen1');
});

test('StockTracker export and import cycle', () => {
  const html = '<!DOCTYPE html><html><body>' +
    '<select id="start-year"></select>' +
    '<div id="ticker-tags"></div>' +
    '</body></html>';
  const dom = new JSDOM(html, { url: 'http://localhost' });
  const context = vm.createContext(dom.window);
  vm.runInContext(i18nCode, context);
  const code = fs.readFileSync(path.resolve(__dirname, '../app/js/stockTracker.js'), 'utf8');
  vm.runInContext(code, context);
  vm.runInContext('stockData = { tickers:["AAA"], startYear:2020, prices:{AAA:{2020:10}} }; localStorage.setItem("stockTrackerData", JSON.stringify(stockData));', context);
  const csv = vm.runInContext('StockTracker.exportData("csv")', context);
  vm.runInContext('StockTracker.deleteAllData()', context);
  expect(context.localStorage.getItem('stockTrackerData')).toBeNull();
  vm.runInContext(`StockTracker.importData(${JSON.stringify(csv)}, 'csv')`, context);
  expect(context.localStorage.getItem('stockTrackerData')).not.toBeNull();
});

test('StockTracker exposes fetchLatestPrices', () => {
  const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', { url: 'http://localhost' });
  const context = vm.createContext(dom.window);
  vm.runInContext(i18nCode, context);
  const code = fs.readFileSync(path.resolve(__dirname, '../app/js/stockTracker.js'), 'utf8');
  vm.runInContext(code, context);
  const fnType = vm.runInContext('typeof StockTracker.fetchLatestPrices', context);
  expect(fnType).toBe('function');
});
