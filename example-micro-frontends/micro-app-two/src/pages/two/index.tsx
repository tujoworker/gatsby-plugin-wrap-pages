// @ts-ignore
import React from 'react'
// @ts-ignore
import { Link, PageProps } from 'gatsby'

export default function Page(props: PageProps) {
  return (
    <div
      style={{
        padding: '1rem',
        // backgroundColor: 'Aqua',
      }}
    >
      <h1>two</h1>
      <p>This page is wrapped with the main wrapper.</p>
      <Link to="/">Go home</Link>
    </div>
  )
}
