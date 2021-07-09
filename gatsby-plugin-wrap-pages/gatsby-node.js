const systemPath = require('path')
const fs = require('fs')
const chokidar = require('chokidar')
const { slash } = require('gatsby-core-utils')

const DEFAULT_WRAPPER_NAME = 'wrap-pages'
let ROOT_PATH = null
let pagesToAddContext = {}
let scopeFiles = {}

exports.onCreateWebpackConfig = ({ actions, plugins, store }) => {
  // const root = store.getState().program.directory
  const cacheFilePath = systemPath.resolve(ROOT_PATH, '.cache/wpe-scopes.js')
  actions.setWebpackConfig({
    plugins: [
      plugins.define({
        WDE_CACHE_PATH: JSON.stringify(cacheFilePath),
      }),
    ],
  })
}

exports.onPostBootstrap = async (
  { store, actions, createContentDigest },
  { wrapperName = null } = {}
) => {
  const { program, pages } = store.getState()
  ROOT_PATH = program.directory

  await preparePages({ pages, actions, createContentDigest, wrapperName })
}

exports.onCreateDevServer = (
  { store, actions, emitter, createContentDigest },
  { wrapperName = null } = {}
) => {
  const updatePages = async ({ filterPage = null, filterDir = null }) => {
    const { pages } = store.getState()

    await preparePages({
      pages,
      actions,
      createContentDigest,
      wrapperName,
      filterPage,
      filterDir,
    })
  }

  emitter.on('CREATE_PAGE', async (action) => {
    // const oldCache = require.cache[require.resolve(componentPath)]
    const filterPage = slash(action.payload.component)
    await updatePages({ filterPage })
  })

  const watchPath = systemPath.join(
    ROOT_PATH,
    '**',
    wrapperName || DEFAULT_WRAPPER_NAME + '*'
  )
  const watcher = chokidar.watch(watchPath, () => {})

  watcher.on('unlink', async (path) => {
    await updatePages({ filterDir: systemPath.dirname(path) })
  })

  // delay the watcher, because the "add" event gets emitted right away
  setTimeout(() => {
    watcher.on('watcher add', async (path) => {
      await updatePages({ filterDir: systemPath.dirname(path) })
    })
  }, 100)
}

async function preparePages({
  pages,
  actions,
  createContentDigest,
  wrapperName = null,
  filterPage = null,
  filterDir = null,
}) {
  for (const p of pages) {
    const page = p[1]

    if (filterPage) {
      if (page.component !== filterPage) {
        continue
      }
    }

    if (filterDir) {
      if (systemPath.dirname(page.component) !== filterDir) {
        continue
      }
    }

    if (page.component.includes(wrapperName || '/' + DEFAULT_WRAPPER_NAME)) {
      actions.deletePage(page)
      scopeFiles[systemPath.dirname(page.component)] = page
    } else {
      pagesToAddContext[page.component] = page
    }
  }

  if (filterDir) {
    for (let key in scopeFiles) {
      if (!fs.existsSync(scopeFiles[key].component)) {
        delete scopeFiles[key]
      }
    }
  }

  const wrappersImportPaths = {}

  for (const componentPath in pagesToAddContext) {
    const page = pagesToAddContext[componentPath]
    const dirPath = systemPath.dirname(page.component)

    if (filterPage) {
      if (page.component !== filterPage) {
        continue
      }
    }

    if (filterDir) {
      if (dirPath !== filterDir) {
        continue
      }
    }

    page.context.__WPE__ = page.context.__WPE__ || {}

    const scopePaths = findValidScopePaths(dirPath)

    if (scopePaths.length > 0) {
      for (const scopePath of scopePaths) {
        const isSame = dirPath === scopePath
        const wrapperPage = scopeFiles[scopePath]

        if (wrapperPage) {
          const relativeComponentPath = systemPath.relative(
            ROOT_PATH,
            wrapperPage.component
          )
          const contentDigest = createContentDigest(relativeComponentPath)
          wrappersImportPaths[contentDigest] = relativeComponentPath

          page.context.__WPE__[contentDigest] = { isSame }
        }
      }
    }
  }

  await generateCache({ wrappersImportPaths })
}

async function generateCache({ wrappersImportPaths }) {
  let cacheFileContent = ''
  for (const contentDigest in wrappersImportPaths) {
    const relativeComponentPath = wrappersImportPaths[contentDigest]
    cacheFileContent += `export * as _${contentDigest} from '../${relativeComponentPath}';\n`
  }

  const cacheFilePath = systemPath.resolve(ROOT_PATH, '.cache/wpe-scopes.js')
  await fs.writeFile(cacheFilePath, cacheFileContent)

  /**
When we use "writing to disk", we get this warning:

warn Warning: Event "xstate.after(200)#waitingMachine.ag
gregatingFileChanges" was sent to stopped service
"waitingMachine". This service has already reached its
final state, and will not transition.
Event: {"type":"xstate.after(200)#waitingMachine.aggrega
tingFileChanges"}
*/
}

function findValidScopePaths(componentDir) {
  const result = []
  const parts = componentDir.split(systemPath.sep)

  for (const i of parts) {
    const possibleScope = parts.join(systemPath.sep)

    if (scopeFiles[possibleScope]) {
      result.push(possibleScope)
    }

    // Bail out once we have reached the Gatsby instance root
    if (possibleScope === ROOT_PATH) {
      break
    }

    parts.pop()
  }

  return result
}
