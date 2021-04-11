const {createProxyMiddleware} = require('http-proxy-middleware')
module.exports = function (app) {
  const serverPort = process.env.SERVER_PORT ?? 3010
  app.use(
    '/api',
    createProxyMiddleware({
      target: `http://localhost:${serverPort}`,
      changeOrigin: true,
      pathRewrite(pathname) {
        // /api/graphql -> /graphql
        return pathname.replace(/^\/api/, '')
      },
    }),
  )
}
