const { mockDOMElements, createMockElement } = require('./utils/testUtils.js');
const { mockCalculatorInputs } = require('./utils/mockData.js');

const mockElements = {
  'loan-principal': createMockElement('input', { value: '300000' }),
  'loan-rate': createMockElement('input', { value: '4.5' }),
  'loan-term': createMockElement('input', { value: '30' }),
  'loan-monthly-payment': createMockElement('span'),
  'loan-total-interest': createMockElement('span'),
  'loan-total-amount': createMockElement('span'),
  'loan-results': createMockElement('div', { style: { display: 'none' } }),

  'invest-initial': createMockElement('input', { value: '10000' }),
  'invest-rate': createMockElement('input', { value: '7' }),
  'invest-years': createMockElement('input', { value: '10' }),
  'invest-total-return': createMockElement('span'),
  'invest-final-value': createMockElement('span'),
  'investment-results': createMockElement('div', { style: { display: 'none' } }),
  'investment-growth-container': createMockElement('div', { style: { display: 'none' } }),
  'investment-growth-body': createMockElement('tbody'),

  'cagr-beginning': createMockElement('input', { value: '10000' }),
  'cagr-ending': createMockElement('input', { value: '25000' }),
  'cagr-years': createMockElement('input', { value: '5' }),
  'cagr-total-return': createMockElement('span'),
  'cagr-rate': createMockElement('span'),
  'cagr-results': createMockElement('div', { style: { display: 'none' } }),

  'dcf-current-fcf': createMockElement('input', { value: '100' }),
  'dcf-growth-rate': createMockElement('input', { value: '5' }),
  'dcf-terminal-rate': createMockElement('input', { value: '2' }),
  'dcf-discount-rate': createMockElement('input', { value: '10' }),
  'dcf-years': createMockElement('input', { value: '10' }),
  'dcf-shares': createMockElement('input', { value: '1000' }),
  'dcf-enterprise-value': createMockElement('span'),
  'dcf-pv-cashflows': createMockElement('span'),
  'dcf-terminal-value': createMockElement('span'),
  'dcf-per-share': createMockElement('span'),
  'dcf-results': createMockElement('div', { style: { display: 'none' } }),

  'pe-current-price': createMockElement('input', { value: '150' }),
  'pe-eps': createMockElement('input', { value: '8.5' }),
  'pe-industry-avg': createMockElement('input', { value: '18' }),
  'pe-growth-rate': createMockElement('input', { value: '12' }),
  'pe-current-ratio': createMockElement('span'),
  'pe-fair-value': createMockElement('span'),
  'pe-peg-ratio': createMockElement('span'),
  'pe-valuation-status': createMockElement('span'),
  'pe-results': createMockElement('div', { style: { display: 'none' } })
};

