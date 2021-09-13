// @ts-ignore
import React from 'react'
// @ts-ignore
import { Link, PageProps } from 'gatsby'

export default function Page(props: PageProps) {
  return (
    <div
      style={{
        padding: '1rem',
      }}
    >
      <h1>@micro-app/two</h1>
      <p>
        This page is wrapped with both the main wrapper and a wrapper
        inside this micro app.
      </p>
      <p>This page is wrapped with the main wrapper.</p>
      <Link to="/">Go home</Link>
    </div>
  )
}
