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
globalThis.WPCountPlugins = 0
globalThis.WPWrapperNames = []

exports.pluginOptionsSchema = ({ Joi }) => {
  return Joi.object({
    wrapperName: Joi.alternatives()
      .try(Joi.string(), Joi.array().items(Joi.string()))
      .optional(),
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
        WP_CACHE_PATH: JSON.stringify(cacheFilePath),
      }),
    ],
  })
}

exports.onPreBootstrap = async ({ store }, pluginOptions) => {
  // Set globally used program directory
  const { program } = store.getState()
  globalThis.WPProgramDirectory = program.directory

  // And set the current plugin directory
  if (!pluginOptions.pluginDirectory) {
    injectPluginDirectory({ store }, pluginOptions)
  }

  // Add the wrapper name to the global list
  const { wrapperName = DEFAULT_WRAPPER_NAME } = pluginOptions
  if (wrapperName) {
    const wrapperNames = Array.isArray(wrapperName)
      ? wrapperName
      : [wrapperName]
    wrapperNames.forEach((name) => {
      if (!globalThis.WPWrapperNames.includes(name)) {
        globalThis.WPWrapperNames.push(name)
      }
    })
  }
}

exports.onPostBootstrap = async (
  { reporter, store, actions },
  pluginOptions
) => {
  // Count Plugin instances
  globalThis.WPCountPlugins++

  // Go ahead if we have reached the last one
  // We do this in case this plugin is used within several other themes
  const totalInstances = countAllPluginInstances({ store }, pluginOptions)
  if (globalThis.WPCountPlugins >= totalInstances) {
    const activity = reporter.activityTimer(
      `${chalk.yellowBright(pluginName)} finished`
    )
    activity.start()

    const { pages } = store.getState()

    await handleWrapperScopesAndPages({
      pages,
      actions,
      wrapperName: globalThis.WPWrapperNames,
    })

    activity.end()
  }
}

exports.onCreateDevServer = (
  { reporter, store, actions },
  pluginOptions
) => {
  let updateTimeout = null
  const updatePages = async ({ filterFile = null, filterDir = null }) => {
    clearTimeout(updateTimeout)
    updateTimeout = setTimeout(async () => {
      const activity = reporter.activityTimer(
        `${chalk.yellowBright(pluginName)} finished`
      )
      activity.start()

      const { pages } = store.getState()
      await handleWrapperScopesAndPages({
        pages,
        actions,
        wrapperName: globalThis.WPWrapperNames,
        filterFile,
        filterDir,
      })

      activity.end()
    }, 20)

    /*
      Why a 20 ms delay?
      If we don't delay, Gatsby does hang.
    
      When we use "writing to disk" without a delay, 
		  we get this warning:
		  
		  warn Warning: Event "xstate.after(200)#waitingMachine.ag
		  gregatingFileChanges" was sent to stopped service
		  "waitingMachine". This service has already reached its
		  final state, and will not transition.
		  Event: {"type":"xstate.after(200)#waitingMachine.aggrega
		  tingFileChanges"}
    */
  }

  // Because wrapper files are no pages,
  // we watch if a wrapper gets deleted from the file system (fs)
  const watchPaths = []
  const wrapperNames = Array.isArray(pluginOptions.wrapperName)
    ? pluginOptions.wrapperName
    : [pluginOptions.wrapperName]
  wrapperNames.forEach((name) => {
    watchPaths.push(
      systemPath.join(
        pluginOptions.pluginDirectory,
        '**',
        name ? name : DEFAULT_WRAPPER_NAME + '*'
      )
    )
  })

  const watcher = chokidar.watch(watchPaths, { ignoreInitial: true })

  watcher.on('add', (path) => {
    const filterFile = path
    const page = { component: filterFile }

    // 1. check first if the new file is a wrapper
    if (isWrapper({ page, wrapperName: globalThis.WPWrapperNames })) {
      // 2. we will then filter against directories
      const filterDir = systemPath.dirname(filterFile)
      updatePages({ filterDir })
    } else {
      // 3. instead of pages
      updatePages({ filterFile })
    }
  })

  watcher.on('unlink', (path) => {
    const filterDir = systemPath.dirname(path)
    updatePages({ filterDir })
  })

  onExit(() => {
    watcher.close()
  })
}

function countAllPluginInstances({ store }) {
  const { config } = store.getState()
  let count = 0

  config.plugins.forEach((plugin) => {
    if (plugin.resolve.endsWith(pluginName)) {
      count++
    }
  })

  return count
}

function injectPluginDirectory({ store }, pluginOptions) {
  const { config } = store.getState()

  // Inject the current plugin directory to the pluginOptions
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

// const formatter = new Intl.ListFormat('en', {
//   style: 'long',
// })
// function concatWrapperNames() {
//   return formatter.format(globalThis.WPWrapperNames)
// }
