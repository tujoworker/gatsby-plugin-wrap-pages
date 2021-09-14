import React from 'react'
import { Link } from 'gatsby'

export default function Page() {
  return (
    <>
      <p>This page is also wrapped.</p>
      <Link to="/sub-page/nested-routes">
        Visit a nested (deep) wrapped page
      </Link>
    </>
  )
}
