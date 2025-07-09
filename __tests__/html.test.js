const fs = require('fs');
const {JSDOM} = require('jsdom');

test('index.html references CSS and JS', () => {
  const html = fs.readFileSync('app/index.html', 'utf8');
  const dom = new JSDOM(html);
  const doc = dom.window.document;
  expect(doc.querySelector('link[href="css/style.css"]')).not.toBeNull();
  expect(doc.querySelector('script[src="js/script.js"]')).not.toBeNull();
});
