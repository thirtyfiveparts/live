---
hide_title: true
---

# @live/cli

The only command you need to remember to work with a Live monorepo.

## Entrypoints

### `lives` = `bin/index.es5.js`

If `bin/index.es5.js` is used, which is the default, any other monorepo packages must be transpiled manually.

This saves about 1s when we only print help info.

### `live` = `bin/index.js`

## Dev

Watch and compile all workspace dependencies.

```
npm run dev-deps
```

## Build

### `live` - Transpile on-the-fly using @babel/register

### `lives` - Transpiled

```
npm run build
```

If you run `pnpm m exec pwd --filter @live/cli...` you can see all the packages that the cli depends on. We use this to transpile all of them


---

NOTE: When doing completions we must not print anything except completions so no `console.log`s.

Always `return exit()` NOT just `exit()` or it breaks the interactive cliffy api.

## Env

### `LIVE_CLI_USE_DISK_CACHE=1 live`

Uses a disk cache for find projects. Speedup of ~800ms depending on size of project.

---

## Later

There should not be distinction of app/package. Should use tags to define functionalites.

---

## Why `lives` and not `live -s`?

shell completion?

I think we could probably allow it though.
