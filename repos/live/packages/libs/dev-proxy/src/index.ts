export default async function () {
  const http = require('http')
  const httpProxy = require('http-proxy')

  httpProxy.createProxyServer({target: 'http://localhost:4000'}).listen(80)
}
