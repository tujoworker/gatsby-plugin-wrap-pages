const systemPath = require('path')
const chokidar = require('chokidar')
const chalk = require('chalk')
const onExit = require('signal-exit')
const {
  handleWrapperScopesAndPages,
  isWrapper,
  DEFAULT_WRAPPER_NAME,
} = require('./plugin-logic')
const { name: pluginName } = require('./package.json')

// Global instances
globalThis.WPProgramDirectory = null
globalThis.WPScopeFilesHash = null
// globalThis.WPWriteTimeout = null // deprecated

exports.pluginOptionsSchema = ({ Joi }) => {
  return Joi.object({
    wrapperName: Joi.string().optional(),
    pluginDirectory: Joi.string().optional(),
    __plugin_uuid: Joi.string().optional(), // for internal use
  })
}

exports.onCreateWebpackConfig = ({ actions, plugins }) => {
  const cacheFilePath = systemPath.resolve(
    globalThis.WPProgramDirectory,
    '.cache/wpe-scopes.js'
  )
  actions.setWebpackConfig({
    plugins: [
      plugins.define({
        WDE_CACHE_PATH: JSON.stringify(cacheFilePath),
      }),
    ],
  })
}

exports.onPostBootstrap = async (
  { reporter, store, actions },
  pluginOptions
) => {
  const { wrapperName = null } = pluginOptions

  const activity = reporter.activityTimer(
    `${chalk.yellowBright(pluginName)} finished, using ${
      wrapperName || DEFAULT_WRAPPER_NAME
    }`
  )
  activity.start()

  // And set the current plugin directory
  if (!pluginOptions.pluginDirectory) {
    injectPluginDirectory({ store }, pluginOptions)
  }

  // Set globally used program directory
  const { program, pages } = store.getState()
  globalThis.WPProgramDirectory = program.directory

  await handleWrapperScopesAndPages({
    pages,
    actions,
    wrapperName,
  })

  activity.end()
}

exports.onCreateDevServer = (
  { reporter, store, actions },
  pluginOptions
) => {
  const { wrapperName = null } = pluginOptions

  let updateTimeout = null
  const updatePages = async ({ filterFile = null, filterDir = null }) => {
    clearTimeout(updateTimeout)
    updateTimeout = setTimeout(async () => {
      const activity = reporter.activityTimer(
        `${chalk.yellowBright(pluginName)} finished, using ${
          wrapperName || DEFAULT_WRAPPER_NAME
        }`
      )
      activity.start()

      const { pages } = store.getState()
      await handleWrapperScopesAndPages({
        pages,
        actions,
        wrapperName,
        filterFile,
        filterDir,
      })

      activity.end()
    }, 20) // ensure we run these once
  }

  // Because wrapper files are no pages,
  // we watch if a wrapper gets deleted from the file system (fs)
  const watchPath = systemPath.join(
    pluginOptions.pluginDirectory,
    '**',
    wrapperName || DEFAULT_WRAPPER_NAME + '*'
  )
  const watcher = chokidar.watch(watchPath)

  setTimeout(() => {
    watcher?.on('add', (path) => {
      // const filterFile = slash(path)
      const filterFile = path
      const page = { component: filterFile }

      // 1. check first if the new file is a wrapper
      if (isWrapper({ page, wrapperName })) {
        // 2. we will then filter against directories
        const filterDir = systemPath.dirname(filterFile)
        updatePages({ filterDir })
      } else {
        // 3. instead of pages
        updatePages({ filterFile })
      }
    })

    watcher?.on('unlink', (path) => {
      const filterDir = systemPath.dirname(path)
      updatePages({ filterDir })
    })
  }, 100) // ensure we first listen when no changes are made

  onExit(() => {
    watcher.close()
    watcher = null
  })
}

function injectPluginDirectory({ store }, pluginOptions) {
  // Find the current plugin directory
  const { config } = store.getState()

  pluginOptions.pluginDirectory = getPlugingConfig(
    config,
    pluginOptions
  )?.parentDir
}

function getPlugingConfig(config, pluginOptions) {
  return config.plugins.find((plugin) => {
    if (
      plugin.resolve.endsWith(pluginName) &&
      plugin.options.__plugin_uuid === pluginOptions.__plugin_uuid
    ) {
      return true
    }
    return null
  })
}
