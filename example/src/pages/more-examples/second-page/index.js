import React from 'react'
import { Link } from 'gatsby'

export default function Page() {
  return (
    <>
      <p>This page is wrapped with a second wrapper.</p>
      <Link to="/">Restart this little toure</Link>
    </>
  )
}
