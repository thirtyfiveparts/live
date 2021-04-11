//import path from 'path'
//const findUp = require('find-up')
//const repoRoot = path.dirname(findUp.sync('pnpm-workspace.yaml'))

export function babel() {
  return {
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
    },
    module: {
      rules: [
        {
          test: [/\.js$/, /\.tsx?$/],
          exclude: /(node_modules)/,
          use: {
            loader: 'babel-loader',
            options: {
              // Looks for `babel.config.js` file upwards.
              // Allows us to import packages outside of our project root.
              rootMode: 'upward',
              // ---
              // Read `package.json#babel`.
              //babelrc: true,
              //babelrcRoots: [repoRoot],
              // ---
            },
          },
        },
      ],
    },
  }
}
