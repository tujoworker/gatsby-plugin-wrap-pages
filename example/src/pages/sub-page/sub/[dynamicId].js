import React from 'react'
import { Link } from 'gatsby'

export default function Page({ dynamicId }) {
  return (
    <>
      <p>This page is wrapped by a parent wrapper.</p>
      <Link to="/more-examples">Have a look at more examples</Link>
      <p>
        It also is a dynamic page: <output>{dynamicId}</output>
      </p>
    </>
  )
}
