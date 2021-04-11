Runs an `execSync` to run async code in a sync context to run `findWorkspacePackages`.

This is useful when you are working with some tooling that only provides a sync api but needs all packages like `docusaurus`.

# Test

```
node example/test.js
```
