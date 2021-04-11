# @live/husky-config

Husky default config for Live monorepos

Husky runs git-hooks.

# Disable hooks

In `.env`, set `SKIP_GIT_HOOKS=1`.

# Testing

To test the hooks run, make a commit of staged files, and then revert it.

```
git commit Test
git reset --soft HEAD~1
```
