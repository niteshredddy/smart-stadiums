module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js'],
  testTimeout: 15000,
  verbose: true,
  haste: {
    enableSymlinks: true,
  },
  watchman: false,
};
