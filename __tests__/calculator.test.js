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
    <select id="salary-rate-frequency">
      <option value="annual">Annual</option>
      <option value="monthly">Monthly</option>
      <option value="weekly">Weekly</option>
      <option value="daily">Daily</option>
      <option value="hourly">Hourly</option>
    </select>
    <input id="salary-annualized" />
    <select id="salary-frequency">
      <option value="monthly">Monthly</option>
      <option value="weekly">Weekly</option>
      <option value="daily">Daily</option>
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

beforeEach(() => {
  jest.resetModules();
  localStorage.clear();
  global.Utils = require('../app/js/core/utils');
  global.I18n = require('../app/js/core/i18n');
  global.UKTaxYears = require('../app/js/data/ukTaxYears');
  global.Settings = undefined;
});

function loadSalaryCalculator(entries) {
  localStorage.clear();
  document.body.innerHTML = buildSalaryDom();
  localStorage.setItem('pf_salary_entries', JSON.stringify(entries));
  require('../app/js/features/calculator');
  window.SalaryCalculator.init();
  const entryButton = document.getElementById('salary-tabs').querySelector(`button[data-salary-id="${entries[0].id}"]`);
  entryButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
}

test('salary calculator outputs tax percentages', () => {
  loadSalaryCalculator([{
    id: 'salary-test', name: 'Test', rateFrequency: 'annual', annualSalary: 50000,
    pensionPercent: 0, studentLoanPlan: 'none', age: 30, taxCode: '1257L',
    benefits: 0, hoursPerWeek: 37.5, frequency: 'monthly', showInSummary: true,
    allowances: [], otherDeductions: 0
  }]);
  expect(document.getElementById('salary-tax-percent').textContent).toBe('14.97%');
  expect(document.getElementById('salary-ni-percent').textContent).toBe('5.99%');
  expect(document.getElementById('salary-total-tax-percent').textContent).toBe('20.96%');
});

test('salary calculator annualizes hourly rate based on hours per week', () => {
  loadSalaryCalculator([{
    id: 'salary-hourly', name: 'Hourly', rateAmount: 20, rateFrequency: 'hourly',
    annualSalary: 0, pensionPercent: 0, studentLoanPlan: 'none', age: 30,
    taxCode: '1257L', benefits: 0, hoursPerWeek: 40, frequency: 'hourly',
    showInSummary: true, allowances: [], otherDeductions: 0
  }]);
  expect(document.getElementById('salary-annualized').value).toBe('41,600.00');
});

test('salary calculator annualizes weekly rate', () => {
  loadSalaryCalculator([{
    id: 'salary-weekly', name: 'Weekly', rateAmount: 750, rateFrequency: 'weekly',
    annualSalary: 0, pensionPercent: 0, studentLoanPlan: 'none', age: 30,
    taxCode: '1257L', benefits: 0, hoursPerWeek: 37.5, frequency: 'weekly',
    showInSummary: true, allowances: [], otherDeductions: 0
  }]);
  expect(document.getElementById('salary-annualized').value).toBe('39,000.00');
});

test('salary calculator annualizes daily rate using workdays only', () => {
  loadSalaryCalculator([{
    id: 'salary-daily', name: 'Daily', rateAmount: 200, rateFrequency: 'daily',
    annualSalary: 0, pensionPercent: 0, studentLoanPlan: 'none', age: 30,
    taxCode: '1257L', benefits: 0, hoursPerWeek: 37.5, frequency: 'daily',
    showInSummary: true, allowances: [], otherDeductions: 0
  }]);
  expect(document.getElementById('salary-annualized').value).toBe('52,000.00');
});

test('dividend calculator matches GOV.UK dividend example', () => {
  require('../app/js/features/calculator');
  const DividendCgtCalculator = window.DividendCgtCalculator;
  const exampleTaxableIncome = DividendCgtCalculator.computeTaxableIncomeFromGross(29570, DividendCgtCalculator.getTaxYearData('2025/26'));
  const result = DividendCgtCalculator.calculateFromValues({ taxYear: '2025/26', taxableIncome: exampleTaxableIncome, dividends: 3000, dividendsExcluded: 0, gains: 0, losses: 0, applyAea: true });
  expect(result.dividend.taxDue).toBeCloseTo(218.75, 2);
});

test('CGT calculator matches GOV.UK example within basic band', () => {
  require('../app/js/features/calculator');
  const result = window.DividendCgtCalculator.calculateFromValues({ taxYear: '2025/26', taxableIncome: 20000, dividends: 0, dividendsExcluded: 0, gains: 12600, losses: 0, applyAea: true });
  expect(result.cgt.taxDue).toBeCloseTo(1728, 2);
});

test('CGT calculator matches GOV.UK example across bands', () => {
  require('../app/js/features/calculator');
  const result = window.DividendCgtCalculator.calculateFromValues({ taxYear: '2025/26', taxableIncome: 20000, dividends: 0, dividendsExcluded: 0, gains: 52600, losses: 0, applyAea: true });
  expect(result.cgt.taxDue).toBeCloseTo(10842, 2);
});

test('2026/27 dividend calculator uses 8.75% basic rate', () => {
  require('../app/js/features/calculator');
  const DividendCgtCalculator = window.DividendCgtCalculator;
  const exampleTaxableIncome = DividendCgtCalculator.computeTaxableIncomeFromGross(29570, DividendCgtCalculator.getTaxYearData('2026/27'));
  const result = DividendCgtCalculator.calculateFromValues({ taxYear: '2026/27', taxableIncome: exampleTaxableIncome, dividends: 3000, dividendsExcluded: 0, gains: 0, losses: 0, applyAea: true });
  expect(result.dividend.taxDue).toBeCloseTo(218.75, 2);
});

test('2026/27 CGT calculator within basic band', () => {
  require('../app/js/features/calculator');
  const result = window.DividendCgtCalculator.calculateFromValues({ taxYear: '2026/27', taxableIncome: 20000, dividends: 0, dividendsExcluded: 0, gains: 12600, losses: 0, applyAea: true });
  expect(result.cgt.taxDue).toBeCloseTo(1728, 2);
});

test('2026/27 CGT calculator across bands', () => {
  require('../app/js/features/calculator');
  const result = window.DividendCgtCalculator.calculateFromValues({ taxYear: '2026/27', taxableIncome: 20000, dividends: 0, dividendsExcluded: 0, gains: 52600, losses: 0, applyAea: true });
  expect(result.cgt.taxDue).toBeCloseTo(10842, 2);
});
