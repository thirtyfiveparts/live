import React from 'react'
import {IDEHelper} from '@live/react-ide-helper'
import GlobalStyles from '../tailwind/GlobalStyles'

function Root({children}) {
  return (
    <>
      <GlobalStyles />
      <IDEHelper>{children}</IDEHelper>
    </>
  )
}

export default Root
