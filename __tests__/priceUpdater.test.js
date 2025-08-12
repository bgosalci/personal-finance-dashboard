const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const vm = require('vm');

function loadPriceUpdater(isOpen) {
  const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', { url: 'http://localhost' });
  const context = vm.createContext(dom.window);
  dom.window.MarketStatus = { isMarketOpen: () => isOpen };
  dom.window.PortfolioManager = { fetchLastPrices: jest.fn() };
  dom.window.WatchlistManager = { fetchLastPrices: jest.fn() };
  dom.window.StockTracker = { fetchLatestPrices: jest.fn() };
  dom.window.setInterval = () => {};
  const code = fs.readFileSync(path.resolve(__dirname, '../app/js/priceUpdater.js'), 'utf8');
  vm.runInContext(code, context);
  return context;
}

test('updates portfolio and stock tracker when market is open', () => {
  const context = loadPriceUpdater(true);
  vm.runInContext('PriceUpdater.init();', context);
  expect(context.PortfolioManager.fetchLastPrices).toHaveBeenCalled();
  expect(context.StockTracker.fetchLatestPrices).toHaveBeenCalled();
});

test('does not update when market is closed', () => {
  const context = loadPriceUpdater(false);
  vm.runInContext('PriceUpdater.init();', context);
  expect(context.PortfolioManager.fetchLastPrices).not.toHaveBeenCalled();
  expect(context.StockTracker.fetchLatestPrices).not.toHaveBeenCalled();
});
