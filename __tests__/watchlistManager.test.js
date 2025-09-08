const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const vm = require('vm');

function loadWatchlist(initialData = [{ ticker: 'AAPL' }]) {
  const dom = new JSDOM('<!DOCTYPE html><body><table><tbody id="watchlist-body"></tbody></table></body>', { url: 'http://localhost' });
  const { window } = dom;
  window.QuotesService = { getApiKey: () => 'TOKEN', fetchQuote: jest.fn() };
  window.I18n = { t: (k) => k };
  class FakeWebSocket {
    constructor(url) {
      this.url = url;
      this.listeners = {};
      FakeWebSocket.instances.push(this);
    }
    addEventListener(type, cb) { this.listeners[type] = cb; }
    send() {}
    close() {}
  }
  FakeWebSocket.instances = [];
  window.WebSocket = FakeWebSocket;
  window.localStorage.setItem('watchlistData', JSON.stringify(initialData));
  const context = vm.createContext(window);
  const utilCode = fs.readFileSync(path.resolve(__dirname, '../app/js/storageUtils.js'), 'utf8');
  const priceStorageCode = fs.readFileSync(path.resolve(__dirname, '../app/js/priceStorage.js'), 'utf8');
  const watchlistCode = fs.readFileSync(path.resolve(__dirname, '../app/js/watchlistManager.js'), 'utf8');
  vm.runInContext(utilCode, context);
  vm.runInContext(priceStorageCode, context);
  vm.runInContext(watchlistCode, context);
  return { context, FakeWebSocket };
}

test('stores websocket price updates in localStorage', () => {
  const { context, FakeWebSocket } = loadWatchlist();
  vm.runInContext('WatchlistManager.init();', context);
  const ws = FakeWebSocket.instances[0];
  ws.listeners.message({ data: JSON.stringify({ type: 'trade', data: [{ s: 'AAPL', p: 123.45 }] }) });
  const stored = vm.runInContext('PriceStorage.getAll()', context);
  expect(stored.AAPL.price).toBe(123.45);
  const lastUpdate = vm.runInContext('JSON.parse(localStorage.getItem("watchlistData"))[0].lastUpdate', context);
  expect(typeof lastUpdate).toBe('number');
});

test('uses exponential backoff for reconnect attempts', () => {
  const { context, FakeWebSocket } = loadWatchlist();
  const delays = [];
  context.setTimeout = jest.fn((fn, delay) => { delays.push(delay); return 1; });
  context.clearTimeout = jest.fn();
  vm.runInContext('WatchlistManager.init();', context);
  const ws = FakeWebSocket.instances[0];
  ws.listeners.close();
  ws.listeners.close();
  expect(delays[0]).toBe(5000);
  expect(delays[1]).toBe(10000);
});

test('beforeunload closes socket', () => {
  const { context, FakeWebSocket } = loadWatchlist();
  const closeSpy = jest.spyOn(FakeWebSocket.prototype, 'close');
  vm.runInContext('WatchlistManager.init();', context);
  context.dispatchEvent(new context.Event('beforeunload'));
  expect(closeSpy).toHaveBeenCalled();
});

test('beforeunload clears reconnect timer', () => {
  const { context, FakeWebSocket } = loadWatchlist();
  context.setTimeout = jest.fn(() => 1);
  const clearTimeoutSpy = jest.fn();
  context.clearTimeout = clearTimeoutSpy;
  vm.runInContext('WatchlistManager.init();', context);
  const ws = FakeWebSocket.instances[0];
  ws.listeners.close();
  context.dispatchEvent(new context.Event('beforeunload'));
  expect(clearTimeoutSpy).toHaveBeenCalledWith(1);
});

test('flashes and persists background colour on price updates', async () => {
  const initData = [{ ticker: 'AAPL', price: 110, prevClose: 100, change: 10 }];
  const { context, FakeWebSocket } = loadWatchlist(initData);
  vm.runInContext('WatchlistManager.init();', context);
  const ws = FakeWebSocket.instances[0];
  ws.listeners.message({ data: JSON.stringify({ type: 'trade', data: [{ s: 'AAPL', p: 108 }] }) });
  const during = vm.runInContext("document.querySelector('#watchlist-body tr td:nth-child(4)').style.backgroundColor", context);
  expect(during).toBe('rgba(239, 68, 68, 0.35)');
  await new Promise(res => setTimeout(res, 1100));
  const after = vm.runInContext("document.querySelector('#watchlist-body tr td:nth-child(4)').style.backgroundColor", context);
  expect(after).toBe('rgb(55, 65, 81)');
});

test('renders range when high and low are available', () => {
  const initData = [{ ticker: 'AAPL', high: 150, low: 140 }];
  const { context } = loadWatchlist(initData);
  vm.runInContext('WatchlistManager.init();', context);
  const text = vm.runInContext("document.querySelector('#watchlist-body tr td:nth-child(9)').textContent", context);
  expect(text).toBe('10.00');
  const sortVal = vm.runInContext("document.querySelector('#watchlist-body tr td:nth-child(9)').getAttribute('data-sort-value')", context);
  expect(sortVal).toBe('10');
});

test('uses em dash and disables sorting when range unavailable', () => {
  const initData = [{ ticker: 'AAPL', high: 150 }];
  const { context } = loadWatchlist(initData);
  vm.runInContext('WatchlistManager.init();', context);
  const text = vm.runInContext("document.querySelector('#watchlist-body tr td:nth-child(9)').textContent", context);
  expect(text).toBe('—');
  const hasAttr = vm.runInContext("document.querySelector('#watchlist-body tr td:nth-child(9)').hasAttribute('data-sort-value')", context);
  expect(hasAttr).toBe(false);
});
