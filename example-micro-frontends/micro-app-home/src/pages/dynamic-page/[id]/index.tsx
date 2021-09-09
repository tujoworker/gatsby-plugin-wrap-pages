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
      <h1>dynamic page</h1>
      <p>This page is wrapped in an additional layout wrapper</p>
      <p>Dynamic Page: "{props.id}"</p>
      <Link to="/">Go home again</Link>
    </div>
  )
}
