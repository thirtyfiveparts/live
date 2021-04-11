# Notes on ESLint in a monorepo

## Our strategy

Its not possible to create a package with dependencies for all plugins and shareable configs that you use because of ESLint's broken resolver.

So we create a package in the multimonorepo root where we declare all the plugin and config dependencies.

From this package we can require our default config, and then extend that config with customizations.

## Plugins

Plugins are resolved from `{multimonorepo-root}/__placeholder__.js` by default.

You need to use `--resolve-plugins-relative-to=` to modify this.

## Configs

Shareable configs are resolved from the extended location.

```
module.exports = {extends: 'eslint-config-foo'}
```

## Troubleshooting

```
Error: Failed to load plugin 'react' declared in '.eslintrc.js » ./tools/eslint/.eslintrc.default.js': Cannot find module 'eslint-plugin-react'
Require stack:
- ~/dev-mono/thirtyfive/__placeholder__.js
```

---

```
//module.exports = require('./tools/eslint/.eslintrc.default.js')
//module.exports = {extends: ['@live/eslint-config-monorepo/.eslintrc.default.js']}
module.exports = {extends: ['./tools/eslint/.eslintrc.default.js']}
```

# ESLint + IntelliJ

`.eslintignore` must be in the root too.

