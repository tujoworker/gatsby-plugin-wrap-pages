const systemPath = require('path')
const fs = require('fs-extra')
const { createContentDigest } = require('gatsby-core-utils')
const { pageDataExists, writePageData } = require('gatsby/dist/utils/page-data')

// Constants
const DEFAULT_WRAPPER_NAME = 'wrap-pages'

// Containers
globalThis.WPScopeFiles = {}

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

      const componentPath = getPageComponent(page)
      const relativePath = fixBackslash(
        systemPath.relative(globalThis.WPDirectoryRoot, componentPath)
      )

      // Correct plugin in plugin situation
      const correctedRelativePath = correctRelativePath(relativePath)

      page.scopeData.relativeComponentPath = relativePath
      page.scopeData.directoryPath = systemPath.dirname(relativePath)
      page.scopeData.correctedDirectoryPath = systemPath.dirname(
        correctedRelativePath
      )
      page.scopeData.relativeComponentHash = createContentDigest(relativePath)

      globalThis.WPScopeFiles[page.scopeData.directoryPath] = page
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

    const componentPath = getPageComponent(page)
    const dirPath = systemPath.dirname(componentPath)

    const relativeDirectoryPath = systemPath.relative(
      globalThis.WPDirectoryRoot,
      dirPath
    )
    const correctedDirectoryPath = correctRelativePath(relativeDirectoryPath)

    const scopePaths = findValidScopePaths(correctedDirectoryPath)
    const hasScopes = scopePaths.length > 0

    if (!hasScopes && page.context.WPS) {
      delete page.context.WPS
    }

    if (hasScopes) {
      page.context.WPS = []

      for (const scopePath of scopePaths) {
        const scope = globalThis.WPScopeFiles[scopePath]
        if (scope) {
          const hash = scope.scopeData.relativeComponentHash

          const isSame =
            correctedDirectoryPath === scope.scopeData.correctedDirectoryPath
          if (isSame) {
            page.context.WPS.push({ hash, isSame })
          } else {
            page.context.WPS.push({ hash })
          }
        }
      }

      if (filterDir || filterDir) {
        const publicDir = systemPath.join(globalThis.WPDirectoryRoot, 'public')

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

  if (scopeFilesHash !== globalThis.WPScopeFilesHash) {
    globalThis.WPScopeFilesHash = scopeFilesHash

    const cacheFilePath = systemPath.resolve(
      globalThis.WPDirectoryRoot,
      '.cache/wpe-scopes.js'
    )

    const writeCacheToDisk = () => {
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
    }

    if (globalThis.WPWriteTimeoutDelay === 0) {
      writeCacheToDisk()
    } else {
      // Delay the write process,
      // if do not delay it, unresolved modules will block future Gatsby activity
      clearTimeout(globalThis.WPWriteTimeout)
      globalThis.WPWriteTimeout = setTimeout(
        writeCacheToDisk,
        globalThis.WPWriteTimeoutDelay || 1e3
      )
    }
  }
}

function generateWrappersToImport({ filterDir }) {
  const result = []
  for (let scopePath in globalThis.WPScopeFiles) {
    const scope = globalThis.WPScopeFiles[scopePath]

    if (filterDir) {
      if (!fs.existsSync(scope.component)) {
        delete globalThis.WPScopeFiles[scopePath]
        continue
      }
    }

    result.push(
      `export * as _${scope.scopeData.relativeComponentHash} from '../${scope.scopeData.relativeComponentPath}';`
      // ensure we always use a forwards slash when creating relative paths
    )
  }

  // NB: can probably be removed as this does not help for the "first save" issue
  // result.push('\ndelete require.cache[__filename]')

  return result
}

function findValidScopePaths(componentDir) {
  const result = []

  if (componentDir === '.cache') {
    return result
  }

  // eslint-disable-next-line
  for (const scopePath in globalThis.WPScopeFiles) {
    const scope = globalThis.WPScopeFiles[scopePath]
    if (componentDir.includes(scope.scopeData.correctedDirectoryPath)) {
      result.push(scopePath)
    }
  }

  return result
}

function skipThisPage({ page, filterFile, filterDir }) {
  const componentPath = getPageComponent(page)
  if (filterFile && componentPath !== filterFile) {
    return true
  }

  const dirPath = systemPath.dirname(componentPath)

  if (filterDir && !dirPath.includes(filterDir)) {
    return true
  }

  return false
}

function isWrapper({ page, wrapperName = null }) {
  // because we already have set a scopeData before, we skip the more expensive check
  if (page.scopeData) {
    return true
  }

  return getPageComponent(page).includes(
    '/' + (wrapperName || DEFAULT_WRAPPER_NAME)
  )
}

function fixBackslash(path) {
  if (path.includes('\\')) {
    return path.replace(/\\/g, '/')
  }
  return path
}

function correctRelativePath(path) {
  if (path.startsWith('../')) {
    return path.substr(path.indexOf('/src/') + 1)
  }
  return path
}

function getPageComponent(page) {
  let componentPath = page.component

  // Handle createPage context
  if (page.context && page.context.wrapPageWith) {
    componentPath = fixBackslash(
      systemPath.resolve(
        systemPath.isAbsolute(page.context.wrapPageWith)
          ? '/'
          : globalThis.WPDirectoryRoot,
        systemPath.resolve(page.context.wrapPageWith),
        systemPath.basename(componentPath)
      )
    )
  }

  return componentPath
}
