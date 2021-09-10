import Joi from 'joi'
import {
  onCreateWebpackConfig,
  onPostBootstrap,
  pluginOptionsSchema,
} from 'gatsby-plugin-wrap-pages/gatsby-node'
import { handleWrapperScopesAndPages } from 'gatsby-plugin-wrap-pages/plugin-logic'

jest.mock('gatsby-plugin-wrap-pages/plugin-logic', () => ({
  __esModule: true,
  ...jest.requireActual('gatsby-plugin-wrap-pages/plugin-logic'),
  handleWrapperScopesAndPages: jest.fn(async (params) => {
    return params
  }),
}))

beforeEach(() => {
  jest.resetAllMocks()
  globalThis.WPDirectoryRoot = null
})

describe('pluginOptionsSchema', () => {
  it('should validate Joi config', () => {
    const schema = pluginOptionsSchema({ Joi })
    const config = { wrapperName: 'what-ever' }
    const result = schema.validate(config)
    expect(result).toMatchObject({ value: config })
    expect(result.error).toBe(undefined)
  })
  it('should return error when validate Joi config', () => {
    const schema = pluginOptionsSchema({ Joi })
    const config = { wrapperName: 123 }
    const result = schema.validate(config)
    expect(result.error.message).toBe('"wrapperName" must be a string')
  })
})

describe('onCreateWebpackConfig', () => {
  it('should return result from define plugin', () => {
    const setWebpackConfig = jest.fn()
    const directory = 'root/absolut/path'
    const plugins = {
      define: jest.fn((result) => result),
    }
    const getConfig = (merge = null) => ({
      ...{
        plugins,
        store: {
          getState: () => ({
            program: { directory },
          }),
        },
        actions: {
          setWebpackConfig,
        },
      },
      ...merge,
    })

    const pluginOptions = {} // wrapperName

    globalThis.WPDirectoryRoot = '/absolute-root'
    onCreateWebpackConfig(getConfig(), pluginOptions)

    expect(setWebpackConfig).toBeCalledWith({
      plugins: [
        {
          WDE_CACHE_PATH: '"/absolute-root/.cache/wpe-scopes.js"',
        },
      ],
    })
  })
})

describe('onPostBootstrap', () => {
  const directory = '/absolute-root'
  const getConfig = (merge = null) => ({
    ...{
      actions: {},
      store: {
        getState: () => ({
          pages: [],
          program: { directory },
        }),
      },
    },
    ...merge,
  })

  const pluginOptions = {}

  it('should set directoryRoot', async () => {
    expect(globalThis.WPDirectoryRoot).toBe(null)
    await onPostBootstrap(getConfig(), pluginOptions)
    expect(globalThis.WPDirectoryRoot).toBe(directory)
  })

  it('should call handleWrapperScopesAndPages', async () => {
    await onPostBootstrap(getConfig(), pluginOptions)
    expect(handleWrapperScopesAndPages).toBeCalledTimes(1)
    expect(handleWrapperScopesAndPages).toHaveBeenCalledWith({
      actions: {},
      pages: [],
      wrapperName: null,
    })
  })
})
