const fs = require('fs');

test('style.css defines growth-positive class', () => {
  const css = fs.readFileSync('app/css/style.css', 'utf8');
  expect(css).toMatch(/\.growth-positive\s*\{/);
});
