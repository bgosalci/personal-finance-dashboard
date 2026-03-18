let FakeWebSocket;

beforeEach(() => {
  jest.resetModules();
  localStorage.clear();

  document.body.innerHTML = '<table><tbody id="watchlist-body"></tbody></table>';

  class _FakeWebSocket {
    constructor(url) {
      this.url = url;
      this.listeners = {};
      _FakeWebSocket.instances.push(this);
    }
    addEventListener(type, cb) { this.listeners[type] = cb; }
    send() {}
    close() {}
  }
  _FakeWebSocket.instances = [];
  FakeWebSocket = _FakeWebSocket;
  global.WebSocket = FakeWebSocket;

  global.QuotesService = { getApiKey: () => 'TOKEN', fetchQuote: jest.fn() };
  global.I18n = { t: k => k };
  global.StorageUtils = require('../app/js/core/storageUtils');
  global.PriceStorage = require('../app/js/data/priceStorage');
});

afterEach(() => {
  jest.restoreAllMocks();
});

test('stores websocket price updates in localStorage', () => {
  localStorage.setItem('watchlistData', JSON.stringify([{ ticker: 'AAPL' }]));
  const WatchlistManager = require('../app/js/features/watchlistManager');
  WatchlistManager.init();
  const ws = FakeWebSocket.instances[0];
  ws.listeners.message({ data: JSON.stringify({ type: 'trade', data: [{ s: 'AAPL', p: 123.45 }] }) });
  expect(PriceStorage.getAll().AAPL.price).toBe(123.45);
  const lastUpdate = JSON.parse(localStorage.getItem('watchlistData'))[0].lastUpdate;
  expect(typeof lastUpdate).toBe('number');
});

test('uses exponential backoff for reconnect attempts', () => {
  localStorage.setItem('watchlistData', JSON.stringify([{ ticker: 'AAPL' }]));
  const delays = [];
  jest.spyOn(global, 'setTimeout').mockImplementation((fn, delay) => { delays.push(delay); return 1; });
  jest.spyOn(global, 'clearTimeout').mockImplementation(() => {});
  const WatchlistManager = require('../app/js/features/watchlistManager');
  WatchlistManager.init();
  const ws = FakeWebSocket.instances[0];
  ws.listeners.close();
  ws.listeners.close();
  expect(delays[0]).toBe(5000);
  expect(delays[1]).toBe(10000);
});

test('beforeunload closes socket', () => {
  localStorage.setItem('watchlistData', JSON.stringify([{ ticker: 'AAPL' }]));
  const closeSpy = jest.spyOn(FakeWebSocket.prototype, 'close');
  const WatchlistManager = require('../app/js/features/watchlistManager');
  WatchlistManager.init();
  window.dispatchEvent(new Event('beforeunload'));
  expect(closeSpy).toHaveBeenCalled();
});

test('beforeunload clears reconnect timer', () => {
  localStorage.setItem('watchlistData', JSON.stringify([{ ticker: 'AAPL' }]));
  jest.spyOn(global, 'setTimeout').mockReturnValue(1);
  const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout').mockImplementation(() => {});
  const WatchlistManager = require('../app/js/features/watchlistManager');
  WatchlistManager.init();
  const ws = FakeWebSocket.instances[0];
  ws.listeners.close();
  window.dispatchEvent(new Event('beforeunload'));
  expect(clearTimeoutSpy).toHaveBeenCalledWith(1);
});

test('flashes and persists background colour on price updates', async () => {
  localStorage.setItem('watchlistData', JSON.stringify([{ ticker: 'AAPL', price: 110, prevClose: 100, change: 10 }]));
  const WatchlistManager = require('../app/js/features/watchlistManager');
  WatchlistManager.init();
  const ws = FakeWebSocket.instances[0];
  ws.listeners.message({ data: JSON.stringify({ type: 'trade', data: [{ s: 'AAPL', p: 108 }] }) });
  const during = document.querySelector('#watchlist-body tr td:nth-child(4)').style.backgroundColor;
  expect(during).toBe('rgba(239, 68, 68, 0.35)');
  await new Promise(res => setTimeout(res, 1100));
  const after = document.querySelector('#watchlist-body tr td:nth-child(4)').style.backgroundColor;
  expect(after).toBe('rgb(55, 65, 81)');
});

test('renders range when high and low are available', () => {
  localStorage.setItem('watchlistData', JSON.stringify([{ ticker: 'AAPL', high: 150, low: 140 }]));
  const WatchlistManager = require('../app/js/features/watchlistManager');
  WatchlistManager.init();
  const text = document.querySelector('#watchlist-body tr td:nth-child(9)').textContent;
  expect(text).toBe('10.00');
  const sortVal = document.querySelector('#watchlist-body tr td:nth-child(9)').getAttribute('data-sort-value');
  expect(sortVal).toBe('10');
});

test('uses em dash and disables sorting when range unavailable', () => {
  localStorage.setItem('watchlistData', JSON.stringify([{ ticker: 'AAPL', high: 150 }]));
  const WatchlistManager = require('../app/js/features/watchlistManager');
  WatchlistManager.init();
  const text = document.querySelector('#watchlist-body tr td:nth-child(9)').textContent;
  expect(text).toBe('—');
  const hasAttr = document.querySelector('#watchlist-body tr td:nth-child(9)').hasAttribute('data-sort-value');
  expect(hasAttr).toBe(false);
});
