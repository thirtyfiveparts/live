import React, {Component, Suspense, useState} from 'react'
import logo from './logo.svg'
import './App.css'
import styled, {ThemeProvider, createGlobalStyle} from 'styled-components'

import remark from 'remark'
import remark2react from 'remark-react'

import gql from 'graphql-tag'
import {useQuery} from 'react-apollo-hooks'

import {Flex, Box} from '@rebass/grid'

import 'github-markdown-css/github-markdown.css'
import {Route, Switch} from 'react-router-dom'

const GlobalStyle = createGlobalStyle`
  body {
    padding: 0;
    margin: 0;
  }
`

createGlobalStyle`
	.markdown-body {
		box-sizing: border-box;
		min-width: 200px;
		max-width: 980px;
		margin: 0 auto;
		padding: 45px;
	}

	@media (max-width: 767px) {
		.markdown-body {
			padding: 15px;
		}
	}

`

const Package = styled.li`
  padding: 1em;
  background: papayawhip;
  border: 1px solid black;
  list-style-type: none;
`

const PackageList = styled.ul`
  //padding: 1em;
  //position: fixed;
  //width: 16.7rem;
  overflow-y: scroll;
  top: 0;
  bottom: 0;
  padding: 0;
  margin: 0;
`

const PackageSearch = () => {
  return <input type="text" className="input" placeholder="Search..." />
}

const Description = styled.div`
  color: gray;
`

const Packages = ({onSelect, packages}) => {
  return (
    <PackageList>
      {packages.map(pkg => {
        const {path, manifest, contents} = pkg
        return (
          <Package onClick={() => onSelect(pkg)} key={path}>
            {manifest.name}
            <Description>{manifest.description}</Description>
          </Package>
        )
      })}
    </PackageList>
  )
}

const visit = require('unist-util-visit')

function remarkLinker({pkg}) {
  console.log(pkg)
  return opts => {
    function visitor(node) {
      const {url} = node
      // if url is relative then do it
      node.url = `package#${pkg.path}/` + node.url
    }
    function transform(tree) {
      const nodeTypes = ['link', 'image', 'linkReference', 'imageReference']
      visit(tree, nodeTypes, visitor)
    }
    return transform
  }
}

const Markdown = ({pkg, contents}) => {
  return (
    <article className="markdown-body">
      {
        remark()
          .use(remarkLinker({pkg}))
          .use(remark2react)
          .processSync(contents).contents
      }
    </article>
  )
}

const query = gql`
  {
    packages {
      path
      contents
      isRepoRoot
      escapedPkgName
      manifest {
        name
        description
      }
    }
  }
`

const Wrapper = props => {
  const {showRootReadme} = props

  const {data, error, loading} = useQuery(query)
  if (error) return 'ERROR: ' + error
  if (loading) return <div>Loading...</div>

  let {packages} = data
  packages = packages || []
  const rootPackage = getRootPackage(packages)

  const initialPackage = showRootReadme ? rootPackage : null

  return <Page pkg={initialPackage} packages={packages} />
}

function getRootPackage(packages) {
  return packages.find(p => p.isRepoRoot)
}

const StyledIFrame = styled.iframe`
  border: 0;
  margin: 0;
  width: 100%;
  height: 100%;
`

function IFrame({src}) {
  return <StyledIFrame src={src}></StyledIFrame>
}

const Page = ({pkg, packages}) => {
  const [contents, setContents] = useState(pkg.contents)

  const handleSelect = pkg => {
    if (!pkg.contents) {
      setContents('# no contents')
    }
    setContents(pkg.contents)
  }

  console.log({pkg})
  //const iframeUrl = window.location.host + `/package-contents/${pkg.escapedPkgName}` +
  const iframeUrl = 'http://localhost:5000' + `/package-contents/${pkg.escapedPkgName}`

  return (
    <ThemeProvider theme={{fontFamily: 'Helvetica Neue'}}>
      <React.Fragment>
        <GlobalStyle />
        <Flex>
          <Box width={1 / 4} px={0}>
            <PackageSearch></PackageSearch>
            <Packages onSelect={handleSelect} packages={packages} />
          </Box>
          <Box width={3 / 4} px={0}>
            <IFrame src={iframeUrl}></IFrame>
            {/*<Markdown pkg={pkg} contents={contents} />*/}
          </Box>
        </Flex>
      </React.Fragment>
    </ThemeProvider>
  )
}

const App = () => {
  return (
    <Switch>
      <Route
        exact
        path="/"
        render={props => <Wrapper {...props} showRootReadme={true} />}
      />
      <Route path="/list" />
    </Switch>
  )
}

export default App
