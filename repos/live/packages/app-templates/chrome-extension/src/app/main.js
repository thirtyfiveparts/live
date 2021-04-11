import React, {useEffect} from 'react'
import ReactDOM from 'react-dom'
import $ from 'jquery'
import 'arrive'
import './style.css'
import Debug from 'debug'
import {observeChanges} from '@live/chrome-extension-react-helpers'

const debug = Debug('content-script')

debug('Live Chrome Extension App Template')

////////////////////////////////////////////////////////////////////////////////

const cssNamespace = 'foo'

////////////////////////////////////////////////////////////////////////////////

function App() {
  const targetEl = '#hdtb-msb-vis'

  useEffect(() => {
    let observer
    console.log('hi')
    $(document).arrive(targetEl, function () {
      const el = $(this).get(0)
      debug('Element shown')
      observer = observeChanges(el, (mutations) => {
        // This fires when something changes in the drop down.
        // NOTE: It doesn't fire when you change the selected option.
      })
    })
    $(document).leave(targetEl, function () {
      const el = $(this).get(0)
      debug('Element removed')
      observer && observer.disconnect()
    })
  }, [targetEl])

  return <div>Hello, world!</div>
}

////////////////////////////////////////////////////////////////////////////////

const appRoot = $('<div/>')
  .attr({id: `${cssNamespace}-root`})
  .get(0)
$('body').append(appRoot)

ReactDOM.render(<App />, appRoot)
