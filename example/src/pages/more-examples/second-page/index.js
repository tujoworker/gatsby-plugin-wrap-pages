import React from 'react'
import { Link } from 'gatsby'

export default function Page() {
  return (
    <>
      <p>
        This page is wrapped with <b>two</b> wrappers.
      </p>
      <Link to="/more-examples/second-page/third-page">One more?</Link>
    </>
  )
}
