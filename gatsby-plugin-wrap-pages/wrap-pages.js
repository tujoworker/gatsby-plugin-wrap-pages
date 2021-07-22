// eslint-disable-next-line
const WCD_SCOPES = require(WDE_CACHE_PATH)

export const wrapPageElement = (params) => {
  try {
    if (WCD_SCOPES) {
      const { WPS } = params.props.pageContext
      if (WPS) {
        for (const { hash, isSame } of WPS) {
          if (hash) {
            const scope = WCD_SCOPES[`_${hash}`]

            if (scope) {
              let name = null

              // 1. wrap current scoped pages
              if (isSame && scope.wrapPages) {
                name = 'wrapPages'
              }

              // 2. wrap current scoped and nested pages
              if (!name) {
                if (scope.wrapPagesDeep) {
                  name = 'wrapPagesDeep'
                } else if (scope.default) {
                  console.info(
                    'gatsby-plugin-wrap-pages: "export default" is not supported yet. If so, shold it wrap deep or only the current scope?'
                  )
                }
              }

              if (scope?.[name]) {
                const result = scope[name](params)
                if (result) {
                  params.element = result
                }
              }
            }
          }
        }
      }
    }
  } catch (e) {
    console.warn('gatsby-plugin-wrap-pages:', e)
  }

  return params.element
}

// NB: can probably be removed as this does not help for the "first save" issue
// delete require.cache[__filename]
