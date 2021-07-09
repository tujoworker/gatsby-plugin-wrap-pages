import React from 'react'
import '../styles.css'

export function wrapPagesDeep({ element }) {
  return (
    <>
      <header align="right">
        <a href="/" target="_blank">
          Repo
        </a>
      </header>
      <main>{element}</main>
    </>
  )
}
