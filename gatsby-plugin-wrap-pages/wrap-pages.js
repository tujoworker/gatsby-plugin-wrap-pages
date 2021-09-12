// eslint-disable-next-line
const WCD_SCOPES = require(WDE_CACHE_PATH)

// For each theme/plugin wrapPageElement gets called
// This basked helps out so we render one scope per page
let scopeBasket = {}

// We reset the basked for every new page visited, also during SSR
export const renewRenderCycle = () => {
  scopeBasket = {}
}

export const wrapPageElement = (params) => {
  try {
    if (WCD_SCOPES) {
      const { WPS } = params.props.pageContext
      if (WPS) {
        for (const { hash, isSame } of WPS) {
          if (hash && !scopeBasket[hash]) {
            // Store the current hash in the basked
            // This way we do not wrap several scopes
            scopeBasket[hash] = true

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

              // 3. run the actual render action
              if (scope?.[name]) {
                const result = scope[name](params)
                if (result) {
                  // Return the wrapped element
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
