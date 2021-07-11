import React from 'react'
import { Link } from 'gatsby'

export default function Page() {
  return (
    <>
      <p>
        This page is wrapped with <b>three</b> wrappers.
      </p>
      <p>
        <b>NB:</b> This page is created{' '}
        <a
          target="_blank"
          rel="noreferrer"
          href="https://www.gatsbyjs.com/docs/tutorial/part-seven/"
        >
          programmatically
        </a>{' '}
        with <code>actions.createPage()</code>.
      </p>
      <pre>
        {`
// It uses this config
context: {
  wrapPageWith: '/more-examples/second-page/third-page'
}
`}
      </pre>
      <Link to="/">Restart this little toure</Link>
    </>
  )
}
