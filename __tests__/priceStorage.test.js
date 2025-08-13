const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const vm = require('vm');

test('notifies handlers on save', () => {
  const dom = new JSDOM('<!DOCTYPE html><body></body>', { url: 'http://localhost' });
  const context = vm.createContext(dom.window);
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
