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
      <h1>Welcome to this Mico Frontends Example</h1>
      <p>This page is hosted in @micro-app/home.</p>
      <p>You may visit some other pages, hosted by other apps:</p>
      <br />
      <Link to="/one">Go to page one</Link>
      <br />
      <Link to="/two">Go to page two</Link>
      <br />
      <Link to="/dynamic-page/2">Go to a dynamic page</Link>
    </div>
  )
}
