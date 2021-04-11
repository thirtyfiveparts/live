import React from 'react'

// @ts-ignore
// eslint-disable-next-line import/no-unresolved
import OriginalFooter from '@theme-original/Footer'

export default function Footer(props) {
  return (
    <>
      <div>Before footer</div>
      <OriginalFooter {...props} />
    </>
  )
}
