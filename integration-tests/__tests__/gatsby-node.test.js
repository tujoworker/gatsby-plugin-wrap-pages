import Joi from 'joi'
import systemPath from 'path'
import reporter from 'gatsby-cli/lib/reporter'
import {
  onCreateWebpackConfig,
  onPreBootstrap,
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
  globalThis.WPCountPlugins = 1
  globalThis.WPWrapperNames = []
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
    expect(result.error.message).toBe(
      '"wrapperName" must be one of [string, array]'
    )
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
          WP_CACHE_PATH: JSON.stringify(
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

const directory = '/absolute-root'
const config = Object.freeze({
  plugins: [
    {
      resolve: 'gatsby-plugin-wrap-pages',
      options: { __plugin_uuid: 1 },
      parentDir: directory,
    },
  ],
})
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

describe('onPreBootstrap', () => {
  const pluginOptions = {}

  it('should set directoryRoot', async () => {
    expect(globalThis.WPProgramDirectory).toBe(null)
    await onPreBootstrap(getConfig(), pluginOptions)
    expect(globalThis.WPProgramDirectory).toBe(directory)
  })

  it('should set pluginDirectory', async () => {
    pluginOptions.__plugin_uuid = 1
    expect(pluginOptions.pluginDirectory).toBe(undefined)
    await onPreBootstrap(getConfig(), pluginOptions)
    expect(pluginOptions.pluginDirectory).toBe(directory)
  })

  it('should add wrapperName to the global WPWrapperNames', async () => {
    const pluginOptions = { wrapperName: 'layout.tsx' }
    expect(globalThis.WPWrapperNames).toHaveLength(0)

    await onPreBootstrap(getConfig(), pluginOptions)
    expect(globalThis.WPWrapperNames).toHaveLength(1)

    // Second try
    await onPreBootstrap(getConfig(), pluginOptions)
    expect(globalThis.WPWrapperNames).toHaveLength(1)

    expect(globalThis.WPWrapperNames).toContain('layout.tsx')
  })
})

describe('onPostBootstrap', () => {
  const pluginOptions = {}

  it('should count the plugin instance', async () => {
    expect(globalThis.WPCountPlugins).toBe(1)
    await onPostBootstrap(getConfig(), pluginOptions)
    expect(globalThis.WPCountPlugins).toBe(2)
    await onPostBootstrap(getConfig(), pluginOptions)
    expect(globalThis.WPCountPlugins).toBe(3)
  })

  it('should call handleWrapperScopesAndPages', async () => {
    await onPostBootstrap(getConfig(), pluginOptions)
    expect(handleWrapperScopesAndPages).toBeCalledTimes(1)
    expect(handleWrapperScopesAndPages).toHaveBeenCalledWith({
      actions: {},
      pages: [],
      wrapperName: [],
    })
  })

  it('should call handleWrapperScopesAndPages with custom wrapperName', async () => {
    const pluginOptions = { wrapperName: 'layout.tsx' }
    await onPreBootstrap(getConfig(), pluginOptions)
    await onPostBootstrap(getConfig(), pluginOptions)
    expect(handleWrapperScopesAndPages).toHaveBeenCalledWith({
      actions: {},
      pages: [],
      wrapperName: ['layout.tsx'],
    })
  })

  it('should not call handleWrapperScopesAndPages when count has not reached the total', async () => {
    globalThis.WPCountPlugins = -1
    const pluginOptions = {}
    await onPostBootstrap(getConfig(), pluginOptions)
    expect(handleWrapperScopesAndPages).toBeCalledTimes(0)
  })
})
