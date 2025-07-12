# Testing Documentation

## Overview

This document describes the comprehensive automated testing infrastructure for the Personal Finance Dashboard. The testing suite covers unit tests, integration tests, and UI component tests with full CI/CD automation.

## Test Structure

### Test Organization
```
__tests__/
├── setup.js                    # Global test configuration
├── utils/                      # Test utilities and helpers
│   ├── testUtils.js            # DOM manipulation helpers
│   ├── mockData.js             # Sample data for tests
│   └── apiMocks.js             # API response mocks
├── calculator.test.js          # Financial calculation tests
├── portfolioManager.test.js    # Portfolio management tests
├── storageManager.test.js      # Data storage and persistence tests
├── uiComponents.test.js        # UI component interaction tests
└── integration/                # Integration test suites
    ├── dataFlow.test.js        # Data flow between modules
    └── userJourneys.test.js    # Complete user workflows
```

### Test Categories

#### Unit Tests
- **Calculator Module**: Tests all financial calculations (loan payments, compound interest, CAGR, DCF, P/E ratios)
- **Portfolio Manager**: Tests investment CRUD operations, aggregation, and chart generation
- **Storage Manager**: Tests data compression, validation, and localStorage operations
- **UI Components**: Tests tab management, dialog interactions, and form validation

#### Integration Tests
- **Data Flow**: Tests data persistence, API integration, and cross-module communication
- **User Journeys**: Tests complete workflows from user perspective

## Running Tests

### Local Development
```bash
# Run all tests
cd app/js && npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests for CI environment
npm run test:ci

# Debug test issues
npm run test:debug
```

### Test Coverage Targets
- **Unit Tests**: 90%+ coverage on core calculation functions
- **Integration Tests**: Cover all major user workflows
- **Overall Coverage**: Aim for 85%+ total coverage

## Test Configuration

### Jest Configuration
Located in `app/js/jest.config.js`:
- JSDOM environment for DOM testing
- Coverage reporting with HTML and LCOV formats
- Module path resolution for test utilities
- Global setup file for mocking

### Global Setup
The `__tests__/setup.js` file provides:
- Chart.js mocking for chart rendering tests
- localStorage mocking for storage tests
- Fetch API mocking for network requests
- Console mocking for clean test output
- TextEncoder/TextDecoder for JSDOM compatibility

## Test Utilities

### Mock Data (`utils/mockData.js`)
- Sample portfolio positions
- Stock price data
- API response templates
- Investment scenarios for edge case testing

### Test Helpers (`utils/testUtils.js`)
- DOM element creation utilities
- Event simulation helpers
- Form interaction utilities
- Async operation helpers
- localStorage mocking utilities

### API Mocks (`utils/apiMocks.js`)
- Finnhub API response mocking
- Network error simulation
- Timeout scenario testing
- API rate limiting simulation

## Financial Calculation Testing

### Precision Requirements
Financial calculations require high precision testing due to:
- Floating-point arithmetic limitations
- Currency rounding requirements
- Compound interest calculations
- Percentage calculations

### Test Scenarios
- **Loan Calculator**: Various loan amounts, interest rates, and terms
- **Investment Calculator**: Different investment amounts and growth rates
- **CAGR Calculator**: Multiple time periods and return scenarios
- **DCF Calculator**: Cash flow projections and discount rates
- **P/E Calculator**: Stock valuation scenarios
- **Intrinsic Value**: Graham number and dividend discount models

## CI/CD Integration

### GitHub Actions Workflow
Located in `.github/workflows/test.yml`:
- Runs on push to main/develop branches
- Runs on all pull requests
- Tests against Node.js 18.x and 20.x
- Generates coverage reports
- Uploads artifacts for debugging

### Workflow Steps
1. **Checkout**: Repository checkout with full history
2. **Setup**: Node.js environment with dependency caching
3. **Install**: Dependencies installation with `npm ci`
4. **Lint**: Code quality checks (if configured)
5. **Test**: Full test suite with coverage
6. **Upload**: Coverage reports to Codecov
7. **Archive**: Test results and coverage artifacts

## Best Practices

### Writing Tests
1. **Descriptive Names**: Use clear, descriptive test names
2. **Arrange-Act-Assert**: Follow AAA pattern for test structure
3. **Single Responsibility**: Each test should verify one specific behavior
4. **Mock External Dependencies**: Mock APIs, Chart.js, and localStorage
5. **Test Edge Cases**: Include boundary conditions and error scenarios

### Test Data
1. **Realistic Data**: Use realistic financial scenarios
2. **Edge Cases**: Test with zero, negative, and extreme values
3. **Data Isolation**: Each test should use independent data
4. **Cleanup**: Ensure tests don't affect each other

### Performance
1. **Fast Execution**: Tests should complete quickly
2. **Parallel Execution**: Leverage Jest's parallel test running
3. **Efficient Mocking**: Use lightweight mocks for external dependencies
4. **Resource Cleanup**: Properly clean up resources after tests

## Debugging Tests

### Common Issues
1. **Module Import Errors**: Ensure CommonJS syntax for Jest compatibility
2. **DOM Environment**: Verify JSDOM setup for DOM-dependent tests
3. **Async Operations**: Use proper async/await or Promise handling
4. **Mock Configuration**: Ensure mocks are properly configured and reset

### Debugging Commands
```bash
# Run specific test file
npm test -- calculator.test.js

# Run tests with verbose output
npm test -- --verbose

# Run tests with debugging
npm run test:debug

# Run single test
npm test -- --testNamePattern="specific test name"
```

## Maintenance

### Regular Tasks
1. **Update Dependencies**: Keep Jest and testing libraries current
2. **Review Coverage**: Monitor coverage reports and improve low areas
3. **Refactor Tests**: Keep tests maintainable as code evolves
4. **Performance Monitoring**: Ensure test suite remains fast

### Adding New Tests
1. **Follow Patterns**: Use existing test patterns and utilities
2. **Update Documentation**: Document new test categories or utilities
3. **Maintain Coverage**: Ensure new code includes appropriate tests
4. **CI Integration**: Verify new tests work in CI environment

## Troubleshooting

### Environment Issues
- **Node Version**: Ensure compatible Node.js version (18.x or 20.x)
- **Dependencies**: Run `npm ci` for clean dependency installation
- **Cache Issues**: Clear Jest cache with `npx jest --clearCache`

### Test Failures
- **Check Logs**: Review detailed error messages and stack traces
- **Isolate Tests**: Run failing tests individually
- **Mock Verification**: Ensure mocks are properly configured
- **Data Dependencies**: Verify test data setup and cleanup

For additional support, refer to the Jest documentation or create an issue in the repository.
