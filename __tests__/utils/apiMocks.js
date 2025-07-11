const { mockApiResponses, mockStockPrices } = require('./mockData.js');

const mockFinnhubAPI = () => {
  global.fetch = jest.fn((url) => {
    if (url.includes('/quote?symbol=')) {
      const symbol = new URL(url).searchParams.get('symbol');
      const response = mockStockPrices[symbol] || mockApiResponses.quote.error;
      
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(response)
      });
    }
    
    if (url.includes('/search?q=')) {
      const query = new URL(url).searchParams.get('q');
      const response = query === 'AAPL' 
        ? mockApiResponses.search.success 
        : mockApiResponses.search.empty;
      
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(response)
      });
    }
    
    return Promise.reject(new Error('Unknown API endpoint'));
  });
};

const mockFetchError = (errorMessage = 'Network error') => {
  global.fetch = jest.fn(() => 
    Promise.reject(new Error(errorMessage))
  );
};

const mockFetchTimeout = () => {
  global.fetch = jest.fn(() => 
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout')), 100)
    )
  );
};

const resetFetchMock = () => {
  if (global.fetch && global.fetch.mockRestore) {
    global.fetch.mockRestore();
  }
};

module.exports = {
  mockFinnhubAPI,
  mockFetchError,
  mockFetchTimeout,
  resetFetchMock
};
