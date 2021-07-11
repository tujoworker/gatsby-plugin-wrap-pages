import React from 'react'

export function wrapPages({ element }) {
  return <div data-testid="wrapPages-first">{element}</div>
}

export function wrapPagesDeep({ element }) {
  return <div data-testid="wrapPagesDeep-first">{element}</div>
}
