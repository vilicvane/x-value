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
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageProvider: 'v8',
  coveragePathIgnorePatterns: ['/node_modules/', '<rootDir>/src/test/'],
  snapshotSerializers: [
    '<rootDir>/src/test/serializers/type-constraint-error.ts',
  ],
};
