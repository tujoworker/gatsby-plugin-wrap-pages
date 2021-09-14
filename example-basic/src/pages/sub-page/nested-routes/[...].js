import React from 'react'
import { Link } from 'gatsby'

export default function Page({ params }) {
  // Just for fun, make a clean array with our dynamic nested paths
  const paths = params['*']?.split('/').filter(Boolean)

  return (
    <>
      <p>✅ This page is wrapped by a parent wrapper.</p>
      <p>
        ✅ This page also functions as a layout for nested routes: 
        <strong>
          <output>/{paths?.join('/')}</output>
        </strong>
      </p>
      <p>
        Check out <Link to="/sub-page/nested-routes/one">/one</Link> or 
        <Link to="/sub-page/nested-routes/one/two">/one/two</Link>.
      </p>
      <Link to="/more-examples">Have a look at more examples</Link>
    </>
  )
}
