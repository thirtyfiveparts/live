## `SyntaxError: Cannot use import statement outside a module`

Check that there is not a `package.json` or `node_modules` file somewhere inside `src` in a package. This will prevent babel from finding the right configuration.

## `TypeError: Cannot read property 'getQueryInterface' of undefined`

Use `sequelize@6`. We have patched `sequelize-typescript` so that it works.

## `Error: Schema must contain uniquely named types but contains multiple types named "JSONObject".`

## `Error: Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:`

Multiple versions of react: `pnpm m ls react react-dom`

In the frontend app, add the following to `.env`:

```
OPEN_ANALYZER=1
ENABLE_ANALYZER=1
```

Look for `react.dom.development.js` and check the path. You will probably see multiple versions of `react-dom` or `react`.

Use https://webpack.github.io/analyse/ and webpack-stats-plugin

curl http://thirtyfive.dev.localhost:3000/stats.json > stats.json

stats writer is broken atm.

Your output must have `modules`.
https://github.com/webpack/analyse/issues/18

## inspectpack - `Missing sources: Expected 106, found 0.`

```

[watch-cra] Missing sources: Expected 106, found 0.
[watch-cra] Found map: {}
[watch-cra]
[watch-cra] Duplicate Sources / Packages - Duplicates found! ⚠️
[watch-cra]
[watch-cra] * Duplicates: Found 61 similar files across 106 code sources (both identical + similar)
[watch-cra]   accounting for 2086721 bundled bytes.
[watch-cra] * Packages: Found 0 packages with 0 resolved, 0 installed, and 0 depended versions.
[watch-cra]
[watch-cra] * Understanding the report: Need help with the details? See:
[watch-cra]   https://github.com/FormidableLabs/inspectpack/#diagnosing-duplicates
[watch-cra] * Fixing bundle duplicates: An introductory guide:
[watch-cra]   https://github.com/FormidableLabs/inspectpack/#fixing-bundle-duplicates
```

```
inspectpack -s dist/stats.json -a duplicates -f text
```

```
pnpm m ls react-dom --depth=99
```

FIX: Sometimes peer dependencies are cached and won't update. You have to delete node_modules and pnpm-lock and start again.
