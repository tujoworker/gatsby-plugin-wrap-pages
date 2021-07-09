import React from 'react'
import { Link } from 'gatsby'

export default function Page() {
  return (
    <div
      style={{
        padding: '1rem',
      }}
    >
      <p>This page is NOT wrapped, except with the main wrapper.</p>
      <Link to="/sub-page">Go to a wrapped page</Link>
    </div>
  )
}
