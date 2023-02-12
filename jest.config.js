/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['src/test'],
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        tsconfig: 'src/test/tsconfig.json',
      },
    ],
  },
  clearMocks: true,
  coverageDirectory: 'coverage',
  coverageProvider: 'v8',
  coveragePathIgnorePatterns: ['node_modules/', 'src/test/'],
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
