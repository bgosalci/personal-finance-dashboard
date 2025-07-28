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
