/** @type {import('jest').Config} */
export default {
  transform: {},
  testMatch: ['<rootDir>/bld/test/*.test.js'],
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
  prettierPath: null,
};
