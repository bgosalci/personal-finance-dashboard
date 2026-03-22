beforeEach(() => {
  jest.resetModules();
  global.StorageUtils = require('../app/js/core/storageUtils');
  localStorage.setItem('pf_api_key_polygon', 'test-key');
  document.body.innerHTML =
    '<div id="market-led"></div>' +
    '<span id="market-session"></span>' +
    '<div id="early-led"></div>' +
    '<span id="early-session"></span>' +
    '<div id="after-led"></div>' +
    '<span id="after-session"></span>';
  jest.spyOn(global, 'setInterval').mockReturnValue(1);
});

afterEach(() => {
  jest.restoreAllMocks();
});

test('isMarketOpen true during pre-market', async () => {
  global.fetch = jest.fn().mockResolvedValue({ json: () => Promise.resolve({ market: 'closed', earlyHours: true, afterHours: false }) });
  const MarketStatus = require('../app/js/services/marketStatus');
  MarketStatus.init();
  await new Promise(r => setTimeout(r, 0));
  expect(MarketStatus.isMarketOpen()).toBe(true);
});

test('isMarketOpen true during after-hours', async () => {
  global.fetch = jest.fn().mockResolvedValue({ json: () => Promise.resolve({ market: 'closed', earlyHours: false, afterHours: true }) });
  const MarketStatus = require('../app/js/services/marketStatus');
  MarketStatus.init();
  await new Promise(r => setTimeout(r, 0));
  expect(MarketStatus.isMarketOpen()).toBe(true);
});

test('isMarketOpen false when all sessions closed', async () => {
  global.fetch = jest.fn().mockResolvedValue({ json: () => Promise.resolve({ market: 'closed', earlyHours: false, afterHours: false }) });
  const MarketStatus = require('../app/js/services/marketStatus');
  MarketStatus.init();
  await new Promise(r => setTimeout(r, 0));
  expect(MarketStatus.isMarketOpen()).toBe(false);
});
