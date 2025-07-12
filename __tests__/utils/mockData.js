
const mockPortfolioPositions = [
  {
    id: 'pos_test1',
    symbol: 'AAPL',
    quantity: 100,
    purchase_price_per_share: 150.00,
    purchase_date: '2024-01-15',
    total_investment: 15000.00
  },
  {
    id: 'pos_test2',
    symbol: 'GOOGL',
    quantity: 50,
    purchase_price_per_share: 2800.00,
    purchase_date: '2024-02-01',
    total_investment: 140000.00
  },
  {
    id: 'pos_test3',
    symbol: 'MSFT',
    quantity: 75,
    purchase_price_per_share: 400.00,
    purchase_date: '2024-03-10',
    total_investment: 30000.00
  }
];

const mockInvestments = [
  {
    ticker: 'AAPL',
    name: 'Apple Inc.',
    quantity: 100,
    purchasePrice: 150.00,
    lastPrice: 175.00,
    tradeDate: '2024-01-15'
  },
  {
    ticker: 'GOOGL',
    name: 'Alphabet Inc.',
    quantity: 50,
    purchasePrice: 2800.00,
    lastPrice: 2950.00,
    tradeDate: '2024-02-01'
  }
];

const mockStockPrices = {
  'AAPL': {
    c: 175.00, // current price
    h: 178.50, // high
    l: 172.30, // low
    o: 174.20, // open
    pc: 173.80, // previous close
    t: 1640995200 // timestamp
  },
  'GOOGL': {
    c: 2950.00,
    h: 2975.00,
    l: 2920.00,
    o: 2940.00,
    pc: 2935.00,
    t: 1640995200
  }
};

const mockCalculatorInputs = {
  loan: {
    principal: 300000,
    rate: 4.5,
    term: 30
  },
  investment: {
    initial: 10000,
    rate: 7.0,
    years: 10
  },
  cagr: {
    beginning: 10000,
    ending: 25000,
    years: 5
  },
  dcf: {
    currentFCF: 100,
    growthRate: 5,
    terminalRate: 2,
    discountRate: 10,
    years: 10,
    shares: 1000
  },
  pe: {
    currentPrice: 150,
    eps: 8.50,
    industryPE: 18,
    growthRate: 12
  }
};

const mockApiResponses = {
  quote: {
    success: {
      c: 175.00,
      h: 178.50,
      l: 172.30,
      o: 174.20,
      pc: 173.80,
      t: 1640995200
    },
    error: {
      error: 'Invalid symbol'
    }
  },
  search: {
    success: {
      result: [
        {
          symbol: 'AAPL',
          description: 'Apple Inc.',
          displaySymbol: 'AAPL',
          type: 'Common Stock'
        }
      ]
    },
    empty: {
      result: []
    }
  }
};

const mockChartData = {
  pieChart: {
    labels: ['AAPL', 'GOOGL', 'MSFT'],
    datasets: [{
      data: [17500, 147500, 30000],
      backgroundColor: ['#e6194b', '#3cb44b', '#ffe119']
    }]
  },
  barChart: {
    labels: ['AAPL', 'GOOGL', 'MSFT'],
    datasets: [{
      data: [16.67, 5.36, -25.00],
      backgroundColor: ['#e6194b', '#3cb44b', '#ffe119']
    }]
  }
};

module.exports = {
  mockPortfolioPositions,
  mockInvestments,
  mockStockPrices,
  mockCalculatorInputs,
  mockApiResponses,
  mockChartData
};
