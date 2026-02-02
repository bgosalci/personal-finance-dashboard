const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const vm = require('vm');

const i18nCode = fs.readFileSync(path.resolve(__dirname, '../app/js/core/i18n.js'), 'utf8');
const calculatorCode = fs.readFileSync(path.resolve(__dirname, '../app/js/features/calculator.js'), 'utf8');

function buildSalaryDom() {
  return `
    <div id="salary-tabs"></div>
    <div id="salary-summary-panel"></div>
    <div id="salary-summary-list"></div>
    <div id="salary-form-panel"></div>
    <button id="add-salary-btn"></button>
    <button id="remove-salary-btn"></button>
    <input type="checkbox" id="salary-summary-toggle" />
    <div id="salary-form-title"></div>
    <input id="salary-name" />
    <input id="salary-annual" />
    <input id="salary-annualized" />
    <select id="salary-frequency">
      <option value="monthly">Monthly</option>
      <option value="weekly">Weekly</option>
      <option value="hourly">Hourly</option>
    </select>
    <input id="salary-hours" />
    <input id="salary-pension" />
    <select id="salary-student-loan"></select>
    <input id="salary-age" />
    <input id="salary-tax-code" />
    <input id="salary-benefits" />
    <input id="salary-other-deductions" />
    <div id="salary-allowances"></div>
    <button id="add-salary-allowance"></button>

    <span id="salary-take-home"></span>
    <span id="salary-tax"></span>
    <span id="salary-tax-percent"></span>
    <span id="salary-deductions"></span>
    <span id="salary-pension-value"></span>
    <span id="salary-ni"></span>
    <span id="salary-ni-percent"></span>
    <span id="salary-student-loan-value"></span>
    <span id="salary-other-value"></span>
    <span id="salary-per-period"></span>
    <span id="salary-frequency-label"></span>
    <span id="salary-annual-gross"></span>
    <span id="salary-annual-taxable"></span>
    <span id="salary-annual-allowances"></span>
    <span id="salary-annual-benefits"></span>
    <span id="salary-period-gross"></span>
    <span id="salary-period-taxable"></span>
    <span id="salary-period-allowances"></span>
    <span id="salary-period-benefits"></span>
    <span id="salary-period-tax"></span>
    <span id="salary-period-tax-percent"></span>
    <span id="salary-period-pension"></span>
    <span id="salary-period-ni"></span>
    <span id="salary-period-ni-percent"></span>
    <span id="salary-period-student-loan"></span>
    <span id="salary-period-other"></span>
    <span id="salary-total-tax-annual"></span>
    <span id="salary-total-tax-percent"></span>
    <span id="salary-period-total-tax"></span>
    <span id="salary-period-total-tax-percent"></span>
    <span id="salary-period-deductions"></span>
    <div id="tooltip"></div>
  `;
}

test('salary calculator outputs tax percentages', () => {
  const dom = new JSDOM(`<!DOCTYPE html><html><body>${buildSalaryDom()}</body></html>`, { url: 'http://localhost' });
  const context = vm.createContext(dom.window);
  vm.runInContext(i18nCode, context);
  dom.window.localStorage.setItem('pf_salary_entries', JSON.stringify([
    {
      id: 'salary-test',
      name: 'Test',
      annualSalary: 50000,
      pensionPercent: 0,
      studentLoanPlan: 'none',
      age: 30,
      taxCode: '1257L',
      benefits: 0,
      hoursPerWeek: 37.5,
      frequency: 'monthly',
      showInSummary: true,
      allowances: [],
      otherDeductions: 0
    }
  ]));
  vm.runInContext(calculatorCode, context);
  vm.runInContext('SalaryCalculator.init()', context);

  const salaryTabs = dom.window.document.getElementById('salary-tabs');
  const entryButton = salaryTabs.querySelector('button[data-salary-id="salary-test"]');
  entryButton.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));

  const taxPercent = dom.window.document.getElementById('salary-tax-percent').textContent;
  const niPercent = dom.window.document.getElementById('salary-ni-percent').textContent;
  const totalTaxPercent = dom.window.document.getElementById('salary-total-tax-percent').textContent;

  expect(taxPercent).toBe('14.97%');
  expect(niPercent).toBe('5.99%');
  expect(totalTaxPercent).toBe('20.96%');
});

test('salary calculator annualizes hourly rate based on hours per week', () => {
  const dom = new JSDOM(`<!DOCTYPE html><html><body>${buildSalaryDom()}</body></html>`, { url: 'http://localhost' });
  const context = vm.createContext(dom.window);
  vm.runInContext(i18nCode, context);
  dom.window.localStorage.setItem('pf_salary_entries', JSON.stringify([
    {
      id: 'salary-hourly',
      name: 'Hourly',
      rateAmount: 20,
      annualSalary: 0,
      pensionPercent: 0,
      studentLoanPlan: 'none',
      age: 30,
      taxCode: '1257L',
      benefits: 0,
      hoursPerWeek: 40,
      frequency: 'hourly',
      showInSummary: true,
      allowances: [],
      otherDeductions: 0
    }
  ]));
  vm.runInContext(calculatorCode, context);
  vm.runInContext('SalaryCalculator.init()', context);

  const salaryTabs = dom.window.document.getElementById('salary-tabs');
  const entryButton = salaryTabs.querySelector('button[data-salary-id="salary-hourly"]');
  entryButton.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));

  const annualized = dom.window.document.getElementById('salary-annualized').value;
  expect(annualized).toBe('41,600.00');
});

test('salary calculator annualizes weekly rate', () => {
  const dom = new JSDOM(`<!DOCTYPE html><html><body>${buildSalaryDom()}</body></html>`, { url: 'http://localhost' });
  const context = vm.createContext(dom.window);
  vm.runInContext(i18nCode, context);
  dom.window.localStorage.setItem('pf_salary_entries', JSON.stringify([
    {
      id: 'salary-weekly',
      name: 'Weekly',
      rateAmount: 750,
      annualSalary: 0,
      pensionPercent: 0,
      studentLoanPlan: 'none',
      age: 30,
      taxCode: '1257L',
      benefits: 0,
      hoursPerWeek: 37.5,
      frequency: 'weekly',
      showInSummary: true,
      allowances: [],
      otherDeductions: 0
    }
  ]));
  vm.runInContext(calculatorCode, context);
  vm.runInContext('SalaryCalculator.init()', context);

  const salaryTabs = dom.window.document.getElementById('salary-tabs');
  const entryButton = salaryTabs.querySelector('button[data-salary-id="salary-weekly"]');
  entryButton.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));

  const annualized = dom.window.document.getElementById('salary-annualized').value;
  expect(annualized).toBe('39,000.00');
});
