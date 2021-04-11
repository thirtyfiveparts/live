# Git worktrees

Git worktrees are cool. It allows you to checkout another branch in another directory.

- Review someone's code without disrupting your current work. (by having to run `pnpm install` or have your IDE rescan files)
- Run long-running tests which you continue your current work.

```
git worktree add ../thirtyfive@review -b worktree/review
cd ../thirtyfive@review
# open ide
# npm run some-long-running-thing
```

## Tip

You can't have the same branch checked out in two trees. So a good practice is to create a new branch called `worktree/<dir>` for every worktree and when you aren't using it check that out, or use a detached head.


# Git branch naming

Prefix your branches with `u/` (inspired by reddit urls) and scope your feature branches with your user initials.

E.g. `u/vr/feat/foo-bar`

**Why?**

- This tells your team that only you can edit this branch and that they should not change it because you may rebase and force push.
- It also helps organize your branches into a nice nested hierarchy in your IDE or SourceTree.

# PR naming

Always rename your PR to something nicer instead of leaving it as the name of your branch.

```
// bad
u/vr/feat/foo-bar

// good
Foo bar feature
```
