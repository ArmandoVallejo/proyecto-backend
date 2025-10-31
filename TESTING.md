# Testing Guide for Proyecto Backend

This project uses Jest as the testing framework with the following test types:

## Test Structure
```
tests/
├── setup.js                    # Global test configuration
├── utils/
│   ├── databaseTestUtil.js     # Database utilities for testing
│   └── mockData.js            # Mock data for tests
├── unit/
│   ├── project.model.test.js   # Unit tests for Project model
│   └── projectController.test.js # Unit tests for controller
└── integration/
    └── projectApi.test.js      # Integration tests for API endpoints
```

## Available Test Commands

```bash
# Run all tests
npm test

# Run tests in watch mode (useful during development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration
```

## Test Types

### 1. Unit Tests
- **Model Tests**: Test MongoDB schema validation, defaults, and methods
- **Controller Tests**: Test business logic with mocked dependencies

### 2. Integration Tests
- **API Tests**: Test complete HTTP endpoints with real database operations
- Uses in-memory MongoDB for isolation

## Test Features

### Database Testing
- Uses MongoDB Memory Server for isolated testing
- Automatic database setup and cleanup
- Mock data utilities for consistent test data

### Coverage Reporting
- Line coverage
- Branch coverage
- Function coverage
- Statement coverage
- HTML reports generated in `coverage/` directory

### Test Data
- Predefined mock data for consistent testing
- Utilities for creating valid and invalid test scenarios
- Automatic data seeding and cleanup

## Best Practices

1. **Test Isolation**: Each test runs with a clean database state
2. **Mock External Dependencies**: Unit tests mock database calls
3. **Real Integration Testing**: Integration tests use real database operations
4. **Comprehensive Coverage**: Tests cover happy paths, edge cases, and error scenarios
5. **Descriptive Test Names**: Clear test descriptions for better maintainability

## Running Tests

```bash
# First time setup (if not already installed)
npm install

# Run all tests
npm test

# View coverage report
npm run test:coverage
# Then open coverage/lcov-report/index.html in browser
```

## Test Examples

The test suite includes:
- ✅ Model validation tests
- ✅ CRUD operation tests  
- ✅ Error handling tests
- ✅ API endpoint tests
- ✅ Request/response validation
- ✅ Database integration tests
- ✅ Middleware integration tests

## Continuous Integration

These tests are designed to run in CI/CD pipelines. The in-memory database ensures tests can run without external dependencies.