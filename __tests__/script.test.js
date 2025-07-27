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
    'tabManager.js',
    'portfolioStorage.js',
    'currencyRates.js',
    'portfolioManager.js',
    'calculator.js',
    'stockTracker.js',
    'stockFinance.js',
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

test('CurrencyRates converts values to USD', async () => {
  const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {url: 'http://localhost'});
  const context = vm.createContext(dom.window);
  dom.window.fetch = jest.fn().mockResolvedValue({
    json: () => Promise.resolve({ quote: { GBP: 0.8 } })
  });
  const content = fs.readFileSync(path.resolve(__dirname, '../app/js/currencyRates.js'), 'utf8');
  vm.runInContext(content, context);
  await vm.runInContext('CurrencyRates.init()', context);
  const usd = vm.runInContext('CurrencyRates.convertToUSD(80, "GBP")', context);
  expect(usd).toBeCloseTo(100);
});
