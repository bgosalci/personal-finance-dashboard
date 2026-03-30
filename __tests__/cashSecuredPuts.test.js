function buildCSPDom() {
  return `
    <input id="csp-buying-power" type="text" />
    <input id="csp-pct" type="number" />
    <input id="csp-strike" type="text" />
    <input id="csp-premium" type="text" />
    <div id="csp-results" style="display:none"></div>
    <div id="csp-premium-results" style="display:none"></div>
    <span id="csp-contracts"></span>
    <span id="csp-capital-req"></span>
    <span id="csp-capital-rem"></span>
    <span id="csp-bp-used"></span>
    <span id="csp-total-premium"></span>
    <span id="csp-breakeven"></span>
    <span id="csp-roc"></span>
    <span id="csp-max-profit"></span>
    <span id="csp-premium-pct"></span>
  `;
}

function setInput(id, value) {
  const el = document.getElementById(id);
  el.value = value;
  el.dispatchEvent(new Event('input'));
}

function loadCSP() {
  document.body.innerHTML = buildCSPDom();
  require('../app/js/features/calculator');
  window.CashSecuredPutsCalculator.init();
}

beforeEach(() => {
  jest.resetModules();
  localStorage.clear();
  global.Utils = require('../app/js/core/utils');
  global.I18n = require('../app/js/core/i18n');
  global.UKTaxYears = require('../app/js/data/ukTaxYears');
  global.Settings = undefined;
});

// ─── Position Sizing ────────────────────────────────────────────────────────

describe('position sizing', () => {
  test('calculates correct number of contracts (floor division)', () => {
    loadCSP();
    setInput('csp-buying-power', '50000');
    setInput('csp-pct', '80');
    setInput('csp-strike', '45');
    // capital to deploy = 40000, per contract = 4500, floor = 8
    expect(document.getElementById('csp-contracts').textContent).toBe('8');
  });

  test('calculates capital required correctly', () => {
    loadCSP();
    setInput('csp-buying-power', '50000');
    setInput('csp-pct', '80');
    setInput('csp-strike', '45');
    // 8 contracts × 45 × 100 = 36000
    expect(document.getElementById('csp-capital-req').textContent).toContain('36,000');
  });

  test('calculates capital remaining correctly', () => {
    loadCSP();
    setInput('csp-buying-power', '50000');
    setInput('csp-pct', '80');
    setInput('csp-strike', '45');
    // 50000 - 36000 = 14000
    expect(document.getElementById('csp-capital-rem').textContent).toContain('14,000');
  });

  test('calculates buying power used percentage', () => {
    loadCSP();
    setInput('csp-buying-power', '50000');
    setInput('csp-pct', '80');
    setInput('csp-strike', '45');
    // 36000 / 50000 = 72%
    expect(document.getElementById('csp-bp-used').textContent).toBe('72.00%');
  });

  test('shows results panel once all three base inputs are filled', () => {
    loadCSP();
    expect(document.getElementById('csp-results').style.display).toBe('none');
    setInput('csp-buying-power', '50000');
    setInput('csp-pct', '80');
    setInput('csp-strike', '45');
    expect(document.getElementById('csp-results').style.display).toBe('block');
  });

  test('hides results when buying power is zero', () => {
    loadCSP();
    setInput('csp-buying-power', '0');
    setInput('csp-pct', '80');
    setInput('csp-strike', '45');
    expect(document.getElementById('csp-results').style.display).toBe('none');
  });

  test('hides results when percentage is zero', () => {
    loadCSP();
    setInput('csp-buying-power', '50000');
    setInput('csp-pct', '0');
    setInput('csp-strike', '45');
    expect(document.getElementById('csp-results').style.display).toBe('none');
  });

  test('hides results when strike is zero', () => {
    loadCSP();
    setInput('csp-buying-power', '50000');
    setInput('csp-pct', '80');
    setInput('csp-strike', '0');
    expect(document.getElementById('csp-results').style.display).toBe('none');
  });

  test('floors contracts correctly when capital does not divide evenly', () => {
    loadCSP();
    // 100000 × 50% = 50000 / (47 × 100) = 50000 / 4700 = 10.638… → floor = 10
    setInput('csp-buying-power', '100000');
    setInput('csp-pct', '50');
    setInput('csp-strike', '47');
    expect(document.getElementById('csp-contracts').textContent).toBe('10');
  });

  test('uses comma-formatted buying power value correctly', () => {
    loadCSP();
    setInput('csp-buying-power', '100,000');
    setInput('csp-pct', '100');
    setInput('csp-strike', '100');
    // 100000 / 10000 = 10
    expect(document.getElementById('csp-contracts').textContent).toBe('10');
  });

  test('zero contracts when strike × 100 exceeds capital to deploy', () => {
    loadCSP();
    // 1000 × 10% = 100, strike 200 → per contract = 20000 → 0 contracts
    setInput('csp-buying-power', '1000');
    setInput('csp-pct', '10');
    setInput('csp-strike', '200');
    expect(document.getElementById('csp-contracts').textContent).toBe('0');
  });
});

