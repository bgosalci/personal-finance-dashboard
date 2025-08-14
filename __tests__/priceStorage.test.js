const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const vm = require('vm');

test('notifies handlers on save', () => {
  const dom = new JSDOM('<!DOCTYPE html><body></body>', { url: 'http://localhost' });
  const context = vm.createContext(dom.window);
  const util = fs.readFileSync(path.resolve(__dirname, '../app/js/storageUtils.js'), 'utf8');
  vm.runInContext(util, context);
  const code = fs.readFileSync(path.resolve(__dirname, '../app/js/priceStorage.js'), 'utf8');
  vm.runInContext(code, context);
  const spy = jest.fn();
  context.spy = spy;
  vm.runInContext('PriceStorage.onChange((t,d)=>spy(t,d));', context);
  vm.runInContext('PriceStorage.save("AAPL", 111);', context);
  expect(spy).toHaveBeenCalled();
  expect(spy.mock.calls[0][0]).toBe('AAPL');
  expect(spy.mock.calls[0][1].price).toBe(111);
});

test('falls back to memory storage when localStorage disabled', () => {
  const dom = new JSDOM('<!DOCTYPE html><body></body>', { url: 'http://localhost' });
  const context = vm.createContext(dom.window);
  const util = fs.readFileSync(path.resolve(__dirname, '../app/js/storageUtils.js'), 'utf8');
  vm.runInContext(util, context);
  // disable localStorage
  Object.defineProperty(context, 'localStorage', { value: null, configurable: true });
  const code = fs.readFileSync(path.resolve(__dirname, '../app/js/priceStorage.js'), 'utf8');
  vm.runInContext(code, context);
  vm.runInContext('PriceStorage.save("AAPL", 123);', context);
  const price = vm.runInContext('PriceStorage.get("AAPL").price;', context);
  expect(price).toBe(123);
});
