const fs = require('fs');
const path = require('path');

test('style.css defines growth-positive class', () => {
  const cssPath = path.resolve(__dirname, '../app/css/style.css');
  const css = fs.readFileSync(cssPath, 'utf8');
  expect(css).toMatch(/\.growth-positive\s*\{/);
});
