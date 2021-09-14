// Sync object
/** @type {import('@jest/types').Config.InitialOptions} */

module.exports = {
  verbose: true, // each individual test should be reported during the run
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/__tests__/', '<rootDir>../gatsby-plugin-wrap-pages/'], // enables file watcher for gatsby-plugin-wrap-pages
  projects: [
    '<rootDir>/__tests__/',
    '<rootDir>../gatsby-plugin-wrap-pages/',
  ],
  transform: { '\\.[jt]sx?$': 'babel-jest' },
  globals: {
    WP_CACHE_PATH: require.resolve('./__mocks__/.cache/wpe-scopes.js'),
  },
}
