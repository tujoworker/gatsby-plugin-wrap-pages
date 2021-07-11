import React from 'react'

export function wrapPagesDeep({ element }) {
  return (
    <div data-testid="wrapPagesDeep-main">
      <header role="header">header</header>
      <main role="main">{element}</main>
    </div>
  )
}
