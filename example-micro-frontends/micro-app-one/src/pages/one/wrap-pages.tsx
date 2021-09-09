// @ts-ignore
import React from 'react'
import '../../styles.css'

export function wrapPagesDeep({ element }) {
  return (
    <div
      style={{
        backgroundColor: 'DeepPink',
      }}
    >
      {element}
    </div>
  )
}
