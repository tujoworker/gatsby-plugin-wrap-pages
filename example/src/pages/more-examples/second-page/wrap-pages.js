import React from 'react'

const sharedStyles = {
  padding: '1rem',
}

export function wrapPagesDeep({ element }) {
  return (
    <div style={{ ...sharedStyles, backgroundColor: 'Orchid' }}>{element}</div>
  )
}
