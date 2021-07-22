const systemPath = require('path')
const chokidar = require('chokidar')
const onExit = require('signal-exit')
const { slash } = require('gatsby-core-utils')
const {
  handleWrapperScopesAndPages,
  isWrapper,
  DEFAULT_WRAPPER_NAME,
} = require('./plugin-logic')

// Global instances
globalThis.directoryRoot = null
globalThis.scopeFilesHash = null
globalThis.writeTimeout = null

exports.pluginOptionsSchema = ({ Joi }) => {
  return Joi.object({
    wrapperName: Joi.string().optional(),
  })
}

exports.onCreateWebpackConfig = ({ actions, plugins, stage }) => {
  const extendConfig = {}

  if (process.env.NODE_ENV === 'production' && stage === 'build-javascript') {
    extendConfig.optimization = {
      splitChunks: {
        cacheGroups: {
          wrappers: {
            test(module) {
              const id = module.identifier()
              return (
                new RegExp(`wrap-pages\..{2,3}$`).test(id) &&
                id.includes(globalThis.directoryRoot)
              )
            },
            name: 'wrappers',
            priority: 50,
            enforce: true,
          },
        },
      },
    }
  }

  const cacheFilePath = systemPath.resolve(
    globalThis.directoryRoot,
    '.cache/wpe-scopes.js'
  )
  actions.setWebpackConfig({
    plugins: [
      plugins.define({
        WDE_CACHE_PATH: JSON.stringify(cacheFilePath),
      }),
    ],
    ...extendConfig,
  })
}

exports.onPostBootstrap = async (
  { store, actions },
  { wrapperName = null } = {}
) => {
  const { program, pages } = store.getState()
  globalThis.directoryRoot = program.directory

  await handleWrapperScopesAndPages({
    pages,
    actions,
    wrapperName,
  })
}

exports.onCreateDevServer = (
  { store, actions, emitter },
  { wrapperName = null } = {}
) => {
  const updatePages = async ({ filterFile = null, filterDir = null }) => {
    const { pages } = store.getState()

    await handleWrapperScopesAndPages({
      pages,
      actions,
      wrapperName,
      filterFile,
      filterDir,
    })
  }

  emitter.on('CREATE_PAGE', async (action) => {
    const filterFile = slash(action.payload.component)

    // 1. check first if the new file is a wrapper
    const page = { component: filterFile }
    if (isWrapper({ page, wrapperName })) {
      // 2. we will then filter against directories
      const filterDir = systemPath.dirname(filterFile)
      await updatePages({ filterDir })
    } else {
      // 3. instead of pages
      await updatePages({ filterFile })
    }
  })

  // Because wrapper files are no pages,
  // we watch if a wrapper gets deleted from the file system (fs)
  const watchPath = systemPath.join(
    globalThis.directoryRoot,
    '**',
    wrapperName || DEFAULT_WRAPPER_NAME + '*'
  )
  const watcher = chokidar.watch(watchPath, () => {})

  watcher.on('unlink', async (path) => {
    const filterDir = systemPath.dirname(path)
    await updatePages({ filterDir })
  })

  onExit(() => {
    watcher.close()
  })
}
