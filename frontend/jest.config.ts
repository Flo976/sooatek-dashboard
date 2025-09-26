import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  dir: './'
});

const customJestConfig = {
  coverageDirectory: 'coverage',
  moduleDirectories: ['node_modules', '<rootDir>/'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'jest-environment-jsdom'
};

export default createJestConfig(customJestConfig);
