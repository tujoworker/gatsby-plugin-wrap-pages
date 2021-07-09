import React from 'react'
import { Link } from 'gatsby'

export default function Page() {
  return (
    <>
      <p>This page is also wrapped.</p>
      <Link to="/sub-page/sub/some-id-123">
        Visit a nested (deep) wrapped page
      </Link>
    </>
  )
}
