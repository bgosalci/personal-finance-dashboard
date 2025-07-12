const createMockElement = (tagName, attributes = {}) => {
  const element = document.createElement(tagName);
  Object.keys(attributes).forEach(key => {
    if (key === 'textContent') {
      element.textContent = attributes[key];
    } else if (key === 'innerHTML') {
      element.innerHTML = attributes[key];
    } else {
      element.setAttribute(key, attributes[key]);
    }
  });
  return element;
};

const createMockForm = (inputs = {}) => {
  const form = document.createElement('form');
  Object.keys(inputs).forEach(id => {
    const input = document.createElement('input');
    input.id = id;
    input.value = inputs[id];
    form.appendChild(input);
  });
  return form;
};

const mockDOMElements = (elementMap) => {
  const originalGetElementById = document.getElementById;
  document.getElementById = jest.fn((id) => {
    if (elementMap[id]) {
      return elementMap[id];
    }
    return originalGetElementById.call(document, id);
  });
  return () => {
    document.getElementById = originalGetElementById;
  };
};

const createMockEvent = (type, properties = {}) => {
  const event = new Event(type);
  Object.keys(properties).forEach(key => {
    event[key] = properties[key];
  });
  return event;
};

const waitFor = (condition, timeout = 1000) => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const check = () => {
      if (condition()) {
        resolve();
      } else if (Date.now() - startTime > timeout) {
        reject(new Error('Timeout waiting for condition'));
      } else {
        setTimeout(check, 10);
      }
    };
    check();
  });
};

const mockLocalStorage = () => {
  const store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      Object.keys(store).forEach(key => delete store[key]);
    }),
    get store() { return { ...store }; }
  };
};

module.exports = {
  createMockElement,
  createMockForm,
  mockDOMElements,
  createMockEvent,
  waitFor,
  mockLocalStorage
};
