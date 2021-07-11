import React from 'react'

const sharedStyles = {
  padding: '1rem',
}

export function wrapPages({ element }) {
  return (
    <div style={{ ...sharedStyles, backgroundColor: 'Yellow' }}>{element}</div>
  )
}
