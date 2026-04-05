/**
 * Pension Retirement Projection Tests
 *
 * Tests for calculateRetirementProjection() and getYearsToRetirement() pure functions,
 * plus DOM integration tests for the "Projected Pot at Retirement" summary card.
 *
 * Written TDD-style: these tests are written before the implementation.
 */

function buildPensionDom() {
  return `
    <div id="pension-tabs"></div>
    <button id="add-pension-btn"></button>
    <button id="remove-pension-btn"></button>
    <button id="add-pension-entry-btn"></button>
    <input type="checkbox" id="pension-summary-toggle" />
    <div id="new-pension-modal" style="display:none">
      <form id="new-pension-form">
        <input id="pension-name" />
        <select id="pension-type"><option value="growth">Growth</option><option value="payments">Payments</option></select>
        <input id="pension-start-value" />
        <button id="cancel-new-pension"></button>
      </form>
    </div>
    <div id="pension-entry-modal" style="display:none">
      <form id="pension-entry-form">
        <input id="pension-entry-date" />
        <input id="pension-entry-value" />
        <input id="pension-entry-payment" />
        <button id="cancel-pension-entry"></button>
        <span id="pension-base-currency-label"></span>
        <span id="pension-payment-currency-label"></span>
        <span id="pension-total-payment-currency-label"></span>
      </form>
    </div>
    <div id="pension-edit-modal" style="display:none">
      <form id="pension-edit-form">
        <input id="pension-edit-date" />
        <input id="pension-edit-value" />
        <input id="pension-edit-payment" />
        <button id="cancel-pension-edit"></button>
      </form>
    </div>
    <div id="pension-chart-popup" style="display:none">
      <select id="pension-chart-select"></select>
      <canvas id="pension-chart-canvas"></canvas>
      <button id="pension-chart-close"></button>
      <button id="pension-chart-btn"></button>
      <button id="pension-range-tool-btn"></button>
      <div id="pension-range-result">
        <div id="pension-range-values">
          <span id="pension-range-from"></span>
          <span id="pension-range-to"></span>
          <span id="pension-range-diff"></span>
          <span id="pension-range-pct"></span>
          <span id="pension-range-duration"></span>
        </div>
        <div id="pension-range-hint"></div>
        <button id="pension-range-clear"></button>
      </div>
    </div>
    <table id="pension-table">
      <thead><tr>
        <th class="payment-col"></th>
        <th class="total-payment-col"></th>
      </tr></thead>
      <tbody id="pension-body"></tbody>
    </table>
    <div class="summary-cards" id="pension-summary-cards" style="display:none">
      <div class="summary-card"><p id="pension-total-value"></p></div>
      <div class="summary-card"><p id="pension-current-cagr"></p></div>
      <div class="summary-card"><p id="pension-best-month"></p></div>
      <div class="summary-card"><p id="pension-worst-month"></p></div>
      <div class="summary-card"><p id="pension-best-year"></p></div>
      <div class="summary-card"><p id="pension-worst-year"></p></div>
      <div class="summary-card pension-projection-wide" id="pension-projection-card">
        <h4>Projected Pot at Retirement</h4>
        <p id="pension-projection-formula"></p>
        <div id="pension-projection-scenarios" style="display:none">
          <span id="pension-projection-low-rate"></span>
          <span id="pension-projected-low"></span>
          <span id="pension-projection-base-rate"></span>
          <span id="pension-projected-base"></span>
          <span id="pension-projection-high-rate"></span>
          <span id="pension-projected-high"></span>
        </div>
      </div>
    </div>
  `;
}

beforeEach(() => {
  jest.resetModules();
  localStorage.clear();
  document.body.innerHTML = buildPensionDom();

  global.StorageUtils = require('../app/js/core/storageUtils');
  global.Utils = { formatInputValue: v => v };
  global.I18n = {
    t: k => k,
    formatCurrency: (v, c) => `${c}${Number(v).toFixed(2)}`,
    getLocale: () => 'en',
    formatDate: d => d,
  };
  global.Settings = {
    getBaseCurrency: () => 'GBP',
    getDob: () => '',
    getRetirementAge: () => null,
  };
  global.DialogManager = { confirm: async () => true };
  global.Chart = function () {
    return { destroy: () => {}, update: () => {}, data: { datasets: [] } };
  };
  global.Chart.register = () => {};
});

