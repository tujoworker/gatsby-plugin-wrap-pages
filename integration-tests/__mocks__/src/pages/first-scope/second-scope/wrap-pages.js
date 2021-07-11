import React from 'react'

export function wrapPages({ element }) {
  return <div data-testid="wrapPages-second">{element}</div>
}

export function wrapPagesDeep({ element }) {
  return <div data-testid="wrapPagesDeep-second">{element}</div>
}
