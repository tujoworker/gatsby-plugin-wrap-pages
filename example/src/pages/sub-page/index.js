import React from 'react'
import { Link } from 'gatsby'

export default function Page() {
  return (
    <>
      <p>This page IS wrapped.</p>
      <Link to="/sub-page/second-page">Also this one</Link>
    </>
  )
}