// ─── Premium Metrics ─────────────────────────────────────────────────────────

describe('premium metrics', () => {
  function setupBase() {
    loadCSP();
    setInput('csp-buying-power', '50000');
    setInput('csp-pct', '80');
    setInput('csp-strike', '45');
  }

  test('premium results panel hidden when no premium entered', () => {
    setupBase();
    expect(document.getElementById('csp-premium-results').style.display).toBe('none');
  });

  test('premium results panel shown when premium is entered', () => {
    setupBase();
    setInput('csp-premium', '1.50');
    expect(document.getElementById('csp-premium-results').style.display).toBe('block');
  });

  test('calculates total premium collected', () => {
    setupBase();
    setInput('csp-premium', '1.50');
    // 8 contracts × 100 × 1.50 = 1200
    expect(document.getElementById('csp-total-premium').textContent).toContain('1,200');
  });

  test('calculates breakeven price', () => {
    setupBase();
    setInput('csp-premium', '1.50');
    // 45 - 1.50 = 43.50
    expect(document.getElementById('csp-breakeven').textContent).toContain('43.50');
  });

  test('calculates return on capital', () => {
    setupBase();
    setInput('csp-premium', '1.50');
    // 1200 / 36000 × 100 = 3.33%
    expect(document.getElementById('csp-roc').textContent).toBe('3.33%');
  });

  test('max profit equals total premium collected', () => {
    setupBase();
    setInput('csp-premium', '1.50');
    expect(document.getElementById('csp-max-profit').textContent).toBe(
      document.getElementById('csp-total-premium').textContent
    );
  });

  test('calculates premium as percentage of strike', () => {
    setupBase();
    setInput('csp-premium', '1.50');
    // 1.50 / 45 × 100 = 3.33%
    expect(document.getElementById('csp-premium-pct').textContent).toBe('3.33%');
  });

  test('hides premium results when premium is cleared back to zero', () => {
    setupBase();
    setInput('csp-premium', '1.50');
    expect(document.getElementById('csp-premium-results').style.display).toBe('block');
    setInput('csp-premium', '0');
    expect(document.getElementById('csp-premium-results').style.display).toBe('none');
  });

  test('hides premium results when zero contracts (insufficient capital)', () => {
    loadCSP();
    setInput('csp-buying-power', '500');
    setInput('csp-pct', '10');
    setInput('csp-strike', '200');
    setInput('csp-premium', '2.00');
    // 500 × 10% = 50, per contract = 20000 → 0 contracts
    expect(document.getElementById('csp-premium-results').style.display).toBe('none');
  });

  test('recalculates when strike changes', () => {
    setupBase();
    setInput('csp-premium', '1.50');
    const firstContracts = document.getElementById('csp-contracts').textContent;
    setInput('csp-strike', '100');
    const secondContracts = document.getElementById('csp-contracts').textContent;
    expect(firstContracts).not.toBe(secondContracts);
  });

  test('recalculates when buying power changes', () => {
    setupBase();
    setInput('csp-premium', '2.00');
    const first = document.getElementById('csp-total-premium').textContent;
    setInput('csp-buying-power', '100000');
    const second = document.getElementById('csp-total-premium').textContent;
    expect(first).not.toBe(second);
  });
});
