import React from 'react'
import moment from 'moment'

const sharedStyles = {
  padding: '1rem',
}

export function wrapPagesDeep({ element }) {
  console.log(moment('20111031', 'YYYYMMDD').fromNow())
  return (
    <div style={{ ...sharedStyles, backgroundColor: 'Orchid' }}>{element}</div>
  )
}