// ---------------------------------------------------------------------------
// calculateRetirementProjection — pure function tests
// ---------------------------------------------------------------------------

describe('calculateRetirementProjection', () => {
  let PensionManager;

  beforeEach(() => {
    PensionManager = require('../app/js/features/pensionManager');
  });

  test('returns null when yearsToRetirement is 0', () => {
    const result = PensionManager.calculateRetirementProjection(10000, 200, 7, 0);
    expect(result).toBeNull();
  });

  test('returns null when yearsToRetirement is negative', () => {
    const result = PensionManager.calculateRetirementProjection(10000, 200, 7, -5);
    expect(result).toBeNull();
  });

  test('returns null when currentValue is NaN', () => {
    const result = PensionManager.calculateRetirementProjection(NaN, 200, 7, 10);
    expect(result).toBeNull();
  });

  test('returns null when monthlyContribution is NaN', () => {
    const result = PensionManager.calculateRetirementProjection(10000, NaN, 7, 10);
    expect(result).toBeNull();
  });

  test('returns null when annualGrowthRatePct is NaN', () => {
    const result = PensionManager.calculateRetirementProjection(10000, 200, NaN, 10);
    expect(result).toBeNull();
  });

  test('returns null when yearsToRetirement is NaN', () => {
    const result = PensionManager.calculateRetirementProjection(10000, 200, 7, NaN);
    expect(result).toBeNull();
  });

  test('zero CAGR: result equals currentValue + (monthlyContribution * months)', () => {
    const result = PensionManager.calculateRetirementProjection(10000, 200, 0, 10);
    const expected = 10000 + 200 * 120; // 10000 + 24000 = 34000
    expect(result).toBeCloseTo(expected, 2);
  });

  test('zero monthly contribution: result equals lump-sum compound growth only', () => {
    const result = PensionManager.calculateRetirementProjection(10000, 0, 7, 10);
    // 10000 * (1.07)^10 = 10000 * 1.96715 = 19671.51
    expect(result).toBeCloseTo(19671.51, 0);
  });

  test('positive CAGR: result is greater than zero-CAGR result', () => {
    const withGrowth = PensionManager.calculateRetirementProjection(10000, 200, 7, 10);
    const noGrowth = PensionManager.calculateRetirementProjection(10000, 200, 0, 10);
    expect(withGrowth).toBeGreaterThan(noGrowth);
  });

  test('known values: currentValue=10000, monthly=200, cagr=7, years=10 ≈ 53882', () => {
    // monthly rate = (1.07)^(1/12) - 1 ≈ 0.005654
    // growthFactor = (1.07)^10 ≈ 1.96715
    // initial future value = 10000 * 1.96715 ≈ 19671.51
    // contributions future value = 200 * (1.96715 - 1) / 0.005654 ≈ 34210.62
    // total ≈ 53882
    const result = PensionManager.calculateRetirementProjection(10000, 200, 7, 10);
    expect(result).toBeCloseTo(53882, 0);
  });

  test('result is a finite number for valid inputs', () => {
    const result = PensionManager.calculateRetirementProjection(50000, 500, 5, 20);
    expect(typeof result).toBe('number');
    expect(isFinite(result)).toBe(true);
    expect(result).toBeGreaterThan(0);
  });

  test('larger currentValue produces larger projected value', () => {
    const small = PensionManager.calculateRetirementProjection(10000, 200, 7, 10);
    const large = PensionManager.calculateRetirementProjection(50000, 200, 7, 10);
    expect(large).toBeGreaterThan(small);
  });

  test('more years produces larger projected value', () => {
    const short = PensionManager.calculateRetirementProjection(10000, 200, 7, 10);
    const long = PensionManager.calculateRetirementProjection(10000, 200, 7, 20);
    expect(long).toBeGreaterThan(short);
  });
});

// ---------------------------------------------------------------------------
// getYearsToRetirement — pure function tests
// ---------------------------------------------------------------------------

