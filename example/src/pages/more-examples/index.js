import React from 'react'
import { Link } from 'gatsby'
// import moment from 'moment'

export default function Page() {
  // console.log(moment('20111031', 'YYYYMMDD').fromNow())
  return (
    <>
      <p>This page IS wrapped.</p>
      <Link to="/more-examples/second-page">Also this one</Link>
    </>
  )
}
