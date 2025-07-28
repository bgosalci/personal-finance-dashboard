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
    'return { init, fetchQuote, fetchLastPrices, exportData, importData, deleteAllData };',
    'window.__setInvestments = arr => { investments = arr; }; window.__openEditModal = openEditModal; return { init, fetchQuote, fetchLastPrices, exportData, importData, deleteAllData };'
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
