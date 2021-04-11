# @live/eslint-config

# Notes

Seems like `eslint-import-resolver-babel-module` peer depends on `babel-plugin-module-resolver`.

## Supporting TS and JS in same codebase.

https://github.com/typescript-eslint/typescript-eslint/issues/109

## Debugging ESLint and IntelliJ

Add the following line and change the ESLint IntelliJ settings back and forth to force a re-init.

```
require('fs').writeFileSync('/tmp/intellij-js', JSON.stringify({xxx}, null, 2))
```

## Shareable configs

- Resolved relative to the config file.
- If you use `package.json#eslintConfig.extends` then it will resolve from where that extends points to. But `module.exports = require(...)` won't work.

