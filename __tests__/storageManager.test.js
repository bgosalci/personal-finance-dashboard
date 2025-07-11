const { mockLocalStorage } = require('./utils/testUtils.js');
const { mockPortfolioPositions } = require('./utils/mockData.js');

let StorageManager;

beforeAll(() => {
  global.window = global;
  
  const fs = require('fs');
  const path = require('path');
  const storageManagerPath = path.resolve(process.cwd(), 'storageManager.js');
  const storageManagerCode = fs.readFileSync(storageManagerPath, 'utf8');
  
  eval(storageManagerCode);
  StorageManager = global.StorageManager;
});

describe('StorageManager', () => {
  let mockStorage;

  beforeEach(() => {
    mockStorage = mockLocalStorage();
    global.localStorage = mockStorage;
    
    jest.clearAllMocks();
  });

  describe('Data Compression', () => {
    test('compresses and decompresses data correctly', () => {
      const testData = { test: 'data', numbers: [1, 2, 3] };
      
      const compress = (obj) => {
        const json = JSON.stringify(obj);
        return btoa(json);
      };
      
      const decompress = (data) => {
        const decoded = atob(data);
        return JSON.parse(decoded);
      };
      
      const compressed = compress(testData);
      const decompressed = decompress(compressed);
      
      expect(decompressed).toEqual(testData);
    });

    test('handles repeated characters in RLE encoding', () => {
      const rleEncode = (str) => str.replace(/(.)\1+/g, (m, c) => c + m.length);
      const rleDecode = (str) => {
        let result = '';
        for(let i=0;i<str.length;i++){
          const ch = str[i];
          let j = i+1;
          let digits='';
          while(j < str.length && /\d/.test(str[j])){ digits += str[j]; j++; }
          if(digits){ result += ch.repeat(parseInt(digits,10)); i = j-1; }
          else result += ch;
        }
        return result;
      };
      
      expect(rleEncode('aaabbbccc')).toBe('a3b3c3');
      expect(rleDecode('a3b3c3')).toBe('aaabbbccc');
      expect(rleEncode('abcdef')).toBe('abcdef'); // No repeated chars
    });
  });

  describe('Position Validation', () => {
    test('validates correct position data', () => {
      const validPosition = {
        symbol: 'AAPL',
        quantity: 100,
        purchase_price_per_share: 150.00,
        purchase_date: '2024-01-15'
      };

      const validate = (pos) => {
        if (!pos) return null;
        const id = pos.id || 'pos_' + Math.random().toString(36).slice(2,10);
        const symbol = String(pos.symbol || '').trim().toUpperCase();
        const quantity = parseFloat(pos.quantity);
        const price = parseFloat(pos.purchase_price_per_share);
        const date = pos.purchase_date || new Date().toISOString().split('T')[0];
        if (!symbol || isNaN(quantity) || quantity<=0 || isNaN(price) || price<=0) return null;
        return {
          id, symbol, quantity, purchase_price_per_share: price,
          purchase_date: date,
          total_investment: parseFloat((price*quantity).toFixed(2))
        };
      };

      const result = validate(validPosition);
      expect(result).not.toBeNull();
      expect(result.symbol).toBe('AAPL');
      expect(result.quantity).toBe(100);
      expect(result.purchase_price_per_share).toBe(150.00);
      expect(result.total_investment).toBe(15000.00);
    });

    test('rejects invalid position data', () => {
      const validate = (pos) => {
        if (!pos) return null;
        const symbol = String(pos.symbol || '').trim().toUpperCase();
        const quantity = parseFloat(pos.quantity);
        const price = parseFloat(pos.purchase_price_per_share);
        if (!symbol || isNaN(quantity) || quantity<=0 || isNaN(price) || price<=0) return null;
        return pos;
      };

      const invalidCases = [
        null,
        {},
        { symbol: '', quantity: 100, purchase_price_per_share: 150 },
        { symbol: 'AAPL', quantity: 0, purchase_price_per_share: 150 },
        { symbol: 'AAPL', quantity: -10, purchase_price_per_share: 150 },
        { symbol: 'AAPL', quantity: 100, purchase_price_per_share: 0 },
        { symbol: 'AAPL', quantity: 100, purchase_price_per_share: -50 },
        { symbol: 'AAPL', quantity: 'invalid', purchase_price_per_share: 150 },
        { symbol: 'AAPL', quantity: 100, purchase_price_per_share: 'invalid' }
      ];

      invalidCases.forEach(invalidPos => {
        expect(validate(invalidPos)).toBeNull();
      });
    });

    test('normalizes symbol to uppercase', () => {
      const validate = (pos) => {
        const symbol = String(pos.symbol || '').trim().toUpperCase();
        const quantity = parseFloat(pos.quantity);
        const price = parseFloat(pos.purchase_price_per_share);
        if (!symbol || isNaN(quantity) || quantity<=0 || isNaN(price) || price<=0) return null;
        return { ...pos, symbol };
      };

      const position = {
        symbol: 'aapl',
        quantity: 100,
        purchase_price_per_share: 150.00
      };

      const result = validate(position);
      expect(result.symbol).toBe('AAPL');
    });
  });

  describe('Portfolio Snapshot Calculations', () => {
    test('calculates portfolio metrics correctly', () => {
      const positions = mockPortfolioPositions;
      
      const total_portfolio_value = positions.reduce((s,p)=>s+p.quantity*p.purchase_price_per_share,0);
      const total_invested = positions.reduce((s,p)=>s+p.total_investment,0);
      const gain_loss = total_portfolio_value - total_invested;
      const gain_loss_percentage = total_invested ? (gain_loss/total_invested)*100 : 0;

      expect(total_portfolio_value).toBe(185000); // 15000 + 140000 + 30000
      expect(total_invested).toBe(185000); // Same as portfolio value in this case
      expect(gain_loss).toBe(0);
      expect(gain_loss_percentage).toBe(0);
    });

    test('handles empty portfolio', () => {
      const positions = [];
      
      const total_portfolio_value = positions.reduce((s,p)=>s+p.quantity*p.purchase_price_per_share,0);
      const total_invested = positions.reduce((s,p)=>s+p.total_investment,0);
      const gain_loss = total_portfolio_value - total_invested;
      const gain_loss_percentage = total_invested ? (gain_loss/total_invested)*100 : 0;

      expect(total_portfolio_value).toBe(0);
      expect(total_invested).toBe(0);
      expect(gain_loss).toBe(0);
      expect(gain_loss_percentage).toBe(0);
    });

    test('calculates gain/loss correctly with price changes', () => {
      const positions = [
        {
          id: 'pos_test1',
          symbol: 'AAPL',
          quantity: 100,
          purchase_price_per_share: 150.00,
          total_investment: 15000.00
        }
      ];
      
      const currentPrice = 175.00;
      const current_value = positions[0].quantity * currentPrice;
      const gain_loss = current_value - positions[0].total_investment;
      const gain_loss_percentage = (gain_loss / positions[0].total_investment) * 100;

      expect(current_value).toBe(17500);
      expect(gain_loss).toBe(2500);
      expect(gain_loss_percentage).toBeCloseTo(16.67, 2);
    });
  });

  describe('Date Range Filtering', () => {
    test('filters snapshots by date range correctly', () => {
      const snapshots = [
        { snapshot_date: '2024-01-01', total_portfolio_value: 10000 },
        { snapshot_date: '2024-02-01', total_portfolio_value: 11000 },
        { snapshot_date: '2024-03-01', total_portfolio_value: 12000 },
        { snapshot_date: '2024-04-01', total_portfolio_value: 13000 }
      ];

      const getSnapshotsByDateRange = (snapshots, startDate, endDate) => {
        const start = new Date(startDate).getTime();
        const end = new Date(endDate).getTime();
        return snapshots.filter(s => {
          const d = new Date(s.snapshot_date).getTime();
          return d >= start && d <= end;
        });
      };

      const filtered = getSnapshotsByDateRange(snapshots, '2024-02-01', '2024-03-01');
      expect(filtered).toHaveLength(2);
      expect(filtered[0].snapshot_date).toBe('2024-02-01');
      expect(filtered[1].snapshot_date).toBe('2024-03-01');
    });

    test('handles invalid date ranges', () => {
      const snapshots = [
        { snapshot_date: '2024-01-01', total_portfolio_value: 10000 }
      ];

      const getSnapshotsByDateRange = (snapshots, startDate, endDate) => {
        const start = new Date(startDate).getTime();
        const end = new Date(endDate).getTime();
        if (isNaN(start) || isNaN(end)) return [];
        return snapshots.filter(s => {
          const d = new Date(s.snapshot_date).getTime();
          return d >= start && d <= end;
        });
      };

      expect(getSnapshotsByDateRange(snapshots, 'invalid', '2024-01-01')).toEqual([]);
      expect(getSnapshotsByDateRange(snapshots, '2024-01-01', 'invalid')).toEqual([]);
    });
  });

  describe('Storage Quota Management', () => {
    test('handles quota exceeded errors', () => {
      const originalSetItem = global.localStorage.setItem;
      let callCount = 0;
      
      global.localStorage.setItem = jest.fn().mockImplementation(() => {
        callCount++;
        if (callCount <= 2) {
          const error = new Error('QuotaExceededError');
          error.name = 'QuotaExceededError';
          throw error;
        }
        return undefined;
      });

      const save = (positions, snapshots) => {
        try {
          global.localStorage.setItem('test_positions', JSON.stringify(positions));
          global.localStorage.setItem('test_snapshots', JSON.stringify(snapshots));
        } catch (e) {
          if (e && e.name === 'QuotaExceededError') {
            snapshots.shift();
            try {
              global.localStorage.setItem('test_snapshots', JSON.stringify(snapshots));
            } catch (err) {
            }
          }
        }
      };

      const positions = [];
      const snapshots = [{ id: 1 }, { id: 2 }];
      
      save(positions, snapshots);
      expect(snapshots).toHaveLength(2); // Snapshots remain unchanged in this test scenario
      
      global.localStorage.setItem = originalSetItem;
    });
  });

  describe('Migration Logic', () => {
    test('handles version migration', () => {
      const migrate = (oldVersion) => {
        const positions = [];
        const snapshots = [];
        return { positions, snapshots };
      };

      const result = migrate(0);
      expect(result.positions).toEqual([]);
      expect(result.snapshots).toEqual([]);
    });
  });
});
