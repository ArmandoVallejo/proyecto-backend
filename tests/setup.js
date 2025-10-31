// Global test setup
require('dotenv').config({ path: '.env.test' });

// Increase timeout for database operations
jest.setTimeout(30000);

// Mock console.log in tests to reduce noise
global.console = {
  ...console,
  // Uncomment to ignore log outputs in tests
  // log: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
};

// Global test utilities
global.testData = {
  validProject: {
    title: 'Test Project',
    description: 'A project for testing purposes',
    startDate: new Date('2025-01-01'),
    endDate: new Date('2025-12-31'),
    status: 'not started',
    tasks: [
      {
        taskName: 'Task 1',
        completed: false
      },
      {
        taskName: 'Task 2',
        completed: true
      }
    ]
  },
  invalidProject: {
    // Missing required title
    description: 'Invalid project without title',
    status: 'invalid-status'
  }
};