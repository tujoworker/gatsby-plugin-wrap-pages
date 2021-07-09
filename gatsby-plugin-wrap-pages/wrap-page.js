import React from 'react'

export const wrapPageElement = (params) => {
  try {
    const WCD_SCOPES = require(WDE_CACHE_PATH)
    if (WCD_SCOPES) {
      const { __WPE__ } = params.props.pageContext
      if (__WPE__) {
        for (const contentDigest in __WPE__) {
          const { isSame } = __WPE__[contentDigest]

          if (contentDigest) {
            const scope = WCD_SCOPES[`_${contentDigest}`]
            const Wrapper =
              scope?.[isSame && scope?.default ? 'default' : 'wrapPagesDeep']
            if (Wrapper) {
              params.element = <Wrapper {...params} />
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

// delete require.cache[__filename]
