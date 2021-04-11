const {ApolloServer, gql} = require('apollo-server')

// This is a (sample) collection of books we'll be able to query
// the GraphQL server for.  A more complete example might fetch
// from an existing data source like a REST API or database.
const books = [
  {
    title: 'Harry Potter and the Chamber of Secrets',
    author: 'J.K. Rowling',
  },
  {
    title: 'Jurassic Park',
    author: 'Michael Crichton',
  },
]

// Type definitions define the "shape" of your data and specify
// which ways the data can be fetched from the GraphQL server.
const typeDefs = gql`
  # Comments in GraphQL are defined with the hash (#) symbol.

  # This "Book" type can be used in other type declarations.
  type Book {
    title: String
    author: String
  }

  type PackageManifest {
    name: String
    description: String
  }

  type Package {
    contents: String
    manifest: PackageManifest
    path: String
    isRepoRoot: Boolean
    escapedPkgName: String
  }

  type File {
    path: String
    html: String
  }

  # The "Query" type is the root of all GraphQL queries.
  # (A "Mutation" type will be covered later on.)
  type Query {
    books: [Book]
    packages: [Package]
    file: File
  }
`

////////////////////////////////////////////////////////////////////////////////

import path, {join} from 'path'

import _ from 'lodash'
var remark = require('remark')
const html = require('remark-html')
const fs = require('fs')

export default function readConfig({cwd}) {
  const config = require(path.join(cwd, 'live.config.js'))
  return config || {}
}

async function getPackages() {
  const findUp = require('find-up')
  let repoRoot = require('path').dirname(findUp.sync('.monoroot'))
  const cwd = repoRoot
  const config = readConfig({cwd})
  const workspaceRoot = repoRoot
  const patterns = config.patterns
  const {default: findPackages} = await import('find-packages')
  const pjsons = await findPackages(workspaceRoot, {
    ignore: ['**/node_modules/**', '**/bower_components/**'],
    patterns,
  })

  const out = pjsons.map(pjson => {
    const readmePath = path.join(pjson.path, 'readme.md')
    if (!fs.existsSync(readmePath)) return pjson
    const contents = fs.readFileSync(readmePath, 'utf8')
    // NOTE: Lets parse markdown in browser.
    //const html = remark().use(html).process(contents)
    // --
    const isRepoRoot = pjson.path === repoRoot
    const escapedPkgName = encodeURIComponent(pjson.manifest.name)
    const out = {...pjson, contents, isRepoRoot, escapedPkgName}
    return out
  })

  return out
}

async function getFile(path) {
  // TODO(vjpr): Potential security flaw.
  const contents = fs.readFileSync(path, 'utf8')
  const html = remark()
    .use(html)
    .process(contents)
  return html
}

const repoIgnores = [
  [
    '**/node_modules/**',
    '**/.dev/**',
    '**/.cache/**',
    '**/.git/**',
    '**/.idea/**',
    '**/build/**',
    '**/public/**',
  ],
]

////////////////////////////////////////////////////////////////////////////////

// Resolvers define the technique for fetching the types in the
// schema.  We'll retrieve books from the "books" array above.
const resolvers = {
  Query: {
    books: () => books,
    packages: async () => await getPackages(),
    file: async () => await getFile(),
  },
}

// TODO(vjpr): Websockets to re-render the page we are looking at.

// In the most basic sense, the ApolloServer can be started
// by passing type definitions (typeDefs) and the resolvers
// responsible for fetching the data for those types.
const server = new ApolloServer({typeDefs, resolvers, playground: true})

// This `listen` method launches a web-server.  Existing apps
// can utilize middleware options, which we'll discuss later.
server.listen().then(({url}) => {
  console.log(`🚀  Server ready at ${url}`)
})

////////////////////////////////////////////////////////////////////////////////

// Express server to serve rendered markdown.

const Koa = require('koa')
const route = require('koa-route')
const app = new Koa()
const Router = require('koa-router')
var router = new Router()

//app.use(async ctx => {
//  ctx.body = 'Hello World'
//})

let packages = null

import githubMarkdownCss from 'github-markdown-css/github-markdown.css'

router.get('/package-contents/:pkgName/:relPath*', async (ctx, next) => {
  let {pkgName, relPath} = ctx.params

  // Cache package list.
  if (!packages) packages = await getPackages()

  const pkg = _.find(packages, pkg => pkg.manifest.name === pkgName)

  if (!pkg) {
    console.log('Could not find package by name', pkgName)
    return null
  }

  const pkgPath = pkg.path

  if (!relPath) {
    relPath = 'readme.md'
  }

  const absPath = join(pkgPath, relPath)

  const out = await render(absPath)

  console.log(out)

  const todo = 'foo'

  // TODO(vjpr): Use react for this...although it would be slower, but cleaner.
  return ctx.body = `
    <html>
    <head>
    <title>${todo}</title>
    <link rel="stylesheet" type="text/css" href="http://localhost:5000/_files/node_modules/github-markdown-css/github-markdown.css">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
      markdown-body {
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
    </style>
    </head>
    <body>
    <article class="markdown-body">${out}</article>
    </body>
    </html>
  `

})

import util from 'util'

const readFile = util.promisify(fs.readFile)

import trike from 'trike'
import eres from 'eres'

import koaStatic from 'koa-static'
import koaStaticServer from 'koa-static-server'

async function render(file) {
  const contents = await readFile(file, 'utf8')
  const renderP = () => new Promise((resolve, reject) => {
    remark()
      .use(html)
      .process(contents, (err, file) => {
        if (err) reject(err)
        resolve(file)
      })
  })

  const [err, out] = await eres(renderP())
  if (err) {
    console.log({err})
    return
  }

  return out.contents
}

router.get('/', (ctx, next) => {
  ctx.body = 'Foo'
})

const githubMarkdownCssAbsPath = require.resolve('github-markdown-css/github-markdown.css')

//router.get('node_modules/:path', (ctx, next) => {
//  const contents = await readFile(file, 'utf8')
//  ctx.body =
//})

app.use(koaStaticServer({rootDir: '.', rootPath: '/_files'}))

app.use(router.routes())

app.listen(5000)
