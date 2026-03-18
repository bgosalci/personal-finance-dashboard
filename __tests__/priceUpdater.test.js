beforeEach(() => {
  jest.resetModules();
  jest.spyOn(global, 'setInterval').mockReturnValue(1);
});

afterEach(() => {
  jest.restoreAllMocks();
});

test('updates portfolio and stock tracker when market is open', () => {
  global.MarketStatus = { isMarketOpen: () => true };
  global.PortfolioManager = { fetchLastPrices: jest.fn() };
  global.WatchlistManager = { fetchLastPrices: jest.fn() };
  global.StockTracker = { fetchLatestPrices: jest.fn() };
  const PriceUpdater = require('../app/js/services/priceUpdater');
  PriceUpdater.init();
  expect(global.PortfolioManager.fetchLastPrices).toHaveBeenCalled();
  expect(global.StockTracker.fetchLatestPrices).toHaveBeenCalled();
});

test('does not update when market is closed', () => {
  global.MarketStatus = { isMarketOpen: () => false };
  global.PortfolioManager = { fetchLastPrices: jest.fn() };
  global.WatchlistManager = { fetchLastPrices: jest.fn() };
  global.StockTracker = { fetchLatestPrices: jest.fn() };
  const PriceUpdater = require('../app/js/services/priceUpdater');
  PriceUpdater.init();
  expect(global.PortfolioManager.fetchLastPrices).not.toHaveBeenCalled();
  expect(global.StockTracker.fetchLatestPrices).not.toHaveBeenCalled();
});
