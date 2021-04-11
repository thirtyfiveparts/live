import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import Root from './App'
import * as serviceWorker from './serviceWorker';

import {ApolloProvider} from 'react-apollo'
import {ApolloProvider as ApolloHooksProvider} from 'react-apollo-hooks'

import ApolloClient from 'apollo-boost'
import {BrowserRouter} from 'react-router-dom'

const client = new ApolloClient({
  uri: 'http://localhost:4000',
})

const App = () => (
  <BrowserRouter>
    <ApolloProvider client={client}>
      <ApolloHooksProvider client={client}>
        <Root />
      </ApolloHooksProvider>
    </ApolloProvider>
  </BrowserRouter>
)

ReactDOM.render(<App />, document.getElementById('root'))

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
