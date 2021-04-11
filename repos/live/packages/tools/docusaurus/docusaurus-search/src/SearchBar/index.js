import React, {useState, useRef, useCallback, useMemo} from 'react'
import {createPortal} from 'react-dom'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import {useHistory} from '@docusaurus/router'
import {useBaseUrlUtils} from '@docusaurus/useBaseUrl'
import Link from '@docusaurus/Link'
import Head from '@docusaurus/Head'
import {DocSearchButton, useDocSearchKeyboardEvents} from '@docsearch/react'

import useSearchQuery from '@docusaurus/theme-search-algolia/src/theme/hooks/useSearchQuery'
import useAlgoliaContextualFacetFilters from '@docusaurus/theme-search-algolia/src/theme/hooks/useAlgoliaContextualFacetFilters'

let DocSearchModal = null

function Hit({hit, children}) {
  return <Link to={hit.url}>{children}</Link>
}

function ResultsFooter({state, onClose}) {
  const {generateSearchPageLink} = useSearchQuery()

  return (
    <Link to={generateSearchPageLink(state.query)} onClick={onClose}>
      See all {state.context.nbHits} results
    </Link>
  )
}

function DocSearch({contextualSearch, ...props}) {

  // vjpr
  props.appId = process.env.ALGOLIA_APPLICATION_ID ?? 'LYQRRYLD02'
  // --

  const {siteMetadata} = useDocusaurusContext()

  const contextualSearchFacetFilters = useAlgoliaContextualFacetFilters()

  const configFacetFilters = props.searchParameters?.facetFilters ?? []

  const facetFilters = contextualSearch
    ? // Merge contextual search filters with config filters
      [...contextualSearchFacetFilters, ...configFacetFilters]
    : // ... or use config facetFilters
      configFacetFilters

  // we let user override default searchParameters if he wants to
  const searchParameters = {
    ...props.searchParameters,
    facetFilters,
  }

  const {withBaseUrl} = useBaseUrlUtils()
  const history = useHistory()
  const searchButtonRef = useRef(null)
  const [isOpen, setIsOpen] = useState(false)
  const [initialQuery, setInitialQuery] = useState(null)

  const importDocSearchModalIfNeeded = useCallback(() => {
    if (DocSearchModal) {
      return Promise.resolve()
    }

    return Promise.all([
      import('@docsearch/react/modal'),
      import('@docsearch/react/style'),
      import('./styles.css'),
    ]).then(([{DocSearchModal: Modal}]) => {
      DocSearchModal = Modal
    })
  }, [])

  const onOpen = useCallback(() => {
    importDocSearchModalIfNeeded().then(() => {
      setIsOpen(true)
    })
  }, [importDocSearchModalIfNeeded, setIsOpen])

  const onClose = useCallback(() => {
    setIsOpen(false)
  }, [setIsOpen])

  const onInput = useCallback(
    event => {
      console.log('searching!')
      importDocSearchModalIfNeeded().then(() => {
        setIsOpen(true)
        setInitialQuery(event.key)
      })
    },
    [importDocSearchModalIfNeeded, setIsOpen, setInitialQuery],
  )

  const navigator = useRef({
    navigate({suggestionUrl}) {
      history.push(suggestionUrl)
    },
  }).current

  const transformItems = useRef(items => {
    return items.map(item => {
      // We transform the absolute URL into a relative URL.
      // Alternatively, we can use `new URL(item.url)` but it's not
      // supported in IE.
      const a = document.createElement('a')
      a.href = item.url

      return {
        ...item,
        url: withBaseUrl(`${a.pathname}${a.hash}`),
      }
    })
  }).current

  const resultsFooterComponent = useMemo(
    () => footerProps => <ResultsFooter {...footerProps} onClose={onClose} />,
    [onClose],
  )

  const transformSearchClient = useCallback(
    searchClient => {
      searchClient.addAlgoliaAgent('docusaurus', siteMetadata.docusaurusVersion)

      return searchClient
    },
    [siteMetadata.docusaurusVersion],
  )

  useDocSearchKeyboardEvents({
    isOpen,
    onOpen,
    onClose,
    onInput,
    searchButtonRef,
  })

  return (
    <>
      <Head>
        {/* This hints the browser that the website will load data from Algolia,
        and allows it to preconnect to the DocSearch cluster. It makes the first
        query faster, especially on mobile. */}
        <link
          rel="preconnect"
          href={`https://${props.appId}-dsn.algolia.net`}
          crossOrigin="anonymous"
        />
      </Head>

      <DocSearchButton
        onTouchStart={importDocSearchModalIfNeeded}
        onFocus={importDocSearchModalIfNeeded}
        onMouseOver={importDocSearchModalIfNeeded}
        onClick={onOpen}
        ref={searchButtonRef}
      />

      {isOpen &&
        createPortal(
          <DocSearchModal
            onClose={onClose}
            initialScrollY={window.scrollY}
            initialQuery={initialQuery}
            navigator={navigator}
            transformItems={transformItems}
            hitComponent={Hit}
            resultsFooterComponent={resultsFooterComponent}
            transformSearchClient={transformSearchClient}
            {...props}
            searchParameters={searchParameters}
          />,
          document.body,
        )}
    </>
  )
}

function SearchBar() {
  const {siteConfig} = useDocusaurusContext()
  return <DocSearch {...siteConfig.themeConfig.algolia} />
}

export default SearchBar
