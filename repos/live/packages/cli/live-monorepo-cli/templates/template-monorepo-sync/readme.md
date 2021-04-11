# template-monorepo-sync

> Copy default files from this monorepo root into `template-monorepo-files`.

`template-monorepo-files` is used as the template for creating new monorepos.

# Usage

```
node repos/live/packages/cli/live-monorepo-cli/templates/template-monorepo-sync
```

## Example

```
live-monorepo-init \
~dev-mono/thirtyfive/repos/live/packages/+live-cli/live-monorepo-cli/templates/template-monorepo-files \
~dev-mono/test
```

# Decisions

We could use this to generate a new project directly, but its better to use it to generate the template on disk so we can inspect it, and have it in version control.

We don't want to have to think: what is generated here and what is not. So we choose to generate all files from here.

We use strings instead of json in some files because it makes it easier to just copy from the existing root file to update the template.

