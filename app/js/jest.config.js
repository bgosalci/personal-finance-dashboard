module.exports = {
  rootDir: '../..',
  testEnvironment: 'jsdom',
  moduleDirectories: ['node_modules', '<rootDir>/app/js/node_modules'],
  testMatch: ['<rootDir>/__tests__/**/*.test.js'],
  testPathIgnorePatterns: ['/node_modules/'],
  setupFiles: ['<rootDir>/app/js/jest.setup.js'],
  collectCoverageFrom: [
    'app/js/core/**/*.js',
    'app/js/data/**/*.js',
    'app/js/features/**/*.js',
    'app/js/services/**/*.js',
    '!app/js/node_modules/**',
    '!app/js/jest.config.js'
  ]
};
