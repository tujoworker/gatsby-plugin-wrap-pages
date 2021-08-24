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
      <p>This page is wrapped with the main wrapper.</p>
      <Link to="/dashboard/2">Go to a dynamic page</Link>
    </div>
  )
}
