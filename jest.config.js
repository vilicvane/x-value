/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/src/test/tsconfig.json',
    },
  },
  roots: ['<rootDir>/src/test'],
  clearMocks: true,
  coverageDirectory: 'coverage',
  coverageProvider: 'v8',
  coveragePathIgnorePatterns: ['/node_modules/', '<rootDir>/src/test/'],
  coverageThreshold: {
    global: {
      statements: 100,
      branches: 100,
      functions: 100,
      lines: 100,
    },
  },
  snapshotSerializers: [
    '<rootDir>/src/test/serializers/type-constraint-error.ts',
  ],
};
