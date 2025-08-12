const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const vm = require('vm');

function loadMarketStatus(response) {
  const html = '<!DOCTYPE html><html><body>' +
    '<div id="market-led"></div>' +
    '<span id="market-session"></span>' +
    '<div id="early-led"></div>' +
    '<span id="early-session"></span>' +
    '<div id="after-led"></div>' +
    '<span id="after-session"></span>' +
    '</body></html>';
  const dom = new JSDOM(html, { url: 'http://localhost' });
  const context = vm.createContext(dom.window);
  dom.window.fetch = jest.fn().mockResolvedValue({ json: () => Promise.resolve(response) });
  dom.window.setInterval = () => {};
  const code = fs.readFileSync(path.resolve(__dirname, '../app/js/marketStatus.js'), 'utf8');
  vm.runInContext(code, context);
  return context;
}

test('isMarketOpen true during pre-market', async () => {
  const context = loadMarketStatus({ market: 'closed', earlyHours: true, afterHours: false });
  vm.runInContext('MarketStatus.init();', context);
  await new Promise(r => setTimeout(r, 0));
  const result = vm.runInContext('MarketStatus.isMarketOpen()', context);
  expect(result).toBe(true);
});

test('isMarketOpen true during after-hours', async () => {
  const context = loadMarketStatus({ market: 'closed', earlyHours: false, afterHours: true });
  vm.runInContext('MarketStatus.init();', context);
  await new Promise(r => setTimeout(r, 0));
  const result = vm.runInContext('MarketStatus.isMarketOpen()', context);
  expect(result).toBe(true);
});

test('isMarketOpen false when all sessions closed', async () => {
  const context = loadMarketStatus({ market: 'closed', earlyHours: false, afterHours: false });
  vm.runInContext('MarketStatus.init();', context);
  await new Promise(r => setTimeout(r, 0));
  const result = vm.runInContext('MarketStatus.isMarketOpen()', context);
  expect(result).toBe(false);
});
