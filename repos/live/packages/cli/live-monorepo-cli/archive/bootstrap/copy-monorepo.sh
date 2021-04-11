#!/bin/bash

# For bootstrapping a new monorepo.

# E.g.
# ```
# cd <main-repo-with-shared-public-subtree>/
# FROM=. \
# TO=~/dev-projects/dev-live-starter \
# packages/public-symlink/scripts/bootstrap/copy-monorepo.sh`
# ```

# TODO: This didn't work.
#EXCLUDES=--exclude={.git,node_modules,packages,.vagrant,archive,tmp,build}

# ------------------------------------------------------------------------------

set -x

#PACKAGES_PUBLIC_DIR=${PACKAGES_PUBLIC_DIR:=public}
PACKAGES_PUBLIC_DIR_SYMLINK=public-symlink

# When we want to export our current monorepo structure.
# Copy entire dir structure into `live-monorepo-starter`.
rsync \
  --links \
  --exclude={.git,.git-subrepo,pnpm-lock.yaml,node_modules,flow-typed,packages,.vagrant,archive,tmp,build,*.log,.idea,.env} \
  --delete \
  -r \
  $FROM \
  $TO

# NOTE: Don't use `--delete-excluded` because it will try to delete `node_modules` which will be present while we test it.
# NOTE: We must ignore `.idea` because the excludes and name of the project will be wrong.

# ---

# Change private names in root files/dirs. Mostly this stuff should be inside packages/private or packages/org, but somethings cannot be moved out of the root.
#   E.g. `.flowconfig

# TODO: `package.json`
json -I -f package.json -e 'this.name="app"'

# Create `public-symlink` pointing to your shared `public` subrepo (Usually the project you spend most of your time working on).
# This should already be created...
#ln -sfn $FROM/packages/public packages/$PUBLIC_SYMLINK_DIR

# `.flowconfig`

cp packages/$PACKAGES_PUBLIC_DIR_SYMLINK/template-root/.flowconfig $TO/

# `now.json`

cp packages/$PACKAGES_PUBLIC_DIR_SYMLINK/template-root/now.json $TO/

# `.graphqlconfig`

cp packages/$PACKAGES_PUBLIC_DIR_SYMLINK/template-root/.graphqlconfig $TO/

# `pnpm-workspace.yaml`

cp packages/$PACKAGES_PUBLIC_DIR_SYMLINK/template-root/pnpm-workspace.yaml $TO/

# `.idea`

# - Start a new Intellij project (Run `idea .` from cli)

# - Run `jetbrains-project .` to exclude `node_modules`.

# - Rename project module to `live-monorepo-starter` (it will be the directory name by default).


