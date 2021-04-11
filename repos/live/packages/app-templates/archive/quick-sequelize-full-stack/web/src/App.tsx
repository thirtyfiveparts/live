import React from 'react'
import './App.css'
import {
  ApolloClient,
  ApolloProvider,
  InMemoryCache,
  NormalizedCacheObject,
} from '@apollo/client'
import {Route, Switch, BrowserRouter as Router} from 'react-router-dom'
import AppLayout from './AppLayout'

const client: ApolloClient<NormalizedCacheObject> = new ApolloClient({
  uri: process.env.REACT_APP_BASE_URL,
  cache: new InMemoryCache(),
})

export default function App() {
  return (
    <ApolloProvider client={client}>
      <Router>
        <Switch>
          <Route path="/" component={AppLayout}></Route>
        </Switch>
      </Router>
    </ApolloProvider>
  )
}
