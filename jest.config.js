/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  testMatch: ['<rootDir>/src/test/*.test.ts'],
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        tsconfig: 'src/test/tsconfig.json',
        useESM: true,
      },
    ],
  },
  clearMocks: true,
  coverageDirectory: 'coverage',
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
