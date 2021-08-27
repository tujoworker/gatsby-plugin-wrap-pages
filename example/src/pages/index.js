import React from 'react'
import { Link } from 'gatsby'

export default function Page() {
  return (
    <div
      style={{
        padding: '1rem',
      }}
    >
      <h1>Welcome to this little demo</h1>
      <p>Let's explore together several different methods of wrapping pages.</p>
      <p>
        This very first page is only wrapped with a <code>{'<main>'}</code>{' '}
        Element.
      </p>
      <Link to="/sub-page">Go ahead ...</Link>
    </div>
  )
}
