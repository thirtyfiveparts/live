import React, {useEffect, useRef, useState} from 'react'
import useEventListener from '@use-it/event-listener'
import axios from 'axios'
import path from 'path'

export const IDEHelper: React.FC = ({children}) => {
  //useEventListener('mousemove', ({clientX, clientY}) => {
  //  console.log({clientX, clientY})
  //  //setCoords([clientX, clientY])
  //})

  function handleClick(e) {
    if (!e.metaKey) return // ⌘ must be pressed.
    const closestElement = e.target.closest('[data-qa-file]')
    const qaFile = closestElement?.dataset?.qaFile
    if (!qaFile) return

    const [file, line, column] = qaFile.split(':')

    // TODO(vjpr): Use local storage to choose VS Code support.
    //   See how they do it in CRA error page.

    // In each IDE, cmd+a > vmoptions > set `-Drpc.port=63341`
    //   See: https://youtrack.jetbrains.com/issue/WEB-49744
    //   The debugger setting in preferences does not change this port.

    // IntelliJ REST API.
    const ports = {
      appcode: 63340,
      clion: 63341,
      intellij: 63342,
    }

    const extName = path.extname(file)

    let app

    // TODO(vjpr): Determine when to use CLion.
    //   We should use project mappings instead. Look for an indication its a native project.
    //   Maybe check live config.
    if (['.mm', '.cpp', '.h'].includes(extName)) {
      app = 'appcode'
    } else {
      app = 'intellij'
    }

    const port = ports[app]

    const api = `http://localhost:${port}/api/file`
    const params = {file, line, column, focused: true}
    axios.get(api, {params})
    console.log('IDE navigate:', params)
  }

  return <div onClick={handleClick}>{children}</div>
}

////////////////////////////////////////////////////////////////////////////////
