import React from 'react'

const sharedStyles = {
  padding: '1rem',
}

export default function wrapPages({ element }) {
  return (
    <div style={{ ...sharedStyles, backgroundColor: 'Orchid' }}>{element}</div>
  )
}