describe('getYearsToRetirement', () => {
  let PensionManager;

  beforeEach(() => {
    PensionManager = require('../app/js/features/pensionManager');
  });

  test('returns null when dob is empty string', () => {
    expect(PensionManager.getYearsToRetirement('', 65)).toBeNull();
  });

  test('returns null when dob is null', () => {
    expect(PensionManager.getYearsToRetirement(null, 65)).toBeNull();
  });

  test('returns null when retirementAge is null', () => {
    expect(PensionManager.getYearsToRetirement('1985-01-01', null)).toBeNull();
  });

  test('returns null when retirementAge is NaN', () => {
    expect(PensionManager.getYearsToRetirement('1985-01-01', NaN)).toBeNull();
  });

  test('returns null when dob is invalid date string', () => {
    expect(PensionManager.getYearsToRetirement('not-a-date', 65)).toBeNull();
  });

  test('returns a positive number for a future retirement date', () => {
    // Person born in 2000, retirement at 65 = 2065 — well in the future
    const result = PensionManager.getYearsToRetirement('2000-01-01', 65);
    expect(result).toBeGreaterThan(0);
  });

  test('returns a negative number when already past retirement', () => {
    // Person born in 1940, retirement at 65 = 2005 — well in the past
    const result = PensionManager.getYearsToRetirement('1940-01-01', 65);
    expect(result).toBeLessThan(0);
  });

  test('returns approximately 25 for someone born 40 years ago targeting retirement at 65', () => {
    // Today is 2026-04-04. Born 40 years ago = 1986-04-04. Retirement at 65 = 2051-04-04.
    // Years remaining ≈ 25
    const dob = '1986-04-04';
    const result = PensionManager.getYearsToRetirement(dob, 65);
    expect(result).toBeGreaterThan(24.9);
    expect(result).toBeLessThan(25.1);
  });

  test('uses fractional years (365.25 days per year), not integer years', () => {
    // Born exactly 40.5 years ago (to test precision), retirement at 65 = 24.5 years away
    const today = new Date();
    const dob = new Date(today);
    dob.setFullYear(today.getFullYear() - 40);
    dob.setMonth(today.getMonth() - 6); // 6 months extra = 40.5 years ago
    const dobStr = dob.toISOString().split('T')[0];
    const result = PensionManager.getYearsToRetirement(dobStr, 65);
    // Should be roughly 24.5 years
    expect(result).toBeGreaterThan(24.0);
    expect(result).toBeLessThan(25.0);
  });
});

// ---------------------------------------------------------------------------
// DOM integration tests — projected value card in updateSummaryCards
// ---------------------------------------------------------------------------

