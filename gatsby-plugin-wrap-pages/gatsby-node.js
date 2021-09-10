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
globalThis.WPDirectoryRoot = null
globalThis.WPScopeFilesHash = null
globalThis.WPWriteTimeout = null

exports.pluginOptionsSchema = ({ Joi }) => {
  return Joi.object({
    wrapperName: Joi.string().optional(),
  })
}

exports.onCreateWebpackConfig = ({ actions, plugins }) => {
  const cacheFilePath = systemPath.resolve(
    globalThis.WPDirectoryRoot,
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

global.WPS_flattenedPlugins = {}

exports.onPreBootstrap = async (
  { store, actions },
  { wrapperName = null } = {}
) => {
  const { program, pages, flattenedPlugins, nodesByType, config, ...rest } =
    store.getState()

  // console.log(
  //   'test\n',
  //   nodesByType,
  //   // JSON.stringify(nodesByType, null, 2),
  //   // '\n',
  //   // JSON.stringify(store, null, 2),
  //   '\n\n'
  // )
}

exports.onPostBootstrap = async (
  { store, actions },
  { wrapperName = null } = {}
) => {
  // console.log('wrapperName', wrapperName)
  const { program, pages, flattenedPlugins, nodesByType, config, ...rest } =
    store.getState()
  // console.log('rest', { flattenedPlugins }, rest)

  // console.log('nodesByType', Array.from(nodesByType))
  // console.log('SitePlugin', nodesByType.get('SitePlugin'))
  // console.log('SitePlugin', nodesByType.get('SitePage'))
  // console.log('pages', pages)

  // console.log(
  //   'test\n',
  //   nodesByType,
  //   // JSON.stringify(nodesByType, null, 2),
  //   // '\n',
  //   // JSON.stringify(store, null, 2),
  //   '\n\n'
  // )

  // console.log(
  //   'test\n',
  //   JSON.stringify(config.plugins, null, 2),
  //   '\n\n'
  // )
  //   {
  //     "resolve": "gatsby-plugin-wrap-pages",
  //     "options": {
  //       "wrapperName": "main-layout.tsx"
  //     },
  //     "parentDir":
  // "/Users/tobias/dev/repos/gatsby-plugin-wrap-pages/example-micro-frontends/root-app"

  // flattenedPlugins.forEach((plugin) => {
  //   const name = plugin.name
  //   if (
  //     // !/^(load-babel-config|webpack-theme-component-shadowing|bundle-optimisations|internal-)/.test(
  //     //   name
  //     // )
  //     name === 'gatsby-plugin-wrap-pages'
  //   ) {
  //     global.WPS_flattenedPlugins[name] = plugin
  //   }
  // })

  // console.log('global.WPS_flattenedPlugins', global.WPS_flattenedPlugins)

  // .resolve
  globalThis.WPDirectoryRoot = program.directory
  // console.log('onPostBootstrap', globalThis.WPDirectoryRoot)

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

  // console.log('globalThis.WPDirectoryRoot', globalThis.WPDirectoryRoot)

  // Because wrapper files are no pages,
  // we watch if a wrapper gets deleted from the file system (fs)
  const watchPath = systemPath.join(
    globalThis.WPDirectoryRoot,
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
