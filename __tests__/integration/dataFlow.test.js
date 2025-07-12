const { mockLocalStorage } = require('../utils/testUtils.js');
const { mockPortfolioPositions, mockInvestments } = require('../utils/mockData.js');
const { mockFinnhubAPI } = require('../utils/apiMocks.js');

describe('Data Flow Integration', () => {
  let mockStorage;

  beforeEach(() => {
    mockStorage = mockLocalStorage();
    global.localStorage = mockStorage;
    mockFinnhubAPI();
    jest.clearAllMocks();
  });

  describe('Portfolio Data Persistence', () => {
    test('saves and loads portfolio data correctly', () => {
      const STORAGE_KEY = 'portfolioData';
      const testInvestments = mockInvestments;

      localStorage.setItem(STORAGE_KEY, JSON.stringify(testInvestments));

      const loadedData = localStorage.getItem(STORAGE_KEY);
      const parsedData = JSON.parse(loadedData);

      expect(parsedData).toEqual(testInvestments);
      expect(parsedData).toHaveLength(2);
      expect(parsedData[0].ticker).toBe('AAPL');
      expect(parsedData[1].ticker).toBe('GOOGL');
    });

    test('handles data migration correctly', () => {
      const LEGACY_KEY = 'portfolioData';
      const NEW_KEY = 'pf_positions_v1';
      
      const legacyData = [
        { ticker: 'AAPL', avgPrice: 150, quantity: 100 }
      ];
      localStorage.setItem(LEGACY_KEY, JSON.stringify(legacyData));

      const migrateLegacyData = () => {
        const legacy = localStorage.getItem(LEGACY_KEY);
        if (!legacy) return [];
        
        try {
          const old = JSON.parse(legacy);
          const migrated = old.map(item => ({
            symbol: item.ticker,
            purchase_price_per_share: item.avgPrice || item.purchasePrice,
            quantity: item.quantity,
            purchase_date: new Date().toISOString().split('T')[0]
          }));
          
          localStorage.setItem(NEW_KEY, JSON.stringify(migrated));
          localStorage.removeItem(LEGACY_KEY);
          return migrated;
        } catch (e) {
          return [];
        }
      };

      const migratedData = migrateLegacyData();
      
      expect(migratedData).toHaveLength(1);
      expect(migratedData[0].symbol).toBe('AAPL');
      expect(migratedData[0].purchase_price_per_share).toBe(150);
      expect(localStorage.getItem(LEGACY_KEY)).toBeNull();
      expect(localStorage.getItem(NEW_KEY)).toBeTruthy();
    });

    test('handles storage quota exceeded', () => {
      const positions = mockPortfolioPositions;
      const snapshots = Array(1000).fill().map((_, i) => ({
        snapshot_date: `2024-01-${String(i + 1).padStart(2, '0')}`,
        total_portfolio_value: 10000 + i * 100
      }));

      const originalSetItem = localStorage.setItem;
      localStorage.setItem = jest.fn((key, value) => {
        if (key === 'test_snapshots' && value.length > 1000) {
          const error = new Error('QuotaExceededError');
          error.name = 'QuotaExceededError';
          throw error;
        }
        return originalSetItem.call(localStorage, key, value);
      });

      const saveWithQuotaHandling = (positions, snapshots) => {
        try {
          localStorage.setItem('test_positions', JSON.stringify(positions));
          localStorage.setItem('test_snapshots', JSON.stringify(snapshots));
        } catch (e) {
          if (e && e.name === 'QuotaExceededError') {
            const reducedSnapshots = snapshots.slice(-100);
            try {
              localStorage.setItem('test_snapshots', JSON.stringify(reducedSnapshots));
              return reducedSnapshots;
            } catch (err) {
              return [];
            }
          }
          throw e;
        }
        return snapshots;
      };

      const result = saveWithQuotaHandling(positions, snapshots);
      expect(result.length).toBeLessThanOrEqual(snapshots.length);
    });
  });

  describe('API Integration Flow', () => {
    test('fetches and updates stock prices', async () => {
      const investments = [
        { ticker: 'AAPL', quantity: 100, purchasePrice: 150, lastPrice: 150 }
      ];

      const fetchAndUpdatePrices = async (investments) => {
        const updates = await Promise.all(
          investments.map(async (inv) => {
            try {
              const response = await fetch(`https://finnhub.io/api/v1/quote?symbol=${inv.ticker}&token=test`);
              const data = await response.json();
              if (data && typeof data.c === 'number') {
                return { ...inv, lastPrice: data.c };
              }
            } catch (e) {
            }
            return inv;
          })
        );
        return updates;
      };

      const updatedInvestments = await fetchAndUpdatePrices(investments);
      
      expect(updatedInvestments).toHaveLength(1);
      expect(updatedInvestments[0].lastPrice).toBe(175.00); // From mock API
      expect(updatedInvestments[0].ticker).toBe('AAPL');
    });

    test('handles API errors gracefully', async () => {
      global.fetch = jest.fn(() => Promise.reject(new Error('Network error')));

      const investments = [
        { ticker: 'AAPL', quantity: 100, purchasePrice: 150, lastPrice: 150 }
      ];

      const fetchAndUpdatePrices = async (investments) => {
        const updates = await Promise.all(
          investments.map(async (inv) => {
            try {
              const response = await fetch(`https://finnhub.io/api/v1/quote?symbol=${inv.ticker}&token=test`);
              const data = await response.json();
              if (data && typeof data.c === 'number') {
                return { ...inv, lastPrice: data.c };
              }
            } catch (e) {
            }
            return inv;
          })
        );
        return updates;
      };

      const updatedInvestments = await fetchAndUpdatePrices(investments);
      
      expect(updatedInvestments).toHaveLength(1);
      expect(updatedInvestments[0].lastPrice).toBe(150); // Original price maintained
    });
  });

  describe('Chart Data Updates', () => {
    test('updates charts when portfolio changes', () => {
      const investments = mockInvestments;
      
      const generateChartData = (investments) => {
        const labels = investments.map(inv => inv.ticker);
        const values = investments.map(inv => inv.quantity * inv.lastPrice);
        const total = values.reduce((a, b) => a + b, 0);
        
        const pieData = {
          labels,
          datasets: [{
            data: values,
            backgroundColor: ['#e6194b', '#3cb44b', '#ffe119']
          }]
        };

        const plPercents = investments.map(inv => {
          const cost = inv.quantity * inv.purchasePrice;
          const value = inv.quantity * inv.lastPrice;
          return cost ? ((value - cost) / cost) * 100 : 0;
        });

        const barData = {
          labels,
          datasets: [{
            data: plPercents,
            backgroundColor: ['#e6194b', '#3cb44b', '#ffe119']
          }]
        };

        return { pieData, barData, total };
      };

      const { pieData, barData, total } = generateChartData(investments);

      expect(pieData.labels).toEqual(['AAPL', 'GOOGL']);
      expect(pieData.datasets[0].data).toEqual([17500, 147500]);
      expect(total).toBe(165000);
      expect(barData.datasets[0].data[0]).toBeCloseTo(16.67, 2); // AAPL P&L%
      expect(barData.datasets[0].data[1]).toBeCloseTo(5.36, 2);  // GOOGL P&L%
    });

    test('handles empty portfolio in charts', () => {
      const investments = [];
      
      const generateChartData = (investments) => {
        const labels = investments.map(inv => inv.ticker);
        const values = investments.map(inv => inv.quantity * inv.lastPrice);
        const total = values.reduce((a, b) => a + b, 0);
        
        return { labels, values, total };
      };

      const { labels, values, total } = generateChartData(investments);

      expect(labels).toEqual([]);
      expect(values).toEqual([]);
      expect(total).toBe(0);
    });
  });

  describe('Calculator Integration', () => {
    test('calculator results update portfolio projections', () => {
      const portfolioValue = 100000;
      const annualReturn = 7; // 7%
      const years = 10;

      const calculateFutureValue = (present, rate, years) => {
        return present * Math.pow(1 + rate / 100, years);
      };

      const futureValue = calculateFutureValue(portfolioValue, annualReturn, years);
      const totalGain = futureValue - portfolioValue;

      expect(futureValue).toBeCloseTo(196715.14, 2);
      expect(totalGain).toBeCloseTo(96715.14, 2);
    });

    test('loan calculator affects investment capacity', () => {
      const monthlyIncome = 8000;
      const loanPayment = 2000;
      const expenses = 3000;
      const availableForInvestment = monthlyIncome - loanPayment - expenses;

      const calculateInvestmentCapacity = (income, loanPayment, expenses) => {
        const available = income - loanPayment - expenses;
        return Math.max(0, available);
      };

      const capacity = calculateInvestmentCapacity(monthlyIncome, loanPayment, expenses);
      expect(capacity).toBe(3000);

      const highLoanPayment = 6000;
      const reducedCapacity = calculateInvestmentCapacity(monthlyIncome, highLoanPayment, expenses);
      expect(reducedCapacity).toBe(0); // No capacity left
    });
  });

  describe('Cross-Module State Management', () => {
    test('tab switching preserves data state', () => {
      const appState = {
        currentTab: 'portfolio',
        portfolioData: mockInvestments,
        calculatorInputs: {},
        stockTrackerData: {}
      };

      const switchTab = (newTab, state) => {
        return {
          ...state,
          currentTab: newTab
        };
      };

      const newState = switchTab('calculator', appState);
      
      expect(newState.currentTab).toBe('calculator');
      expect(newState.portfolioData).toEqual(mockInvestments); // Data preserved
    });

    test('form validation across modules', () => {
      const validatePortfolioForm = (data) => {
        const errors = [];
        if (!data.ticker) errors.push('Ticker required');
        if (!data.quantity || data.quantity <= 0) errors.push('Invalid quantity');
        if (!data.price || data.price <= 0) errors.push('Invalid price');
        return errors;
      };

      const validateCalculatorForm = (data, type) => {
        const errors = [];
        if (type === 'loan') {
          if (!data.principal || data.principal <= 0) errors.push('Invalid principal');
          if (!data.rate || data.rate <= 0) errors.push('Invalid rate');
          if (!data.term || data.term <= 0) errors.push('Invalid term');
        }
        return errors;
      };

      const portfolioErrors = validatePortfolioForm({ ticker: '', quantity: 100, price: 150 });
      const calculatorErrors = validateCalculatorForm({ principal: 0, rate: 4.5, term: 30 }, 'loan');

      expect(portfolioErrors).toContain('Ticker required');
      expect(calculatorErrors).toContain('Invalid principal');
    });
  });

  describe('Error Handling and Recovery', () => {
    test('handles corrupted localStorage data', () => {
      localStorage.setItem('portfolioData', 'invalid json');

      const loadPortfolioData = () => {
        try {
          const data = localStorage.getItem('portfolioData');
          return data ? JSON.parse(data) : [];
        } catch (e) {
          return [];
        }
      };

      const result = loadPortfolioData();
      expect(result).toEqual([]);
    });

    test('handles network failures gracefully', async () => {
      global.fetch = jest.fn(() => Promise.reject(new Error('Network error')));

      const fetchWithRetry = async (url, retries = 3) => {
        for (let i = 0; i < retries; i++) {
          try {
            const response = await fetch(url);
            return response;
          } catch (error) {
            if (i === retries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
          }
        }
      };

      await expect(fetchWithRetry('https://api.example.com/data')).rejects.toThrow('Network error');
      expect(fetch).toHaveBeenCalledTimes(3); // Retried 3 times
    });
  });
});
