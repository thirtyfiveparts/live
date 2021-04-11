import React from 'react'
import {RecoilRoot} from 'recoil'
import RecoilizeDebugger from 'recoilize'
//import * as nodes from './store'
import {nodes} from './store'

export const Recoil: React.FC<any> = ({root, children}) => {
  return (
    <RecoilRoot>
      {/*<RecoilizeDebugger nodes={nodes} root={root} />*/}
      {children}
    </RecoilRoot>
  )
}
