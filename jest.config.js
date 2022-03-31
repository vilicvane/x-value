module.exports = {
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageProvider: 'v8',
  roots: ['<rootDir>/bld/test'],
  snapshotSerializers: [
    '<rootDir>/bld/test/serializers/type-constraint-error.js',
  ],
};
