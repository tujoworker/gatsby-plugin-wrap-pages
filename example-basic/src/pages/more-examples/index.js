import React from 'react'
import { Link } from 'gatsby'

export default function Page() {
  return (
    <>
      <p>This page is wrapped.</p>
      <Link to="/more-examples/second-page">Also this one</Link>
    </>
  )
}
