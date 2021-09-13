import Joi from 'joi'
import systemPath from 'path'
import reporter from 'gatsby-cli/lib/reporter'
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
  globalThis.WPProgramDirectory = null
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

    globalThis.WPProgramDirectory = '/absolute-root'
    onCreateWebpackConfig(getConfig(), pluginOptions)

    expect(setWebpackConfig).toBeCalledWith({
      plugins: [
        {
          WDE_CACHE_PATH: JSON.stringify(
            systemPath.resolve(
              globalThis.WPProgramDirectory,
              '.cache/wpe-scopes.js'
            )
          ),
        },
      ],
    })
  })
})

describe('onPostBootstrap', () => {
  const directory = '/absolute-root'
  const config = {
    plugins: [
      {
        resolve: 'gatsby-plugin-wrap-pages',
        options: { __plugin_uuid: 1 },
        parentDir: directory,
      },
    ],
  }
  const getConfig = (merge = null) => ({
    ...{
      actions: {},
      reporter,
      store: {
        getState: () => ({
          config,
          pages: [],
          program: { directory },
        }),
      },
    },
    ...merge,
  })

  const pluginOptions = {}

  it('should set directoryRoot', async () => {
    expect(globalThis.WPProgramDirectory).toBe(null)
    await onPostBootstrap(getConfig(), pluginOptions)
    expect(globalThis.WPProgramDirectory).toBe(directory)
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

  it('should set pluginDirectory', async () => {
    pluginOptions.__plugin_uuid = 1
    expect(pluginOptions.pluginDirectory).toBe(undefined)
    await onPostBootstrap(getConfig(), pluginOptions)
    expect(pluginOptions.pluginDirectory).toBe(directory)
  })
})
