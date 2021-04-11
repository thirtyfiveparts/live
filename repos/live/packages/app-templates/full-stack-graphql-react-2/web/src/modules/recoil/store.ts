import {atom} from '@src/modules/recoil/index'

export const filterState = atom({
  key: 'filterState',
  default: {},
})

export const nodes = [filterState]
