import findAndReplace from 'mdast-util-find-and-replace'
import readPkgUp from 'read-pkg-up'
import readPkg from 'read-pkg'
import visit from 'unist-util-visit'
import parseGitUrl from 'git-url-parse'

const repoRoot = process.cwd()

export default function index(opts = {}) {
  return transformer

  //////////////////////////////////////////////////////////////////////////////

  function transformer(tree) {
    visit(tree, 'link', visitor())
  }
}

////////////////////////////////////////////////////////////////////////////////

function visitor() {
  return node => {
    //const link = parse(node)
    //let children
    //let base
    //let comment

    //console.log(JSON.stringify(node, null, 2))

    const repoGroup = '(' + userGroup + ')\\/(' + projectGroup + ')'
    const rootRepoLink = new RegExp(
      '^https?:\\/\\/github\\.com\\/' + repoGroup,
      'i',
    )

    const url = node.url || ''
    const match = rootRepoLink.exec(url)

    if (!match) return

    const [a, org, repo] = match

    //label: '%E2%98%85',

    // See also: nodei.co
    // See also: https://github.com/chetanraj/awesome-github-badges

    const imageUrl = makeBadgeUrl('github/stars', org, repo, {
      label: '★',
    })

    const lastCommitUrl = makeBadgeUrl('github/last-commit', org, repo, {
      label: '✚',
    })

    function makeBadgeUrl(p, org, repo, opts) {
      opts = {style: 'flat-square', ...opts}
      const qs = makeQueryStringFromObj(opts)
      const base = 'https://img.shields.io/'
      return base + p + '/' + org + '/' + repo + '?' + qs
    }

    function makeImageTag(node, url) {
      return {
        type: 'html',
        value: `&nbsp;<img style="vertical-align:text-bottom;" src="${url}"/>`,
        position: node.position,
      }
    }

    //const imageNode = {
    //  type: 'image',
    //  url: imageUrl,
    //  title: null,
    //  alt: null,
    //  position: node.position,
    //}

    const htmlStarsNode = makeImageTag(node, imageUrl)
    const htmlLastCommitNode = makeImageTag(node, lastCommitUrl)

    // Example:
    //   <https://github.com/bigstepinc/jsonrpc-bidirectional>
    //   => [bigstepinc/jsonrpc-bidirectional](https://github.com/bigstepinc/jsonrpc-bidirectional)
    node.children[0].value = org + '/' + repo

    // TODO(vjpr): Add to parent as adjacent or there is a wierd underline.
    node.children.push(htmlStarsNode, htmlLastCommitNode)

    //  if (!link) {
    //    return
    //  }
    //
    //  comment = link.comment ? ' (comment)' : ''
    //
    //  if (link.project !== repository.project) {
    //    base = link.user + '/' + link.project
    //  } else if (link.user === repository.user) {
    //    base = ''
    //  } else {
    //    base = link.user
    //  }
    //
    //  if (link.page === 'commit') {
    //    children = []
    //
    //    if (base) {
    //      children.push({type: 'text', value: base + '@'})
    //    }
    //
    //    children.push({type: 'inlineCode', value: abbr(link.reference)})
    //
    //    if (link.comment) {
    //      children.push({type: 'text', value: comment})
    //    }
    //  } else {
    //    base += '#'
    //    children = [{type: 'text', value: base + abbr(link.reference) + comment}]
    //  }
    //
    //  node.children = children
    //}
  }
}

////////////////////////////////////////////////////////////////////////////////

function makeQueryStringFromObj(obj) {
  // TODO(vjpr): encodeURIComponent.
  return Object.entries(obj)
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join('&')
}

function readRepositoryFromPjson() {
  const pkg = readPkg.sync(repoRoot)
  //const repository = parseGitUrl(pkg.repository?.url)
  return pkg.repository.url
}

////////////////////////////////////////////////////////////////////////////////

// Constants.
const minShaLength = 7

// Abbreviate a SHA.
function abbr(sha) {
  return sha.slice(0, minShaLength)
}

////////////////////////////////////////////////////////////////////////////////

const userGroup = '[\\da-z][-\\da-z]{0,38}'
const projectGroup = '(?:\\.git[\\w-]|\\.(?!git)|[\\w-])+'
const repoGroup = '(' + userGroup + ')\\/(' + projectGroup + ')'

const linkRegex = new RegExp(
  '^https?:\\/\\/github\\.com\\/' +
    repoGroup +
    '\\/(commit|issues|pull)\\/([a-f\\d]+\\/?(?=[#?]|$))',
  'i',
)

// Parse a link and determine whether it links to GitHub.
function parse(node) {
  const url = node.url || ''
  const match = linkRegex.exec(url)

  if (
    // Not a proper URL.
    !match ||
    // Looks like formatting.
    node.children.length !== 1 ||
    node.children[0].type !== 'text' ||
    toString(node) !== url ||
    // Issues / PRs are decimal only.
    (match[3] !== 'commit' && /[a-f]/i.test(match[4])) ||
    // SHAs can be min 4, max 40 characters.
    (match[3] === 'commit' && (match[4].length < 4 || match[4].length > 40)) ||
    // Projects can be at most 99 characters.
    match[2].length >= 100
  ) {
    return
  }

  return {
    user: match[1],
    project: match[2],
    page: match[3],
    reference: match[4],
    comment:
      url.charAt(match[0].length) === '#' && match[0].length + 1 < url.length,
  }
}
