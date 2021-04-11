#!/bin/bash

# We have a starter template that works out of the box by copying over some basic templates, and packages.

# This file can be used for 2 things:

# a. Should be run before committing any changes to this starter to make sure that the starter files match the public templates.
# b. This will also be useful in building a new `live-monorepo-starter` repo from scratch.

# # Keep `live-monorepo-starter` up-to-date

# Here are some manual steps to do to keep the repo up-to-date:

# MANUAL STEP: pnpm-workspace.yaml!

# MANUAL STEP: Run `git status` to check there are no uncommitted changed.

# MANUAL STEP: Manually sync `packages/private` to `packages/public/template-private`.
#   `private` will contain private stuff so this must be manual.

# MANUAL STEP: Update things in `packages/public/template-org` from `packages/org`.
#   `org` will contain your repo specific code so this must be manual.

# ------------------------------------------------------------------------------

# Example:

# FROM=~/dev-mono/mono packages/scripts/bootstrap/index.sh

# ------------------------------------------------------------------------------

set -x

# We assume the shared public repo is in `public` dir.
#PACKAGES_PUBLIC_DIR=${PACKAGES_PUBLIC_DIR:=public}
PACKAGES_PUBLIC_SYMLINK_DIR=public-symlink

# Create dirs.
mkdir -p packages

# Create `public-symlink` pointing to your shared `public` subrepo (Usually the project you spend most of your time working on).
ln -sfn $FROM/packages/public packages/$PACKAGES_PUBLIC_SYMLINK_DIR

# Copy contents of `template-private` to `packages/private`
rsync -r --delete packages/$PACKAGES_PUBLIC_SYMLINK_DIR/template-private/ packages/private

# Create org dir
mkdir -p packages/org

# Copy web app template to org apps
# TODO: Maybe we should symlink `app-templates/web` into `public/template-org`.
#rm -rf packages/org/apps
rsync -r --delete --exclude={.git,node_modules,packages,.vagrant,archive,tmp,build,pnpm-lock.yaml} packages/$PACKAGES_PUBLIC_SYMLINK_DIR/apps-templates/web packages/org/apps/
# Rename web app package.
sed -i '' 's/\@live\/apps-templates-web/app-web/g' packages/org/apps/web/app/package.json

# TODO: Also do a `sed` for `db` package. Allow user to pass in the name of their package to overwrite template.

# Copy starter files for `packages/org` into dir.
# NOTE: We use `--exclude="/packages/org/apps/"` because we don't want the `--delete` flag to delete it. We must prefix with `/` because in rsync, this is the root of the sync (i.e. `packages/org/`).
#   Also, see alternative: `--filter='P packages/org/apps/'`. (https://superuser.com/questions/161766/how-to-exclude-rsync-excludes-from-delete/400111#400111)
rsync -r --delete --exclude={.git,node_modules,packages,.vagrant,archive,tmp,build,pnpm-lock.yaml} --exclude="/apps" packages/$PACKAGES_PUBLIC_SYMLINK_DIR/template-org/ packages/org/

