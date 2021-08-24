const systemPath = require('path')
const fs = require('fs-extra')
const { createContentDigest } = require('gatsby-core-utils')
const { pageDataExists, writePageData } = require('gatsby/dist/utils/page-data')

// Constants
const DEFAULT_WRAPPER_NAME = 'wrap-pages'

// Containers
const globalScopeFiles = {}

// Export all so we also can mock them
exports.handleWrapperScopesAndPages = handleWrapperScopesAndPages
exports.isWrapper = isWrapper
exports.DEFAULT_WRAPPER_NAME = DEFAULT_WRAPPER_NAME

async function handleWrapperScopesAndPages(params) {
  await collectWrappers(params)
  await updateContextInPages(params)
  await writeWrapperImportsCache(params)
}

async function collectWrappers({
  pages,
  actions,
  wrapperName,
  filterFile,
  filterDir,
}) {
  for (const p of pages) {
    const page = p[1]

    if (skipThisPage({ page, filterFile, filterDir })) {
      continue
    }

    if (isWrapper({ page, wrapperName })) {
      actions.deletePage(page)

      page.scopeData = page.scopeData || {}
      page.scopeData.relativeComponentPath = systemPath.relative(
        globalThis.directoryRoot,
        getPageComponent(page)
      )
      page.scopeData.relativeComponentHash = createContentDigest(
        page.scopeData.relativeComponentPath
      )

      const dirPath = systemPath.dirname(getPageComponent(page))
      globalScopeFiles[dirPath] = page
    }
  }
}

async function updateContextInPages({
  pages,
  wrapperName,
  filterFile,
  filterDir,
}) {
  for (const p of pages) {
    const page = p[1]

    if (
      isWrapper({ page, wrapperName }) ||
      skipThisPage({ page, filterFile, filterDir })
    ) {
      continue
    }

    const dirPath = systemPath.dirname(getPageComponent(page))
    const scopePaths = findValidScopePaths(dirPath)
    const hasScopes = scopePaths.length > 0

    if (!hasScopes && page.context.WPS) {
      delete page.context.WPS
    }

    if (hasScopes) {
      page.context.WPS = []

      for (const scopePath of scopePaths) {
        if (globalScopeFiles[scopePath]) {
          const { relativeComponentHash: hash } =
            globalScopeFiles[scopePath].scopeData
          const isSame = dirPath === scopePath
          if (isSame) {
            page.context.WPS.push({ hash, isSame })
          } else {
            page.context.WPS.push({ hash })
          }
        }
      }

      if (filterDir || filterDir) {
        const publicDir = systemPath.join(globalThis.directoryRoot, 'public')

        if (pageDataExists(publicDir, page.path)) {
          // This is how Gatsby core finds the path to the cached page context data
          const inputFilePath = systemPath.join(
            publicDir,
            '..',
            '.cache',
            'json',
            `${page.path.replace(/\//g, '_')}.json`
          )

          if (fs.existsSync(inputFilePath)) {
            const result = await fs.readJSON(inputFilePath)
            Object.assign(result.pageContext, page.context)

            // 1. update the cache with the new page context data
            await fs.writeJSON(inputFilePath, result)

            // 2. update the real page context data for the effected page
            await writePageData(publicDir, page)
          } else {
            console.warn(
              `Could not update the page context for "${page.path}" because the pageContext data did not exists in the cache: ${inputFilePath}`
            )
          }
        }
      }
    }
  }
}

async function writeWrapperImportsCache({ filterDir }) {
  const cacheFileContent = generateWrappersToImport({ filterDir })
  const scopeFilesHash = createContentDigest(cacheFileContent)

  if (scopeFilesHash !== globalThis.scopeFilesHash) {
    globalThis.scopeFilesHash = scopeFilesHash

    const cacheFilePath = systemPath.resolve(
      globalThis.directoryRoot,
      '.cache/wpe-scopes.js'
    )

    // Delay the write process,
    // if do not delay it, unresolved modules will block future Gatsby activity
    clearTimeout(globalThis.writeTimeout)
    globalThis.writeTimeout = setTimeout(() => {
      fs.writeFile(cacheFilePath, cacheFileContent.join('\n'))

      /*
		  Also, when we use "writing to disk" without a delay, 
		  we get this warning:
		  
		  warn Warning: Event "xstate.after(200)#waitingMachine.ag
		  gregatingFileChanges" was sent to stopped service
		  "waitingMachine". This service has already reached its
		  final state, and will not transition.
		  Event: {"type":"xstate.after(200)#waitingMachine.aggrega
		  tingFileChanges"}
		*/
    }, globalThis.writeTimeoutDelay || 1e3)
  }
}

function generateWrappersToImport({ filterDir }) {
  const result = []
  for (let dirPath in globalScopeFiles) {
    const scope = globalScopeFiles[dirPath]
    if (filterDir) {
      if (!fs.existsSync(scope.component)) {
        delete globalScopeFiles[dirPath]
        continue
      }
    }
    result.push(
      `export * as _${scope.scopeData.relativeComponentHash} from '../${scope.scopeData.relativeComponentPath}';`
    )
  }

  // NB: can probably be removed as this does not help for the "first save" issue
  // result.push('\ndelete require.cache[__filename]')

  return result
}

function findValidScopePaths(componentDir) {
  const result = []
  const sep = getNodePathSep(componentDir)
  const parts = componentDir.split(sep)

  // eslint-disable-next-line
  for (const i of parts) {
    const possibleScope = parts.join(sep)

    if (globalScopeFiles[possibleScope]) {
      result.push(possibleScope)
    }

    // Bail out once we have reached the Gatsby instance root
    if (possibleScope === globalThis.directoryRoot) {
      break
    }

    parts.pop()
  }

  return result
}

function skipThisPage({ page, filterFile, filterDir }) {
  if (filterFile && getPageComponent(page) !== filterFile) {
    return true
  }

  const dirPath = systemPath.dirname(getPageComponent(page))

  if (filterDir && !dirPath.includes(filterDir)) {
    return true
  }

  return false
}

function isWrapper({ page, wrapperName = null }) {
  const sep = getNodePathSep(page.component)
  return getPageComponent(page).includes(
    sep + (wrapperName || DEFAULT_WRAPPER_NAME)
  )
}

function getPageComponent(page) {
  let wrapPageWith = page.component
  const sep = getNodePathSep(wrapPageWith)

  if (page.context && page.context.wrapPageWith) {
    wrapPageWith = systemPath.join(
      systemPath.isAbsolute(page.context.wrapPageWith)
        ? sep
        : globalThis.directoryRoot,
      page.context.wrapPageWith,
      systemPath.basename(page.component.replace(/\\/g, '/'))
    )
  }

  return wrapPageWith
}

function getNodePathSep(path) {
  return path.includes(systemPath.sep) ? systemPath.sep : '/'
}
