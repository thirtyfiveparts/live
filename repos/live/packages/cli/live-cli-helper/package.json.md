## `@babel/plugin-transform-modules-commonjs`

See line `require.extensions[extension] = function(module, filename) {` in `index.js`.

```
"babel": {
  "presets": [
    "@live/babel-preset-live-node-simple"
  ],
  "plugins": [
    [
      "@babel/plugin-transform-modules-commonjs",
      {
        "lazy": false <--- IMPORTANT
      }
    ]
  ]
},
```
