// Sync object
/** @type {import('@jest/types').Config.InitialOptions} */

module.exports = {
  verbose: true,
  testEnvironment: 'jsdom',
  transform: { '\\.[jt]sx?$': 'babel-jest' },
  globals: {
    WDE_CACHE_PATH: require.resolve('./__mocks__/.cache/wpe-scopes.js'),
  },
}
