import React, {useEffect, useState} from 'react'
import logo from './logo.svg'
import './App.css'
import isElectron from 'is-electron'

import {channels} from '@live/electron-template-shared/constants'

const {ipcRenderer} = window

function App() {
  const [state, setState] = useState({})

  useEffect(() => {
    if (!ipcRenderer) return
    ipcRenderer.send(channels.APP_INFO)
    ipcRenderer.on(channels.APP_INFO, (event, arg) => {
      ipcRenderer.removeAllListeners(channels.APP_INFO)
      const {appName, appVersion} = arg
      setState({appName, appVersion})
    })
  })


  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo"/>
        <p>
          {JSON.stringify(state, null, 2)}
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  )
}

export default App
