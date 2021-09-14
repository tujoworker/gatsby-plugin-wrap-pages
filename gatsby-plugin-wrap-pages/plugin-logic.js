const systemPath = require('path')
const fs = require('fs-extra')
const { createContentDigest } = require('gatsby-core-utils')
const {
  pageDataExists,
  writePageData,
  readPageQueryResult,
  savePageQueryResult,
} = require('gatsby/dist/utils/page-data')

// Constants
const DEFAULT_WRAPPER_NAME = 'wrap-pages'

// Containers
globalThis.WPScopeFiles = {}
globalThis.WPScopeFilesHash = null

// Export all so we also can mock them
exports.handleWrapperScopesAndPages = handleWrapperScopesAndPages
exports.isWrapper = isWrapper
exports.convertToForwardslash = convertToForwardslash
exports.DEFAULT_WRAPPER_NAME = DEFAULT_WRAPPER_NAME

async function handleWrapperScopesAndPages(params) {
  await collectWrappers(params)
  await writeWrapperImportsCache(params)
  await updateContextInPages(params)
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
      const relativePath = convertToForwardslash(
        systemPath.relative(globalThis.WPProgramDirectory, componentPath)
      )

      // Correct plugin in plugin situation
      const correctedRelativePath = correctRelativePath(relativePath)

      page.scopeData.relativeComponentPath = relativePath
      page.scopeData.directoryPath = systemPath.dirname(relativePath)
      page.scopeData.correctedDirectoryPath = systemPath.dirname(
        correctedRelativePath
      )
      page.scopeData.relativeComponentHash =
        createContentDigest(relativePath)

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
      skipThisPage({ page, filterFile, filterDir }) ||
      isWrapper({ page, wrapperName })
    ) {
      continue
    }

    const componentPath = getPageComponent(page)

    const dirPath = systemPath.dirname(componentPath)

    const relativeDirectoryPath = convertToForwardslash(
      systemPath.relative(globalThis.WPProgramDirectory, dirPath)
    )
    const correctedDirectoryPath = correctRelativePath(
      relativeDirectoryPath
    )

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
            correctedDirectoryPath ===
            scope.scopeData.correctedDirectoryPath
          if (isSame) {
            page.context.WPS.push({ hash, isSame })
          } else {
            page.context.WPS.push({ hash })
          }
        }
      }

      if (filterFile || filterDir) {
        const publicDir = systemPath.join(
          globalThis.WPProgramDirectory,
          'public'
        )

        if (pageDataExists(publicDir, page.path)) {
          // 1. Read page context
          const result = JSON.parse(
            await readPageQueryResult(publicDir, page.path)
          )

          // 2. Update the page context
          result.pageContext.WPS = page.context.WPS

          // 3. write the page context to the cache
          await savePageQueryResult(
            globalThis.WPProgramDirectory,
            page.path,
            JSON.stringify(result)
          )

          // Ensure the page has at least an empty staticQueryHashes array
          if (!page.staticQueryHashes) {
            page.staticQueryHashes = []
          }

          // 4. update the real page context data for the effected page
          await writePageData(publicDir, page)
        }
      }
    }
  }
}

async function writeWrapperImportsCache({ filterDir }) {
  const cacheFileContent = generateWrappersToImport({ filterDir }).join(
    '\n'
  )
  const scopeFilesHash = createContentDigest(cacheFileContent)

  if (scopeFilesHash === globalThis.WPScopeFilesHash) {
    return // write only once to the file
  }
  globalThis.WPScopeFilesHash = scopeFilesHash

  const cacheFilePath = systemPath.resolve(
    globalThis.WPProgramDirectory,
    '.cache/wpe-scopes.js'
  )

  await fs.writeFile(cacheFilePath, cacheFileContent)
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
    )
  }

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
    if (componentDir.startsWith(scope.scopeData.correctedDirectoryPath)) {
      result.push(scopePath)
    }
  }

  // return result.reverse()// will this be correct as well?
  return result.sort((a, b) => (a.length > b.length ? -1 : 1))
}

function skipThisPage({ page, filterFile, filterDir }) {
  const filePath = getPageComponent(page)
  // console.log('skipThisPage', { filePath, filterFile })
  if (filterFile && filePath !== filterFile) {
    return true
  }

  const dirPath = systemPath.dirname(filePath)
  if (filterDir && !dirPath.includes(filterDir)) {
    return true
  }

  return false
}

function isWrapper({ page, wrapperName = null }) {
  if (!wrapperName) {
    wrapperName = DEFAULT_WRAPPER_NAME
  }

  if (typeof wrapperName === 'string') {
    wrapperName = [wrapperName]
  }

  const path = getPageComponent(page)

  return wrapperName.some((name) => {
    return path.includes('/' + name)
  })
}

function convertToForwardslash(path) {
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
    componentPath = convertToForwardslash(
      systemPath.resolve(
        systemPath.isAbsolute(page.context.wrapPageWith)
          ? '/'
          : globalThis.WPProgramDirectory,
        systemPath.resolve(page.context.wrapPageWith),
        systemPath.basename(componentPath)
      )
    )
  }

  return componentPath
}