describe('pension projection summary card', () => {
  function loadPensionWithEntries(pensionList, entriesMap, settingsOverrides) {
    localStorage.setItem('pensionList', JSON.stringify(pensionList));
    pensionList.forEach(p => {
      const key = `pensionData_${p.id}`;
      if (entriesMap[p.id]) {
        localStorage.setItem(key, JSON.stringify(entriesMap[p.id]));
      }
    });
    global.Settings = {
      getBaseCurrency: () => 'GBP',
      getDob: () => '',
      getRetirementAge: () => null,
      ...settingsOverrides,
    };
    const PensionManager = require('../app/js/features/pensionManager');
    PensionManager.init();
    // Click the Summary tab to trigger updateSummaryCards
    const summaryTab = document.querySelector('#pension-tabs button[data-pension-id="summary"]');
    if (summaryTab) summaryTab.click();
    return PensionManager;
  }

  test('scenarios panel is hidden when getDob returns empty string', () => {
    loadPensionWithEntries(
      [{ id: 'p1', name: 'Test Pension', type: 'growth', start: 50000, show: true }],
      { p1: [{ date: '2023-01-01', value: 55000 }, { date: '2023-02-01', value: 56000 }] },
      { getDob: () => '', getRetirementAge: () => 65 }
    );
    expect(document.getElementById('pension-projection-scenarios').style.display).toBe('none');
  });

  test('scenarios panel is hidden when getRetirementAge returns null', () => {
    loadPensionWithEntries(
      [{ id: 'p1', name: 'Test Pension', type: 'growth', start: 50000, show: true }],
      { p1: [{ date: '2023-01-01', value: 55000 }, { date: '2023-02-01', value: 56000 }] },
      { getDob: () => '1985-06-15', getRetirementAge: () => null }
    );
    expect(document.getElementById('pension-projection-scenarios').style.display).toBe('none');
  });

  test('formula shows "Retirement age reached" when already past retirement', () => {
    loadPensionWithEntries(
      [{ id: 'p1', name: 'Test Pension', type: 'growth', start: 50000, show: true }],
      { p1: [{ date: '2023-01-01', value: 55000 }, { date: '2023-02-01', value: 56000 }] },
      // Person born in 1940 with retirement age 65 = retired in 2005
      { getDob: () => '1940-01-01', getRetirementAge: () => 65 }
    );
    expect(document.getElementById('pension-projection-formula').textContent).toBe('Retirement age reached');
  });

  test('all three scenario values are shown when inputs are valid', () => {
    loadPensionWithEntries(
      [{ id: 'p1', name: 'Test Pension', type: 'payments', start: 50000, show: true }],
      {
        p1: [
          { date: '2020-01-25', value: 55000, payment: 500 },
          { date: '2020-02-25', value: 56000, payment: 500 },
          { date: '2020-03-25', value: 57000, payment: 500 },
          { date: '2021-01-25', value: 60000, payment: 500 },
          { date: '2022-01-25', value: 65000, payment: 500 },
        ]
      },
      { getDob: () => '1990-01-01', getRetirementAge: () => 67 }
    );
    expect(document.getElementById('pension-projection-scenarios').style.display).toBe('flex');
    const lowText = document.getElementById('pension-projected-low').textContent;
    const baseText = document.getElementById('pension-projected-base').textContent;
    const highText = document.getElementById('pension-projected-high').textContent;
    expect(lowText.length).toBeGreaterThan(0);
    expect(baseText.length).toBeGreaterThan(0);
    expect(highText.length).toBeGreaterThan(0);
  });

  test('optimistic value is greater than base, base is greater than conservative', () => {
    loadPensionWithEntries(
      [{ id: 'p1', name: 'Test Pension', type: 'payments', start: 50000, show: true }],
      {
        p1: [
          { date: '2020-01-25', value: 55000, payment: 500 },
          { date: '2020-02-25', value: 56000, payment: 500 },
          { date: '2021-01-25', value: 60000, payment: 500 },
          { date: '2022-01-25', value: 65000, payment: 500 },
        ]
      },
      { getDob: () => '1990-01-01', getRetirementAge: () => 67 }
    );
    // Parse currency strings back to numbers for comparison (format: "GBP12345.67")
    const parse = id => parseFloat(document.getElementById(id).textContent.replace(/[^0-9.]/g, ''));
    expect(parse('pension-projected-high')).toBeGreaterThan(parse('pension-projected-base'));
    expect(parse('pension-projected-base')).toBeGreaterThan(parse('pension-projected-low'));
  });

  test('formula line contains current value, monthly payment and years', () => {
    loadPensionWithEntries(
      [{ id: 'p1', name: 'Test Pension', type: 'payments', start: 50000, show: true }],
      {
        p1: [
          { date: '2020-01-25', value: 55000, payment: 500 },
          { date: '2021-01-25', value: 60000, payment: 500 },
          { date: '2022-01-25', value: 65000, payment: 500 },
        ]
      },
      { getDob: () => '1990-01-01', getRetirementAge: () => 67 }
    );
    const formula = document.getElementById('pension-projection-formula').textContent;
    expect(formula).toContain('FV =');
    expect(formula).toContain('Years:');
  });

  test('conservative rate is base CAGR minus 5 (minimum 1%)', () => {
    loadPensionWithEntries(
      [{ id: 'p1', name: 'Test Pension', type: 'payments', start: 50000, show: true }],
      {
        p1: [
          { date: '2020-01-25', value: 55000, payment: 500 },
          { date: '2021-01-25', value: 60000, payment: 500 },
          { date: '2022-01-25', value: 65000, payment: 500 },
        ]
      },
      { getDob: () => '1990-01-01', getRetirementAge: () => 67 }
    );
    const baseRateText = document.getElementById('pension-projection-base-rate').textContent;
    const lowRateText = document.getElementById('pension-projection-low-rate').textContent;
    const baseRate = parseFloat(baseRateText);
    const lowRate = parseFloat(lowRateText);
    expect(lowRate).toBeCloseTo(Math.max(1, baseRate - 5), 1);
  });
});
