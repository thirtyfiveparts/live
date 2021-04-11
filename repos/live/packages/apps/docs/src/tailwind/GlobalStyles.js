import React from 'react'
import {GlobalStyles} from 'twin.macro'
import {createGlobalStyle} from 'styled-components'

const MyGlobalStyles = createGlobalStyle`
  /* Global styles */
`

export default function GlobalStylesComponent() {
  return (
    <>
      {/*We disable this because it breaks default h1, h2 styles.*/}
      {/*<GlobalStyles />*/}

      <MyGlobalStyles/>
    </>
  )
}
