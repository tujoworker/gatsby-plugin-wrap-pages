// @ts-ignore
import React from 'react'
// @ts-ignore
import { Link, PageProps } from 'gatsby'

export default function Page(props: PageProps) {
  return (
    <div
      style={{
        padding: '1rem',
        backgroundColor: 'red',
      }}
    >
      <h1>root-app</h1>
      {/* <p>This page is wrapped with the main wrapper.</p> */}
      <Link to="/dynamic-page/2">Go to a dynamic page</Link>
      <br />
      <Link to="/one">Go to page one</Link>
      <br />
      <Link to="/two">Go to page two</Link>
      <br />
    </div>
  )
}
