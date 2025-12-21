module.exports = {
  // Use node for pure backend tests; switch to 'jsdom' for DOM-based tests
  testEnvironment: 'node',
  collectCoverage: true,
  coverageDirectory: 'coverage',
  // Point to a TS setup file (we'll add it)
  setupFilesAfterEnv: ['./jest.setup.ts'],
  // Match tests across the repo, not only in __tests__
  testMatch: ['**/?(*.)+(test).[tj]s?(x)'],
  // Use babel-jest to handle TypeScript
  transform: {
    '^.+\\.(ts|tsx)$': 'babel-jest',
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
};