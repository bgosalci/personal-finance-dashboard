const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const vm = require('vm');

test('uses memory storage when localStorage is unavailable', () => {
  const dom = new JSDOM('<!DOCTYPE html><body></body>', { url: 'http://localhost' });
  const context = vm.createContext(dom.window);
  const util = fs.readFileSync(path.resolve(__dirname, '../app/js/storageUtils.js'), 'utf8');
  vm.runInContext(util, context);
  Object.defineProperty(context, 'localStorage', { value: null, configurable: true });
  const code = fs.readFileSync(path.resolve(__dirname, '../app/js/storageManager.js'), 'utf8');
  vm.runInContext(code, context);
  const added = vm.runInContext('StorageManager.addPortfolioPosition({symbol:"AAPL", quantity:1, purchase_price_per_share:100});', context);
  expect(added).toBe(true);
  const positions = vm.runInContext('StorageManager.getPortfolioPositions();', context);
  expect(positions.length).toBe(1);
});
