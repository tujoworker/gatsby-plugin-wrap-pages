import React from 'react'

const sharedStyles = {
  padding: '1rem',
}

export default function wrapPages({ element }) {
  return (
    <div style={{ ...sharedStyles, backgroundColor: 'Aqua' }}>{element}</div>
  )
}

export function wrapPagesDeep({ element }) {
  return (
    <div style={{ ...sharedStyles, backgroundColor: 'DeepPink' }}>
      {element}
    </div>
  )
}
