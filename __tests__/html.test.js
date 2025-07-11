const fs = require('fs');
const path = require('path');
const {JSDOM} = require('jsdom');

test('index.html references CSS and JS', () => {
  const htmlPath = path.resolve(__dirname, '../app/index.html');
  const html = fs.readFileSync(htmlPath, 'utf8');
  const dom = new JSDOM(html);
  const doc = dom.window.document;
  expect(doc.querySelector('link[href="css/style.css"]')).not.toBeNull();
  expect(doc.querySelector('script[src="js/script.js"]')).not.toBeNull();
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
});
