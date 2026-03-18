beforeEach(() => {
  jest.resetModules();
  localStorage.clear();
  global.StorageUtils = require('../app/js/core/storageUtils');
});
describe('StorageManager compression utilities', () => {
  test('compress and decompress preserve data with digits and repeats', () => {
    jest.useFakeTimers();
    const StorageManager = require('../app/js/core/storageManager');
    // Data with repeated chars and digits tests RLE compression round-trip
    const added = StorageManager.addPortfolioPosition({
      symbol: 'AA11BB22', quantity: 12345, purchase_price_per_share: 9.99
    });
    expect(added).toBe(true);
    jest.runAllTimers(); // flush debounced save

    // Fresh module reload reads from localStorage via decompress
    jest.resetModules();
    global.StorageUtils = require('../app/js/core/storageUtils');
    const StorageManager2 = require('../app/js/core/storageManager');
    const positions = StorageManager2.getPortfolioPositions();
    expect(positions[0].symbol).toBe('AA11BB22');
    expect(positions[0].quantity).toBe(12345);
    jest.useRealTimers();
  });
});

describe('StorageManager CRUD operations', () => {
  test('add, update, and delete positions with digit-rich data', () => {
    const StorageManager = require('../app/js/core/storageManager');
    const added = StorageManager.addPortfolioPosition({ symbol: 'A1PL', quantity: 10, purchase_price_per_share: 123.45 });
    expect(added).toBe(true);
    let positions = StorageManager.getPortfolioPositions();
    expect(positions).toHaveLength(1);
    const id = positions[0].id;
    const updated = StorageManager.updatePosition(id, { quantity: 20, purchase_price_per_share: 150.5 });
    expect(updated).toBe(true);
    positions = StorageManager.getPortfolioPositions();
    expect(positions[0].quantity).toBe(20);
    const deleted = StorageManager.deletePosition(id);
    expect(deleted).toBe(true);
    positions = StorageManager.getPortfolioPositions();
    expect(positions).toHaveLength(0);
  });
});
