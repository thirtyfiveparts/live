DEPRECATED: This was the old way we did it. Now we do it with JS. I just keep it around for reference.

---

This script is used for updating the `@live/monorepo-starter` repo from a clone of it.

`./copy-monorepo.sh` - sync root files/dirs from monorepo clone to monorepo-starter dir or another dir

`./index.sh` - initialise the monorepo-starter repo
  - symlink public dir
    - TODO: We should use subrepo pull.
  - copy private folder (which contains a template that the user will customize for their company)
  - create an org directory for company-specific packages
  - copy web app template so user can start working immediately
    - change name of app template stuff to avoid duplicate package names

## Why?

If we want to change the monorepo structure in a real-world repo monorepo clone, we can easily update it without a lot of manual changes. This is facilitated by making sure all customizable things are kept separate.