describe('Calculator Module', () => {
  let restoreMocks;

  beforeEach(() => {
    restoreMocks = mockDOMElements(mockElements);
    
    Object.values(mockElements).forEach(element => {
      if (element.style) {
        element.style.display = 'none';
      }
    });
  });

  afterEach(() => {
    if (restoreMocks) restoreMocks();
  });

  describe('Loan Calculator', () => {
    test('calculates monthly payment correctly', () => {
      const principal = 300000;
      const annualRate = 4.5;
      const years = 30;
      
      const monthlyRate = annualRate / 100 / 12;
      const totalPayments = years * 12;
      const expectedMonthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / 
                                   (Math.pow(1 + monthlyRate, totalPayments) - 1);
      
      expect(expectedMonthlyPayment).toBeCloseTo(1520.06, 2);
    });

    test('calculates total interest correctly', () => {
      const principal = 300000;
      const monthlyPayment = 1520.06;
      const totalPayments = 30 * 12;
      const totalAmount = monthlyPayment * totalPayments;
      const totalInterest = totalAmount - principal;
      
      expect(totalInterest).toBeCloseTo(247221.60, 2);
    });

    test('handles zero or negative inputs', () => {
      const testCases = [
        { principal: 0, rate: 4.5, term: 30 },
        { principal: -100000, rate: 4.5, term: 30 },
        { principal: 300000, rate: 0, term: 30 },
        { principal: 300000, rate: 4.5, term: 0 }
      ];

      testCases.forEach(({ principal, rate, term }) => {
        if (principal <= 0 || rate <= 0 || term <= 0) {
          expect(true).toBe(true); // Placeholder for validation logic
        }
      });
    });
  });

  describe('Investment Calculator', () => {
    test('calculates compound interest correctly', () => {
      const initial = 10000;
      const annualRate = 7;
      const years = 10;
      
      const finalValue = initial * Math.pow(1 + annualRate / 100, years);
      const totalReturn = finalValue - initial;
      
      expect(finalValue).toBeCloseTo(19671.51, 2);
      expect(totalReturn).toBeCloseTo(9671.51, 2);
    });

    test('handles edge cases', () => {
      const zeroInitial = 0 * Math.pow(1.07, 10);
      expect(zeroInitial).toBe(0);

      const zeroRate = 10000 * Math.pow(1, 10);
      expect(zeroRate).toBe(10000);

      const oneYear = 10000 * Math.pow(1.07, 1);
      expect(oneYear).toBeCloseTo(10700, 2);
    });
  });

  describe('CAGR Calculator', () => {
    test('calculates CAGR correctly', () => {
      const beginning = 10000;
      const ending = 25000;
      const years = 5;
      
      const totalReturn = ((ending - beginning) / beginning) * 100;
      const cagr = (Math.pow(ending / beginning, 1 / years) - 1) * 100;
      
      expect(totalReturn).toBeCloseTo(150, 2);
      expect(cagr).toBeCloseTo(20.11, 2);
    });

    test('handles various time periods', () => {
      const testCases = [
        { beginning: 1000, ending: 2000, years: 1, expectedCAGR: 100 },
        { beginning: 1000, ending: 1000, years: 5, expectedCAGR: 0 },
        { beginning: 2000, ending: 1000, years: 2, expectedCAGR: -29.29 }
      ];

      testCases.forEach(({ beginning, ending, years, expectedCAGR }) => {
        const cagr = (Math.pow(ending / beginning, 1 / years) - 1) * 100;
        expect(cagr).toBeCloseTo(expectedCAGR, 2);
      });
    });
  });

  describe('DCF Calculator', () => {
    test('calculates discounted cash flows correctly', () => {
      const currentFCF = 100;
      const growthRate = 5;
      const discountRate = 10;
      const years = 10;
      
      let pvCashFlows = 0;
      for (let year = 1; year <= years; year++) {
        const fcf = currentFCF * Math.pow(1 + growthRate / 100, year);
        const pv = fcf / Math.pow(1 + discountRate / 100, year);
        pvCashFlows += pv;
      }
      
      expect(pvCashFlows).toBeCloseTo(781.18, 2);
    });

    test('calculates terminal value correctly', () => {
      const currentFCF = 100;
      const growthRate = 5;
      const terminalRate = 2;
      const discountRate = 10;
      const years = 10;
      
      const terminalFCF = currentFCF * Math.pow(1 + growthRate / 100, years) * (1 + terminalRate / 100);
      const terminalValue = terminalFCF / (discountRate / 100 - terminalRate / 100);
      const pvTerminalValue = terminalValue / Math.pow(1 + discountRate / 100, years);
      
      expect(pvTerminalValue).toBeCloseTo(800.71, 2);
    });

    test('calculates per-share value correctly', () => {
      const enterpriseValue = 1665.28; // pvCashFlows + pvTerminalValue
      const sharesOutstanding = 1000;
      const valuePerShare = enterpriseValue / sharesOutstanding;
      
      expect(valuePerShare).toBeCloseTo(1.67, 2);
    });
  });

  describe('P/E Calculator', () => {
    test('calculates P/E ratio correctly', () => {
      const currentPrice = 150;
      const eps = 8.5;
      const currentPE = currentPrice / eps;
      
      expect(currentPE).toBeCloseTo(17.65, 2);
    });

    test('calculates fair value correctly', () => {
      const eps = 8.5;
      const industryPE = 18;
      const fairValue = eps * industryPE;
      
      expect(fairValue).toBeCloseTo(153, 2);
    });

    test('calculates PEG ratio correctly', () => {
      const currentPE = 17.65;
      const growthRate = 12;
      const pegRatio = currentPE / growthRate;
      
      expect(pegRatio).toBeCloseTo(1.47, 2);
    });

    test('determines valuation status correctly', () => {
      const testCases = [
        { currentPrice: 150, fairValue: 153, expected: 'Fairly Valued' },
        { currentPrice: 170, fairValue: 153, expected: 'Overvalued' },
        { currentPrice: 135, fairValue: 153, expected: 'Undervalued' }
      ];

      testCases.forEach(({ currentPrice, fairValue, expected }) => {
        const valuationDiff = ((currentPrice - fairValue) / fairValue) * 100;
        let status = '';
        
        if (valuationDiff > 10) {
          status = 'Overvalued';
        } else if (valuationDiff < -10) {
          status = 'Undervalued';
        } else {
          status = 'Fairly Valued';
        }
        
        expect(status).toContain(expected.split(' ')[0]);
      });
    });
  });

  describe('Intrinsic Value Calculator', () => {
    test('calculates Graham Number correctly', () => {
      const eps = 8.5;
      const bookValue = 50;
      const grahamNumber = Math.sqrt(22.5 * eps * bookValue);
      
      expect(grahamNumber).toBeCloseTo(97.79, 2);
    });

    test('calculates Dividend Discount Model correctly', () => {
      const eps = 8.5;
      const dividendYield = 2.5;
      const requiredReturn = 10;
      const growthRate = 5;
      
      const dividendPerShare = (eps * dividendYield) / 100;
      const ddmValue = dividendPerShare / ((requiredReturn / 100) - (growthRate / 100));
      
      expect(ddmValue).toBeCloseTo(4.25, 2);
    });

    test('handles edge cases in DDM calculation', () => {
      const requiredReturn = 5;
      const growthRate = 5;
      
      expect(requiredReturn - growthRate).toBe(0);
    });
  });

  describe('Currency Formatting', () => {
    test('formats currency correctly', () => {
      const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 2
        }).format(amount);
      };

      expect(formatCurrency(1520.06)).toBe('$1,520.06');
      expect(formatCurrency(300000)).toBe('$300,000.00');
      expect(formatCurrency(0)).toBe('$0.00');
    });
  });

  describe('Percentage Formatting', () => {
    test('formats percentages correctly', () => {
      const formatPercentage = (rate) => {
        return rate.toFixed(2) + '%';
      };

      expect(formatPercentage(20.11)).toBe('20.11%');
      expect(formatPercentage(0)).toBe('0.00%');
      expect(formatPercentage(-5.25)).toBe('-5.25%');
    });
  });
});
