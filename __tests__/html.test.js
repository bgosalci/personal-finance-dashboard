const fs = require('fs');
const path = require('path');
const {JSDOM} = require('jsdom');

test('index.html references CSS and JS', () => {
  const htmlPath = path.resolve(__dirname, '../app/index.html');
  const html = fs.readFileSync(htmlPath, 'utf8');
  const dom = new JSDOM(html);
  const doc = dom.window.document;
  expect(doc.querySelector('link[href="css/style.css"]')).not.toBeNull();
  expect(doc.querySelector('script[src="js/financialDashboard.js"]')).not.toBeNull();
});

test('stock chart popup includes chart controls', () => {
  const htmlPath = path.resolve(__dirname, '../app/index.html');
  const html = fs.readFileSync(htmlPath, 'utf8');
  const dom = new JSDOM(html);
  const doc = dom.window.document;
  expect(doc.getElementById('chart-type-price')).not.toBeNull();
  expect(doc.getElementById('chart-ticker-select')).not.toBeNull();
});

test('header contains market status indicator', () => {
  const htmlPath = path.resolve(__dirname, '../app/index.html');
  const html = fs.readFileSync(htmlPath, 'utf8');
  const dom = new JSDOM(html);
  const doc = dom.window.document;
  expect(doc.getElementById('market-led')).not.toBeNull();
  expect(doc.getElementById('market-session')).not.toBeNull();
  expect(doc.getElementById('early-led')).not.toBeNull();
  expect(doc.getElementById('after-led')).not.toBeNull();
});

test('portfolio table includes currency column', () => {
  const htmlPath = path.resolve(__dirname, '../app/index.html');
  const html = fs.readFileSync(htmlPath, 'utf8');
  const dom = new JSDOM(html);
  const doc = dom.window.document;
  const headers = Array.from(doc.querySelectorAll('#portfolio-table thead th')).map(th => th.textContent.trim());
  expect(headers).toContain('Currency');
});

test('investment forms allow selecting currency', () => {
  const htmlPath = path.resolve(__dirname, '../app/index.html');
  const html = fs.readFileSync(htmlPath, 'utf8');
  const dom = new JSDOM(html);
  const doc = dom.window.document;
  const addSelect = doc.getElementById('investment-currency');
  const editSelect = doc.getElementById('edit-currency');
  expect(addSelect.tagName).toBe('SELECT');
  expect(editSelect.tagName).toBe('SELECT');
  const addOptions = Array.from(addSelect.querySelectorAll('option')).map(o => o.value);
  const editOptions = Array.from(editSelect.querySelectorAll('option')).map(o => o.value);
  expect(addOptions).toEqual(expect.arrayContaining(['USD', 'GBP', 'EUR']));
  expect(editOptions).toEqual(expect.arrayContaining(['USD', 'GBP', 'EUR']));
});
