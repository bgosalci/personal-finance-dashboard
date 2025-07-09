const fs = require('fs');
const path = require('path');
const {JSDOM} = require('jsdom');
const vm = require('vm');

test('FinancialDashboard global object exists with init and removeTicker', () => {
  const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {url: 'http://localhost'});
  // prevent automatic init on DOMContentLoaded
  dom.window.document.addEventListener = () => {};
  const context = vm.createContext(dom.window);
  const scriptContent = fs.readFileSync(path.resolve(__dirname, '../app/js/script.js'), 'utf8');
  vm.runInContext(scriptContent, context);
  const fd = vm.runInContext('FinancialDashboard', context);
  expect(fd).toBeDefined();
  expect(typeof fd.init).toBe('function');
  expect(typeof fd.removeTicker).toBe('function');
});
