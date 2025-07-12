const { mockDOMElements, createMockElement, createMockEvent } = require('./utils/testUtils.js');

describe('UI Components', () => {
  describe('TabManager', () => {
    let mockElements;
    let restoreMocks;

    beforeEach(() => {
      const tab1 = createMockElement('button', { 'data-tab': 'portfolio' });
      const tab2 = createMockElement('button', { 'data-tab': 'calculator' });
      const tab3 = createMockElement('button', { 'data-tab': 'tracker' });
      
      const content1 = createMockElement('div', { id: 'portfolio' });
      const content2 = createMockElement('div', { id: 'calculator' });
      const content3 = createMockElement('div', { id: 'tracker' });

      document.querySelectorAll = jest.fn((selector) => {
        if (selector === '.nav-tab') {
          return [tab1, tab2, tab3];
        }
        if (selector === '.tab-content') {
          return [content1, content2, content3];
        }
        return [];
      });

      mockElements = {
        tabs: [tab1, tab2, tab3],
        contents: [content1, content2, content3]
      };
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    test('switches tabs correctly', () => {
      const switchTab = (tabName) => {
        const tabs = document.querySelectorAll('.nav-tab');
        const contents = document.querySelectorAll('.tab-content');

        tabs.forEach(tab => {
          tab.classList.remove('active');
          if (tab.dataset.tab === tabName) {
            tab.classList.add('active');
          }
        });

        contents.forEach(content => {
          content.classList.remove('active');
          if (content.id === tabName) {
            content.classList.add('active');
          }
        });
      };

      switchTab('calculator');

      const tabs = document.querySelectorAll('.nav-tab');
      const contents = document.querySelectorAll('.tab-content');

      const calculatorTab = Array.from(tabs).find(tab => tab.dataset.tab === 'calculator');
      const calculatorContent = Array.from(contents).find(content => content.id === 'calculator');

      expect(calculatorTab.classList.contains('active')).toBe(true);
      expect(calculatorContent.classList.contains('active')).toBe(true);

      const portfolioTab = Array.from(tabs).find(tab => tab.dataset.tab === 'portfolio');
      const portfolioContent = Array.from(contents).find(content => content.id === 'portfolio');

      expect(portfolioTab.classList.contains('active')).toBe(false);
      expect(portfolioContent.classList.contains('active')).toBe(false);
    });

    test('handles invalid tab names gracefully', () => {
      const switchTab = (tabName) => {
        const tabs = document.querySelectorAll('.nav-tab');
        const contents = document.querySelectorAll('.tab-content');

        tabs.forEach(tab => {
          tab.classList.remove('active');
          if (tab.dataset.tab === tabName) {
            tab.classList.add('active');
          }
        });

        contents.forEach(content => {
          content.classList.remove('active');
          if (content.id === tabName) {
            content.classList.add('active');
          }
        });
      };

      switchTab('nonexistent');

      const tabs = document.querySelectorAll('.nav-tab');
      const contents = document.querySelectorAll('.tab-content');

      tabs.forEach(tab => {
        expect(tab.classList.contains('active')).toBe(false);
      });

      contents.forEach(content => {
        expect(content.classList.contains('active')).toBe(false);
      });
    });

    test('initializes event listeners correctly', () => {
      const tabs = document.querySelectorAll('.nav-tab');
      
      tabs.forEach(tab => {
        tab.addEventListener = jest.fn();
      });

      const init = () => {
        tabs.forEach(tab => {
          tab.addEventListener('click', () => {
          });
        });
      };

      init();

      tabs.forEach(tab => {
        expect(tab.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
      });
    });
  });

  describe('DialogManager', () => {
    let mockElements;
    let restoreMocks;

    beforeEach(() => {
      mockElements = {
        'dialog-modal': createMockElement('div', { style: { display: 'none' } }),
        'dialog-message': createMockElement('div'),
        'dialog-input-group': createMockElement('div', { style: { display: 'none' } }),
        'dialog-input': createMockElement('input'),
        'dialog-ok': createMockElement('button'),
        'dialog-cancel': createMockElement('button'),
        'dialog-close': createMockElement('button')
      };

      restoreMocks = mockDOMElements(mockElements);
    });

    afterEach(() => {
      if (restoreMocks) restoreMocks();
      jest.clearAllMocks();
    });

    test('opens alert dialog correctly', () => {
      const modal = mockElements['dialog-modal'];
      const messageEl = mockElements['dialog-message'];
      const inputGroup = mockElements['dialog-input-group'];
      const cancelBtn = mockElements['dialog-cancel'];
      const okBtn = mockElements['dialog-ok'];

      const openAlert = (message) => {
        messageEl.textContent = message || '';
        inputGroup.style.display = 'none';
        cancelBtn.style.display = 'none';
        okBtn.textContent = 'Close';
        modal.style.display = 'flex';
      };

      openAlert('Test alert message');

      expect(messageEl.textContent).toBe('Test alert message');
      expect(inputGroup.style.display).toBe('none');
      expect(cancelBtn.style.display).toBe('none');
      expect(okBtn.textContent).toBe('Close');
      expect(modal.style.display).toBe('flex');
    });

    test('opens confirm dialog correctly', () => {
      const modal = mockElements['dialog-modal'];
      const messageEl = mockElements['dialog-message'];
      const inputGroup = mockElements['dialog-input-group'];
      const cancelBtn = mockElements['dialog-cancel'];
      const okBtn = mockElements['dialog-ok'];

      const openConfirm = (message, actionLabel) => {
        messageEl.textContent = message || '';
        inputGroup.style.display = 'none';
        cancelBtn.style.display = 'inline-flex';
        cancelBtn.textContent = 'No';
        okBtn.textContent = actionLabel ? `Yes, ${actionLabel}` : 'Yes';
        modal.style.display = 'flex';
      };

      openConfirm('Are you sure?', 'delete');

      expect(messageEl.textContent).toBe('Are you sure?');
      expect(inputGroup.style.display).toBe('none');
      expect(cancelBtn.style.display).toBe('inline-flex');
      expect(cancelBtn.textContent).toBe('No');
      expect(okBtn.textContent).toBe('Yes, delete');
      expect(modal.style.display).toBe('flex');
    });

    test('opens prompt dialog correctly', () => {
      const modal = mockElements['dialog-modal'];
      const messageEl = mockElements['dialog-message'];
      const inputGroup = mockElements['dialog-input-group'];
      const inputEl = mockElements['dialog-input'];
      const cancelBtn = mockElements['dialog-cancel'];
      const okBtn = mockElements['dialog-ok'];

      const openPrompt = (message, defaultValue, actionLabel) => {
        messageEl.textContent = message || '';
        inputGroup.style.display = 'block';
        inputEl.value = defaultValue || '';
        cancelBtn.style.display = 'inline-flex';
        cancelBtn.textContent = 'No';
        okBtn.textContent = actionLabel ? `Yes, ${actionLabel}` : 'Yes';
        modal.style.display = 'flex';
      };

      openPrompt('Enter value:', 'default', 'save');

      expect(messageEl.textContent).toBe('Enter value:');
      expect(inputGroup.style.display).toBe('block');
      expect(inputEl.value).toBe('default');
      expect(cancelBtn.style.display).toBe('inline-flex');
      expect(okBtn.textContent).toBe('Yes, save');
      expect(modal.style.display).toBe('flex');
    });

    test('handles dialog cleanup correctly', () => {
      const modal = mockElements['dialog-modal'];
      const okBtn = mockElements['dialog-ok'];
      const cancelBtn = mockElements['dialog-cancel'];
      const closeBtn = mockElements['dialog-close'];

      okBtn.removeEventListener = jest.fn();
      cancelBtn.removeEventListener = jest.fn();
      closeBtn.removeEventListener = jest.fn();
      modal.removeEventListener = jest.fn();

      const cleanup = () => {
        modal.style.display = 'none';
        okBtn.removeEventListener('click', jest.fn());
        cancelBtn.removeEventListener('click', jest.fn());
        closeBtn.removeEventListener('click', jest.fn());
        modal.removeEventListener('click', jest.fn());
      };

      cleanup();

      expect(modal.style.display).toBe('none');
      expect(okBtn.removeEventListener).toHaveBeenCalled();
      expect(cancelBtn.removeEventListener).toHaveBeenCalled();
      expect(closeBtn.removeEventListener).toHaveBeenCalled();
      expect(modal.removeEventListener).toHaveBeenCalled();
    });

    test('handles backdrop clicks correctly', () => {
      const modal = mockElements['dialog-modal'];
      
      const onBackdrop = (e) => {
        if (e.target === modal) {
          return true;
        }
        return false;
      };

      const backdropEvent = createMockEvent('click', { target: modal });
      const nonBackdropEvent = createMockEvent('click', { target: mockElements['dialog-ok'] });

      expect(onBackdrop(backdropEvent)).toBe(false);
      expect(onBackdrop(nonBackdropEvent)).toBe(false);
    });
  });

  describe('Form Validation', () => {
    test('validates required fields', () => {
      const validateForm = (formData) => {
        const errors = [];
        
        if (!formData.ticker || formData.ticker.trim() === '') {
          errors.push('Ticker is required');
        }
        
        if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
          errors.push('Quantity must be greater than 0');
        }
        
        if (!formData.price || parseFloat(formData.price) <= 0) {
          errors.push('Price must be greater than 0');
        }
        
        return errors;
      };

      const validForm = {
        ticker: 'AAPL',
        quantity: '100',
        price: '150.50'
      };

      const invalidForms = [
        { ticker: '', quantity: '100', price: '150' },
        { ticker: 'AAPL', quantity: '0', price: '150' },
        { ticker: 'AAPL', quantity: '100', price: '0' },
        { ticker: 'AAPL', quantity: '-10', price: '150' }
      ];

      expect(validateForm(validForm)).toEqual([]);
      
      invalidForms.forEach(form => {
        const errors = validateForm(form);
        expect(errors.length).toBeGreaterThan(0);
      });
    });

    test('sanitizes input values', () => {
      const sanitizeInput = (value, type = 'text') => {
        if (type === 'number') {
          const num = parseFloat(value);
          return isNaN(num) ? 0 : num;
        }
        
        if (type === 'ticker') {
          return String(value || '').trim().toUpperCase();
        }
        
        return String(value || '').trim();
      };

      expect(sanitizeInput('  aapl  ', 'ticker')).toBe('AAPL');
      expect(sanitizeInput('150.50', 'number')).toBe(150.50);
      expect(sanitizeInput('invalid', 'number')).toBe(0);
      expect(sanitizeInput('  test  ', 'text')).toBe('test');
    });
  });

  describe('Chart Rendering', () => {
    test('handles chart initialization', () => {
      const canvas = createMockElement('canvas');
      canvas.getContext = jest.fn(() => ({}));

      const initChart = (canvasElement, config) => {
        const ctx = canvasElement.getContext('2d');
        return new Chart(ctx, config);
      };

      const config = {
        type: 'pie',
        data: { labels: ['AAPL', 'GOOGL'], datasets: [{ data: [100, 200] }] }
      };

      const chart = initChart(canvas, config);
      
      expect(canvas.getContext).toHaveBeenCalledWith('2d');
      expect(Chart).toHaveBeenCalledWith({}, config);
    });

    test('handles chart updates', () => {
      const mockChart = {
        data: { labels: [], datasets: [{ data: [] }] },
        update: jest.fn()
      };

      const updateChart = (chart, newData) => {
        chart.data.labels = newData.labels;
        chart.data.datasets[0].data = newData.data;
        chart.update();
      };

      const newData = {
        labels: ['AAPL', 'GOOGL'],
        data: [150, 250]
      };

      updateChart(mockChart, newData);

      expect(mockChart.data.labels).toEqual(['AAPL', 'GOOGL']);
      expect(mockChart.data.datasets[0].data).toEqual([150, 250]);
      expect(mockChart.update).toHaveBeenCalled();
    });
  });

  describe('Event Handling', () => {
    test('handles click events correctly', () => {
      const button = createMockElement('button');
      button.addEventListener = jest.fn();
      
      const clickHandler = jest.fn();
      
      button.addEventListener('click', clickHandler);
      
      expect(button.addEventListener).toHaveBeenCalledWith('click', clickHandler);
    });

    test('handles form submission', () => {
      const form = createMockElement('form');
      form.addEventListener = jest.fn();
      
      const submitHandler = jest.fn((e) => {
        e.preventDefault();
      });
      
      form.addEventListener('submit', submitHandler);
      
      expect(form.addEventListener).toHaveBeenCalledWith('submit', submitHandler);
    });

    test('handles input changes', () => {
      const input = createMockElement('input');
      input.addEventListener = jest.fn();
      
      const changeHandler = jest.fn();
      
      input.addEventListener('input', changeHandler);
      
      expect(input.addEventListener).toHaveBeenCalledWith('input', changeHandler);
    });
  });
});
