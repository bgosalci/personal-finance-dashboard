const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const vm = require('vm');

function loadContext() {
  const dom = new JSDOM('<!DOCTYPE html><body></body>', { url: 'http://localhost' });
  const context = vm.createContext(dom.window);
  const utils = fs.readFileSync(path.resolve(__dirname, '../app/js/storageUtils.js'), 'utf8');
  vm.runInContext(utils, context);
  let code = fs.readFileSync(path.resolve(__dirname, '../app/js/storageManager.js'), 'utf8');
  code = code.replace('};\n})(typeof', '};\n  global.__sm = { compress, decompress };\n})(typeof');
  vm.runInContext(code, context);
  return context;
}

describe('StorageManager compression utilities', () => {
  test('compress and decompress preserve data with digits and repeats', () => {
    const ctx = loadContext();
    const sample = {
      num: 12345,
      text: 'AA11BB22',
      nested: { id: 'pos123', val: 'X1Y2' }
    };
    const compressed = ctx.__sm.compress(sample);
    const output = ctx.__sm.decompress(compressed);
    expect(output).toEqual(sample);
  });
});

describe('StorageManager CRUD operations', () => {
  test('add, update, and delete positions with digit-rich data', () => {
    const ctx = loadContext();
    const added = vm.runInContext('StorageManager.addPortfolioPosition({symbol:"A1PL", quantity:10, purchase_price_per_share:123.45});', ctx);
    expect(added).toBe(true);
    let positions = vm.runInContext('StorageManager.getPortfolioPositions();', ctx);
    expect(positions).toHaveLength(1);
    const id = positions[0].id;
    const updated = vm.runInContext(`StorageManager.updatePosition('${id}', {quantity:20, purchase_price_per_share:150.5});`, ctx);
    expect(updated).toBe(true);
    positions = vm.runInContext('StorageManager.getPortfolioPositions();', ctx);
    expect(positions[0].quantity).toBe(20);
    const deleted = vm.runInContext(`StorageManager.deletePosition('${id}');`, ctx);
    expect(deleted).toBe(true);
    positions = vm.runInContext('StorageManager.getPortfolioPositions();', ctx);
    expect(positions).toHaveLength(0);
  });
});
