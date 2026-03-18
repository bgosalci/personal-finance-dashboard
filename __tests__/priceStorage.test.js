beforeEach(() => {
  jest.resetModules();
  localStorage.clear();
  global.StorageUtils = require('../app/js/core/storageUtils');
});

afterEach(() => {
  jest.restoreAllMocks();
});

test('notifies handlers on save', () => {
  const PriceStorage = require('../app/js/data/priceStorage');
  const spy = jest.fn();
  PriceStorage.onChange(spy);
  PriceStorage.save('AAPL', 111);
  expect(spy).toHaveBeenCalled();
  expect(spy.mock.calls[0][0]).toBe('AAPL');
  expect(spy.mock.calls[0][1].price).toBe(111);
});

test('falls back to memory storage when localStorage disabled', () => {
  // Replace localStorage with a broken one so getStorage() returns memoryStorage
  const descriptor = Object.getOwnPropertyDescriptor(window, 'localStorage');
  Object.defineProperty(window, 'localStorage', {
    value: { setItem() { throw new Error('disabled'); } },
    configurable: true,
    writable: true
  });
  jest.resetModules();
  global.StorageUtils = require('../app/js/core/storageUtils');
  const PriceStorage = require('../app/js/data/priceStorage');
  PriceStorage.save('AAPL', 123);
  expect(PriceStorage.get('AAPL').price).toBe(123);
  // Restore original localStorage
  if (descriptor) Object.defineProperty(window, 'localStorage', descriptor);
});
