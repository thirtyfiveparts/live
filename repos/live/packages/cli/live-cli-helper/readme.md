# live-cli-helper

> For running/debugging cli tools with @babel/register config.

# ENV

`NO_TRANSPILE_CHECKER=1`

Disables transpile checker.

Will show error if changes have been made to a babel-compiled source file but have not been re-transpiled. This is only relevant for packages that need to be transpiled before runtime for startup performance reasons.

# Troubleshooting

Use the IntelliJ debugger to step through. Just create a new run script to the cli tool and click debug in the gutter.

Prepend `DEBUG=*,-babel`.

## Ensure closest `package.json` file contains config

I had an issue once where I had a `package.json` file where it shouldn't be and it was preventing looking upwards to the real `package.json`. Be careful of using IntelliJ's built-in package install auto-fix.

# Package Naming Note

Not the best name. Its a helper for clis not a helper for `live-cli`.
