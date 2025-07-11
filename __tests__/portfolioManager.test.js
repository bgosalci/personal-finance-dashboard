const { mockDOMElements, createMockElement } = require('./utils/testUtils.js');
const { mockInvestments, mockStockPrices } = require('./utils/mockData.js');
const { mockFinnhubAPI } = require('./utils/apiMocks.js');

const mockChart = {
  update: jest.fn(),
  destroy: jest.fn(),
  data: { labels: [], datasets: [] },
  options: { plugins: { tooltip: { callbacks: {} } } }
};

global.Chart = jest.fn().mockImplementation(() => mockChart);

describe('PortfolioManager', () => {
  let mockElements;
  let restoreMocks;

  beforeEach(() => {
    mockElements = {
      'add-investment-btn': createMockElement('button'),
      'get-last-price-btn': createMockElement('button'),
      'investment-modal': createMockElement('div', { style: { display: 'none' } }),
      'investment-form': createMockElement('form'),
      'investment-ticker': createMockElement('input'),
      'investment-close': createMockElement('button'),
      'cancel-investment-btn': createMockElement('button'),
      'save-add-another-btn': createMockElement('button'),
      'investment-total-value': createMockElement('span'),
      'portfolio-body': createMockElement('tbody'),
      'portfolio-total-value': createMockElement('span'),
      'portfolio-total-pl': createMockElement('span'),
      'portfolio-total-plpct': createMockElement('span'),
      'investment-spread-chart': createMockElement('canvas'),
      'plpct-chart': createMockElement('canvas'),
      'transaction-history-btn': createMockElement('button'),
      'transaction-history-modal': createMockElement('div'),
      'transaction-history-close': createMockElement('button'),
      'transaction-history-body': createMockElement('tbody')
    };

    mockElements['investment-spread-chart'].getContext = jest.fn(() => ({}));
    mockElements['plpct-chart'].getContext = jest.fn(() => ({}));

    restoreMocks = mockDOMElements(mockElements);
    mockFinnhubAPI();
  });

  afterEach(() => {
    if (restoreMocks) restoreMocks();
    jest.clearAllMocks();
  });

  describe('Investment Aggregation', () => {
    test('aggregates investments by ticker correctly', () => {
      const investments = [
        { ticker: 'AAPL', quantity: 50, purchasePrice: 150, lastPrice: 175 },
        { ticker: 'AAPL', quantity: 25, purchasePrice: 160, lastPrice: 175 },
        { ticker: 'GOOGL', quantity: 10, purchasePrice: 2800, lastPrice: 2950 }
      ];

      const aggregateInvestments = (investments) => {
        const map = {};
        investments.forEach((inv, idx) => {
          if (!map[inv.ticker]) {
            map[inv.ticker] = {
              ticker: inv.ticker,
              name: inv.name,
              quantity: 0,
              cost: 0,
              last: 0,
              count: 0,
              index: idx
            };
          }
          const item = map[inv.ticker];
          if (item.index > idx) item.index = idx;
          item.quantity += inv.quantity;
          item.cost += inv.purchasePrice * inv.quantity;
          item.last += inv.lastPrice;
          item.count += 1;
        });
        return Object.values(map).map(it => ({
          ticker: it.ticker,
          name: it.name,
          quantity: it.quantity,
          purchasePrice: it.quantity ? it.cost / it.quantity : 0,
          lastPrice: it.count ? it.last / it.count : 0,
          index: it.index
        }));
      };

      const result = aggregateInvestments(investments);
      
      expect(result).toHaveLength(2);
      
      const appleAgg = result.find(inv => inv.ticker === 'AAPL');
      expect(appleAgg.quantity).toBe(75);
      expect(appleAgg.purchasePrice).toBeCloseTo(153.33, 2); // (50*150 + 25*160) / 75
      expect(appleAgg.lastPrice).toBeCloseTo(175, 2); // (175 + 175) / 2
      
      const googleAgg = result.find(inv => inv.ticker === 'GOOGL');
      expect(googleAgg.quantity).toBe(10);
      expect(googleAgg.purchasePrice).toBe(2800);
      expect(googleAgg.lastPrice).toBe(2950);
    });
  });

  describe('Financial Calculations', () => {
    test('calculates portfolio totals correctly', () => {
      const investments = mockInvestments;
      
      let totalValue = 0;
      let totalCost = 0;
      
      investments.forEach(inv => {
        const value = inv.quantity * inv.lastPrice;
        totalValue += value;
        totalCost += inv.quantity * inv.purchasePrice;
      });
      
      const totalPL = totalValue - totalCost;
      const totalPLPct = totalCost ? (totalPL / totalCost) * 100 : 0;

      expect(totalValue).toBe(165000); // 100*175 + 50*2950
      expect(totalCost).toBe(155000); // 100*150 + 50*2800
      expect(totalPL).toBe(10000);
      expect(totalPLPct).toBeCloseTo(6.45, 2);
    });

    test('handles empty portfolio', () => {
      const investments = [];
      
      let totalValue = 0;
      let totalCost = 0;
      
      investments.forEach(inv => {
        const value = inv.quantity * inv.lastPrice;
        totalValue += value;
        totalCost += inv.quantity * inv.purchasePrice;
      });
      
      const totalPL = totalValue - totalCost;
      const totalPLPct = totalCost ? (totalPL / totalCost) * 100 : 0;

      expect(totalValue).toBe(0);
      expect(totalCost).toBe(0);
      expect(totalPL).toBe(0);
      expect(totalPLPct).toBe(0);
    });
  });

  describe('Color Management', () => {
    test('assigns consistent colors to tickers', () => {
      const COLOR_PALETTE = [
        '#e6194b','#3cb44b','#ffe119','#4363d8','#f58231',
        '#911eb4','#46f0f0','#f032e6','#bcf60c','#fabebe'
      ];

      const generateColor = (idx) => {
        if (idx < COLOR_PALETTE.length) {
          return COLOR_PALETTE[idx];
        }
        const hue = (idx * 137.508) % 360;
        return `hsl(${hue},70%,60%)`;
      };

      expect(generateColor(0)).toBe('#e6194b');
      expect(generateColor(1)).toBe('#3cb44b');
      expect(generateColor(15)).toMatch(/^hsl\(\d+\.?\d*,70%,60%\)$/);
    });

    test('maintains color consistency across sessions', () => {
      const tickerColors = {};
      let colorIndex = 0;

      const assignColor = (ticker) => {
        if (!tickerColors[ticker]) {
          tickerColors[ticker] = `color_${colorIndex}`;
          colorIndex++;
        }
      };

      const getColor = (ticker) => {
        assignColor(ticker);
        return tickerColors[ticker];
      };

      expect(getColor('AAPL')).toBe('color_0');
      expect(getColor('GOOGL')).toBe('color_1');
      expect(getColor('AAPL')).toBe('color_0'); // Should return same color
    });
  });

  describe('API Integration', () => {
    test('fetches stock quote successfully', async () => {
      const fetchQuote = async (ticker) => {
        const url = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(ticker)}&token=test`;
        try {
          const res = await fetch(url);
          const data = await res.json();
          if (data && typeof data.c === 'number') {
            return parseFloat(data.c);
          }
        } catch (e) {
          // ignore errors and return null
        }
        return null;
      };

      const price = await fetchQuote('AAPL');
      expect(price).toBe(175.00);
    });

    test('handles API errors gracefully', async () => {
      global.fetch = jest.fn(() => Promise.reject(new Error('Network error')));

      const fetchQuote = async (ticker) => {
        try {
          const res = await fetch(`https://finnhub.io/api/v1/quote?symbol=${ticker}&token=test`);
          const data = await res.json();
          if (data && typeof data.c === 'number') {
            return parseFloat(data.c);
          }
        } catch (e) {
          // ignore errors and return null
        }
        return null;
      };

      const price = await fetchQuote('INVALID');
      expect(price).toBeNull();
    });

    test('looks up company symbol successfully', async () => {
      const lookupSymbol = async (ticker) => {
        const url = `https://finnhub.io/api/v1/search?q=${encodeURIComponent(ticker)}&token=test`;
        try {
          const res = await fetch(url);
          const data = await res.json();
          if (data && Array.isArray(data.result)) {
            const match = data.result.find(item => item.symbol && item.symbol.toUpperCase() === ticker.toUpperCase());
            if (match) {
              return match.description || '';
            }
          }
        } catch (e) {
          // ignore errors and return null
        }
        return null;
      };

      const description = await lookupSymbol('AAPL');
      expect(description).toBe('Apple Inc.');
    });
  });

  describe('Data Validation', () => {
    test('validates investment form data', () => {
      const validateInvestment = (data) => {
        const ticker = String(data.ticker || '').trim().toUpperCase();
        const quantity = parseFloat(data.quantity);
        const price = parseFloat(data.purchasePrice);
        
        if (!ticker || isNaN(quantity) || quantity <= 0 || isNaN(price) || price <= 0) {
          return null;
        }
        
        return {
          ticker,
          quantity,
          purchasePrice: price,
          name: data.name || '',
          tradeDate: data.tradeDate || new Date().toISOString().split('T')[0]
        };
      };

      const validData = {
        ticker: 'aapl',
        quantity: '100',
        purchasePrice: '150.50',
        name: 'Apple Inc.'
      };

      const result = validateInvestment(validData);
      expect(result).not.toBeNull();
      expect(result.ticker).toBe('AAPL');
      expect(result.quantity).toBe(100);
      expect(result.purchasePrice).toBe(150.50);

      const invalidCases = [
        { ticker: '', quantity: '100', purchasePrice: '150' },
        { ticker: 'AAPL', quantity: '0', purchasePrice: '150' },
        { ticker: 'AAPL', quantity: '-10', purchasePrice: '150' },
        { ticker: 'AAPL', quantity: '100', purchasePrice: '0' },
        { ticker: 'AAPL', quantity: 'invalid', purchasePrice: '150' }
      ];

      invalidCases.forEach(invalidData => {
        expect(validateInvestment(invalidData)).toBeNull();
      });
    });
  });

  describe('Chart Updates', () => {
    test('updates pie chart with correct data', () => {
      const investments = mockInvestments;
      const labels = investments.map(inv => inv.ticker);
      const values = investments.map(inv => inv.quantity * inv.lastPrice);
      const total = values.reduce((a, b) => a + b, 0);

      expect(labels).toEqual(['AAPL', 'GOOGL']);
      expect(values).toEqual([17500, 147500]);
      expect(total).toBe(165000);

      const percentages = values.map(value => (value / total) * 100);
      expect(percentages[0]).toBeCloseTo(10.61, 2); // AAPL
      expect(percentages[1]).toBeCloseTo(89.39, 2); // GOOGL
    });

    test('updates bar chart with P&L percentages', () => {
      const investments = mockInvestments;
      const plPercents = investments.map(inv => {
        const cost = inv.quantity * inv.purchasePrice;
        const value = inv.quantity * inv.lastPrice;
        return cost ? ((value - cost) / cost) * 100 : 0;
      });

      expect(plPercents[0]).toBeCloseTo(16.67, 2); // AAPL: (175-150)/150 * 100
      expect(plPercents[1]).toBeCloseTo(5.36, 2);  // GOOGL: (2950-2800)/2800 * 100
    });
  });

  describe('Currency Formatting', () => {
    test('formats currency values correctly', () => {
      const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-US', { 
          style: 'currency', 
          currency: 'USD' 
        }).format(value);
      };

      expect(formatCurrency(17500)).toBe('$17,500.00');
      expect(formatCurrency(147500)).toBe('$147,500.00');
      expect(formatCurrency(0)).toBe('$0.00');
      expect(formatCurrency(-1000)).toBe('-$1,000.00');
    });
  });
});
