const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const vm = require('vm');

function loadWatchlist() {
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
  window.localStorage.setItem('watchlistData', JSON.stringify([{ ticker: 'AAPL' }]));
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
