/// <reference types="react-scripts" />

export {}

//eslint-disable-next-line node/no-unpublished-import
import {IpcRenderer} from 'electron'

declare global {
  interface Window {
    ipcRenderer: IpcRenderer
  }
}
