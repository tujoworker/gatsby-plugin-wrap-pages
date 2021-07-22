import React from 'react'
import { Link } from 'gatsby'
// import moment from 'moment'

export default function Page() {
  // console.log(moment('20111031', 'YYYYMMDD').fromNow())
  return (
    <>
      <p>
        This page is wrapped with <b>two</b> wrappers.
      </p>
      <Link to="/more-examples/second-page/third-page">One more?</Link>
    </>
  )
}
