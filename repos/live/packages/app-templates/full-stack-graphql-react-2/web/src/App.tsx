import React from 'react'
import './antd.css'
// This is slow:
//import './antd.less'
// --
import './App.css'

import {
  ApolloClient,
  ApolloProvider,
  InMemoryCache,
  NormalizedCacheObject,
  disableFragmentWarnings,
  createHttpLink,
} from '@apollo/client'

import {BrowserRouter as Router, Route} from 'react-router-dom'
import {Switch} from 'antd'
import {IDEHelper} from '@live/react-ide-helper'
import {Recoil} from '@src/modules/recoil'
import {Routes} from '@src/routes/Routes'
import {
  QueryParamProvider,
  transformSearchStringJsonSafe,
} from 'use-query-params'
import {from, HttpLink} from '@apollo/client'
import {onError} from '@apollo/client/link/error'
import { GlobalStyles } from 'twin.macro'

const authLink = createHttpLink({
  uri: process.env.REACT_APP_BASE_URL,
  credentials: 'same-origin',
})

////////////////////////////////////////////////////////////////////////////////

// Error handling

const errorLink = onError(({graphQLErrors, networkError}) => {
  if (graphQLErrors)
    graphQLErrors.map(({message, locations, path}) =>
      console.log(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
      ),
    )

  if (networkError) console.log(`[Network error]: ${networkError}`)
})

////////////////////////////////////////////////////////////////////////////////

const client: ApolloClient<NormalizedCacheObject> = new ApolloClient({
  cache: new InMemoryCache(),
  link: from([authLink, errorLink]),
  // TODO(vjpr): Not authed error throwing exception on login unless we set this.
  // https://github.com/apollographql/apollo-client/issues/6070
  defaultOptions: {
    //mutate: {errorPolicy: 'ignore'},
    // Promises only reject on network errors.
    mutate: {errorPolicy: 'all'},
  },
  // --
})

////////////////////////////////////////////////////////////////////////////////

// Because we have the same fragment generated by `graphql-codegen`.
// See: https://github.com/dotansimha/graphql-code-generator/issues/4795
disableFragmentWarnings()

// NOTE: We only pass in `root` for Recoilize dev-tools debugger.
function App({root}) {
  return (
    <Recoil root={root}>
      <IDEHelper>
        <QueryParamProvider>
          <ApolloProvider client={client}>
            <div>
              <GlobalStyles/>
              <Router>
                <Routes></Routes>
              </Router>
            </div>
          </ApolloProvider>
        </QueryParamProvider>
      </IDEHelper>
    </Recoil>
  )
}

export default App