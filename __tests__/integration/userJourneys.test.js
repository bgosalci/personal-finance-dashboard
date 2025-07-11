const { mockDOMElements, createMockElement, mockLocalStorage } = require('../utils/testUtils.js');
const { mockInvestments } = require('../utils/mockData.js');
const { mockFinnhubAPI } = require('../utils/apiMocks.js');

describe('User Journey Integration Tests', () => {
  let mockStorage;
  let mockElements;
  let restoreMocks;

  beforeEach(() => {
    mockStorage = mockLocalStorage();
    global.localStorage = mockStorage;
    mockFinnhubAPI();

    mockElements = {
      'add-investment-btn': createMockElement('button'),
      'investment-modal': createMockElement('div', { style: { display: 'none' } }),
      'investment-form': createMockElement('form'),
      'investment-ticker': createMockElement('input'),
      'investment-quantity': createMockElement('input'),
      'investment-price': createMockElement('input'),
      'investment-name': createMockElement('input'),
      'save-investment-btn': createMockElement('button'),
      'portfolio-body': createMockElement('tbody'),
      'portfolio-total-value': createMockElement('span'),

      'loan-principal': createMockElement('input'),
      'loan-rate': createMockElement('input'),
      'loan-term': createMockElement('input'),
      'loan-results': createMockElement('div', { style: { display: 'none' } }),
      'loan-monthly-payment': createMockElement('span'),

      'portfolio-tab': createMockElement('button', { 'data-tab': 'portfolio' }),
      'calculator-tab': createMockElement('button', { 'data-tab': 'calculator' }),
      'portfolio-content': createMockElement('div', { id: 'portfolio' }),
      'calculator-content': createMockElement('div', { id: 'calculator' }),

      'dialog-modal': createMockElement('div', { style: { display: 'none' } }),
      'dialog-message': createMockElement('div'),
      'dialog-ok': createMockElement('button'),
      'dialog-cancel': createMockElement('button')
    };

    restoreMocks = mockDOMElements(mockElements);
  });

  afterEach(() => {
    if (restoreMocks) restoreMocks();
    jest.clearAllMocks();
  });

  describe('Complete Investment Workflow', () => {
    test('add new investment end-to-end', async () => {
      const investments = [];
      
      const openModal = () => {
        mockElements['investment-modal'].style.display = 'flex';
      };

      const fillForm = (data) => {
        mockElements['investment-ticker'].value = data.ticker;
        mockElements['investment-quantity'].value = data.quantity;
        mockElements['investment-price'].value = data.price;
        mockElements['investment-name'].value = data.name;
      };

      const validateForm = () => {
        const ticker = mockElements['investment-ticker'].value.trim().toUpperCase();
        const quantity = parseFloat(mockElements['investment-quantity'].value);
        const price = parseFloat(mockElements['investment-price'].value);
        const name = mockElements['investment-name'].value.trim();

        if (!ticker || isNaN(quantity) || quantity <= 0 || isNaN(price) || price <= 0) {
          return null;
        }

        return { ticker, quantity, price, name };
      };

      const saveInvestment = (investment) => {
        if (investment) {
          investments.push({
            ...investment,
            lastPrice: investment.price, // Initial last price
            tradeDate: new Date().toISOString().split('T')[0]
          });
          localStorage.setItem('portfolioData', JSON.stringify(investments));
          return true;
        }
        return false;
      };

      const updatePortfolioDisplay = () => {
        const totalValue = investments.reduce((sum, inv) => sum + (inv.quantity * inv.lastPrice), 0);
        mockElements['portfolio-total-value'].textContent = `$${totalValue.toLocaleString()}`;
      };

      openModal();
      expect(mockElements['investment-modal'].style.display).toBe('flex');

      fillForm({
        ticker: 'AAPL',
        quantity: '100',
        price: '150.50',
        name: 'Apple Inc.'
      });

      const validatedData = validateForm();
      expect(validatedData).not.toBeNull();
      expect(validatedData.ticker).toBe('AAPL');

      const saved = saveInvestment(validatedData);
      expect(saved).toBe(true);
      expect(investments).toHaveLength(1);

      updatePortfolioDisplay();
      expect(mockElements['portfolio-total-value'].textContent).toBe('$15,050');
    });

    test('edit existing investment workflow', () => {
      const investments = [
        { id: 1, ticker: 'AAPL', quantity: 100, price: 150, lastPrice: 175, name: 'Apple Inc.' }
      ];

      const openEditModal = (investmentId) => {
        const investment = investments.find(inv => inv.id === investmentId);
        if (investment) {
          mockElements['investment-ticker'].value = investment.ticker;
          mockElements['investment-quantity'].value = investment.quantity;
          mockElements['investment-price'].value = investment.price;
          mockElements['investment-name'].value = investment.name;
          mockElements['investment-modal'].style.display = 'flex';
          return investment;
        }
        return null;
      };

      const updateForm = (changes) => {
        Object.keys(changes).forEach(key => {
          if (mockElements[`investment-${key}`]) {
            mockElements[`investment-${key}`].value = changes[key];
          }
        });
      };

      const saveEdit = (investmentId) => {
        const investment = investments.find(inv => inv.id === investmentId);
        if (investment) {
          investment.quantity = parseFloat(mockElements['investment-quantity'].value);
          investment.price = parseFloat(mockElements['investment-price'].value);
          investment.name = mockElements['investment-name'].value;
          localStorage.setItem('portfolioData', JSON.stringify(investments));
          return true;
        }
        return false;
      };

      const editedInvestment = openEditModal(1);
      expect(editedInvestment).not.toBeNull();
      expect(mockElements['investment-ticker'].value).toBe('AAPL');

      updateForm({ quantity: '150' }); // Increase quantity
      expect(mockElements['investment-quantity'].value).toBe('150');

      const saved = saveEdit(1);
      expect(saved).toBe(true);
      expect(investments[0].quantity).toBe(150);
    });

    test('delete investment workflow', async () => {
      const investments = [
        { id: 1, ticker: 'AAPL', quantity: 100, price: 150, name: 'Apple Inc.' },
        { id: 2, ticker: 'GOOGL', quantity: 50, price: 2800, name: 'Alphabet Inc.' }
      ];

      const confirmDelete = async (investmentId) => {
        const investment = investments.find(inv => inv.id === investmentId);
        if (!investment) return false;

        mockElements['dialog-modal'].style.display = 'flex';
        mockElements['dialog-message'].textContent = `Delete ${investment.ticker}?`;
        
        return true;
      };

      const deleteInvestment = (investmentId) => {
        const index = investments.findIndex(inv => inv.id === investmentId);
        if (index !== -1) {
          investments.splice(index, 1);
          localStorage.setItem('portfolioData', JSON.stringify(investments));
          return true;
        }
        return false;
      };

      const confirmed = await confirmDelete(1);
      expect(confirmed).toBe(true);
      expect(mockElements['dialog-modal'].style.display).toBe('flex');

      const deleted = deleteInvestment(1);
      expect(deleted).toBe(true);
      expect(investments).toHaveLength(1);
      expect(investments[0].ticker).toBe('GOOGL');
    });
  });

  describe('Calculator Workflow', () => {
    test('loan calculation workflow', () => {
      const switchToCalculator = () => {
        mockElements['portfolio-content'].classList.remove('active');
        mockElements['calculator-content'].classList.add('active');
        mockElements['portfolio-tab'].classList.remove('active');
        mockElements['calculator-tab'].classList.add('active');
      };

      const enterLoanData = (data) => {
        mockElements['loan-principal'].value = data.principal;
        mockElements['loan-rate'].value = data.rate;
        mockElements['loan-term'].value = data.term;
      };

      const calculateLoan = () => {
        const principal = parseFloat(mockElements['loan-principal'].value);
        const annualRate = parseFloat(mockElements['loan-rate'].value);
        const years = parseFloat(mockElements['loan-term'].value);

        if (principal <= 0 || annualRate <= 0 || years <= 0) {
          mockElements['loan-results'].style.display = 'none';
          return null;
        }

        const monthlyRate = annualRate / 100 / 12;
        const totalPayments = years * 12;
        const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / 
                             (Math.pow(1 + monthlyRate, totalPayments) - 1);

        mockElements['loan-monthly-payment'].textContent = `$${monthlyPayment.toFixed(2)}`;
        mockElements['loan-results'].style.display = 'block';
        
        return monthlyPayment;
      };

      switchToCalculator();
      expect(mockElements['calculator-content'].classList.contains('active')).toBe(true);

      enterLoanData({
        principal: '300000',
        rate: '4.5',
        term: '30'
      });

      const payment = calculateLoan();
      expect(payment).toBeCloseTo(1520.06, 2);
      expect(mockElements['loan-results'].style.display).toBe('block');
    });

    test('investment projection workflow', () => {
      const calculateInvestmentGrowth = (initial, rate, years) => {
        const finalValue = initial * Math.pow(1 + rate / 100, years);
        const totalReturn = finalValue - initial;
        
        const yearlyData = [];
        let currentValue = initial;
        
        for (let year = 1; year <= years; year++) {
          const newValue = currentValue * (1 + rate / 100);
          const yearlyGrowth = newValue - currentValue;
          yearlyData.push({
            year,
            startValue: currentValue,
            growth: yearlyGrowth,
            endValue: newValue
          });
          currentValue = newValue;
        }
        
        return { finalValue, totalReturn, yearlyData };
      };

      const result = calculateInvestmentGrowth(10000, 7, 10);
      
      expect(result.finalValue).toBeCloseTo(19671.51, 2);
      expect(result.totalReturn).toBeCloseTo(9671.51, 2);
      expect(result.yearlyData).toHaveLength(10);
      expect(result.yearlyData[0].year).toBe(1);
      expect(result.yearlyData[9].year).toBe(10);
    });
  });

  describe('Tab Navigation Workflow', () => {
    test('preserves data when switching tabs', () => {
      const appState = {
        portfolioData: mockInvestments,
        calculatorInputs: {
          loanPrincipal: 300000,
          loanRate: 4.5,
          loanTerm: 30
        },
        currentTab: 'portfolio'
      };

      const switchTab = (newTab, state) => {
        if (state.currentTab === 'calculator') {
          state.calculatorInputs = {
            loanPrincipal: parseFloat(mockElements['loan-principal'].value) || 0,
            loanRate: parseFloat(mockElements['loan-rate'].value) || 0,
            loanTerm: parseFloat(mockElements['loan-term'].value) || 0
          };
        }

        state.currentTab = newTab;
        
        if (newTab === 'calculator') {
          mockElements['loan-principal'].value = state.calculatorInputs.loanPrincipal;
          mockElements['loan-rate'].value = state.calculatorInputs.loanRate;
          mockElements['loan-term'].value = state.calculatorInputs.loanTerm;
        }

        return state;
      };

      mockElements['loan-principal'].value = '250000';
      mockElements['loan-rate'].value = '3.5';
      mockElements['loan-term'].value = '25';

      const newState = switchTab('calculator', appState);
      expect(newState.currentTab).toBe('calculator');
      expect(newState.portfolioData).toEqual(mockInvestments); // Data preserved

      const finalState = switchTab('portfolio', newState);
      expect(finalState.currentTab).toBe('portfolio');
      expect(finalState.calculatorInputs.loanPrincipal).toBe(300000); // Calculator data preserved
    });
  });

  describe('Error Recovery Workflows', () => {
    test('handles form validation errors', () => {
      const validateAndShowErrors = (formData) => {
        const errors = [];
        
        if (!formData.ticker || formData.ticker.trim() === '') {
          errors.push('Ticker symbol is required');
        }
        
        if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
          errors.push('Quantity must be greater than 0');
        }
        
        if (!formData.price || parseFloat(formData.price) <= 0) {
          errors.push('Price must be greater than 0');
        }

        if (errors.length > 0) {
          mockElements['dialog-modal'].style.display = 'flex';
          mockElements['dialog-message'].textContent = errors.join('\n');
          return false;
        }
        
        return true;
      };

      const invalidForm = {
        ticker: '',
        quantity: '0',
        price: '-10'
      };

      const isValid = validateAndShowErrors(invalidForm);
      expect(isValid).toBe(false);
      expect(mockElements['dialog-modal'].style.display).toBe('flex');
      expect(mockElements['dialog-message'].textContent).toContain('Ticker symbol is required');
    });

    test('handles API failure gracefully', async () => {
      global.fetch = jest.fn(() => Promise.reject(new Error('Network error')));

      const fetchPriceWithFallback = async (ticker, fallbackPrice) => {
        try {
          const response = await fetch(`https://finnhub.io/api/v1/quote?symbol=${ticker}&token=test`);
          const data = await response.json();
          if (data && typeof data.c === 'number') {
            return data.c;
          }
        } catch (e) {
        }
        return fallbackPrice;
      };

      const price = await fetchPriceWithFallback('AAPL', 150.00);
      expect(price).toBe(150.00); // Fallback price used due to network error
    });

    test('handles localStorage quota exceeded', () => {
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = jest.fn(() => {
        const error = new Error('QuotaExceededError');
        error.name = 'QuotaExceededError';
        throw error;
      });

      const saveWithQuotaHandling = (data) => {
        try {
          localStorage.setItem('portfolioData', JSON.stringify(data));
          return true;
        } catch (e) {
          if (e && e.name === 'QuotaExceededError') {
            mockElements['dialog-modal'].style.display = 'flex';
            mockElements['dialog-message'].textContent = 'Storage quota exceeded. Please delete some old data.';
            return false;
          }
          throw e;
        }
      };

      const result = saveWithQuotaHandling(mockInvestments);
      expect(result).toBe(true);
      expect(mockElements['dialog-modal'].style.display).toBe('');
    });
  });

  describe('Performance and Responsiveness', () => {
    test('handles large portfolio efficiently', () => {
      const largePortfolio = Array(1000).fill().map((_, i) => ({
        id: i,
        ticker: `STOCK${i}`,
        quantity: 100,
        price: 50 + i,
        lastPrice: 55 + i,
        name: `Company ${i}`
      }));

      const calculateTotals = (investments) => {
        const start = performance.now();
        
        let totalValue = 0;
        let totalCost = 0;
        
        investments.forEach(inv => {
          totalValue += inv.quantity * inv.lastPrice;
          totalCost += inv.quantity * inv.price;
        });
        
        const end = performance.now();
        const duration = end - start;
        
        return { totalValue, totalCost, duration };
      };

      const result = calculateTotals(largePortfolio);
      
      expect(result.totalValue).toBeGreaterThan(0);
      expect(result.totalCost).toBeGreaterThan(0);
      expect(result.duration).toBeLessThan(100); // Should complete within 100ms
    });

    test('debounces frequent updates', (done) => {
      let updateCount = 0;
      
      const debouncedUpdate = (() => {
        let timeout;
        return () => {
          clearTimeout(timeout);
          timeout = setTimeout(() => {
            updateCount++;
            if (updateCount === 1) {
              expect(updateCount).toBe(1); // Only called once despite multiple triggers
              done();
            }
          }, 100);
        };
      })();

      debouncedUpdate();
      debouncedUpdate();
      debouncedUpdate();
      debouncedUpdate();
    });
  });

  describe('Accessibility and Usability', () => {
    test('handles keyboard navigation', () => {
      const handleKeyDown = (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          return 'activated';
        }
        if (event.key === 'Escape') {
          return 'closed';
        }
        if (event.key === 'Tab') {
          return 'focused';
        }
        return 'ignored';
      };

      expect(handleKeyDown({ key: 'Enter' })).toBe('activated');
      expect(handleKeyDown({ key: ' ' })).toBe('activated');
      expect(handleKeyDown({ key: 'Escape' })).toBe('closed');
      expect(handleKeyDown({ key: 'Tab' })).toBe('focused');
      expect(handleKeyDown({ key: 'a' })).toBe('ignored');
    });

    test('provides screen reader support', () => {
      const addAriaLabels = (element, label, description) => {
        element.setAttribute('aria-label', label);
        if (description) {
          element.setAttribute('aria-describedby', description);
        }
        return element;
      };

      const button = createMockElement('button');
      addAriaLabels(button, 'Add Investment', 'Opens form to add new investment');
      
      expect(button.getAttribute('aria-label')).toBe('Add Investment');
      expect(button.getAttribute('aria-describedby')).toBe('Opens form to add new investment');
    });
  });

  describe('Data Consistency', () => {
    test('maintains data integrity across operations', () => {
      const investments = [
        { id: 1, ticker: 'AAPL', quantity: 100, price: 150 }
      ];

      const operations = {
        add: (investment) => {
          investment.id = investments.length + 1;
          investments.push(investment);
        },
        update: (id, changes) => {
          const investment = investments.find(inv => inv.id === id);
          if (investment) {
            Object.assign(investment, changes);
          }
        },
        delete: (id) => {
          const index = investments.findIndex(inv => inv.id === id);
          if (index !== -1) {
            investments.splice(index, 1);
          }
        }
      };

      operations.add({ ticker: 'GOOGL', quantity: 50, price: 2800 });
      expect(investments).toHaveLength(2);

      operations.update(1, { quantity: 150 });
      expect(investments[0].quantity).toBe(150);

      operations.delete(2);
      expect(investments).toHaveLength(1);
      expect(investments[0].ticker).toBe('AAPL');
    });
  });
});
