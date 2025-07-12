module.exports = {
  rootDir: '../..',
  testEnvironment: 'jsdom',
  moduleDirectories: ['node_modules', '<rootDir>/app/js/node_modules'],
  collectCoverage: true,
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  collectCoverageFrom: [
    '<rootDir>/app/js/**/*.js',
    '!<rootDir>/app/js/chart.umd.js',
    '!<rootDir>/app/js/node_modules/**'
  ],
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.js'],
  testMatch: [
    '<rootDir>/__tests__/**/*.test.js'
  ]
};
