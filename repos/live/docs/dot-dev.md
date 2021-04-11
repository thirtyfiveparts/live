---
id: dot-dev
title: .dev directory
sidebar_label: .dev
slug: /dot-dev
---

THIS IS ENTIRELY OPTIONAL!

This is a little convenience that @vjpr uses which you might also like.

```
- archive
- code
- scripts
- symlinks
```

It's a directory that is specific to your local dev machine (not checked into VCS). You exclude it from version control by adding a line to `.git/info/exclude`.

The directory should be a symlink to somewhere on your local dev machine. E.g. `ln -sfn `~/dev-dot-env/my-monorepo .dev`. It should also be initialized as a git directory and commited to every now and then.

Symlinking comes in handy when using the [`git worktree`](https://git-scm.com/docs/git-worktree) feature, allowing you to access your same files regardless of which "worktree" you are working on.

## `archive` / `code`

This is a place where you can keep snippets of code that you don't want to check-in to the repo. Yes, you could use `git stash` or IntelliJ's Shelf feature or use a `git branch` but each of these is less convenient than being able to just copy-paste some files to another file.

It incentivizes keeping a clean code base by making it very easy to safely stash code and get back to it easily. If I get interrupted while implementing something before its ready for a commit, I can just quickly copy-paste instead of committing the code when its not 100% ready.

When cleaning up code, sometimes you think "oh I could maybe use this and will just leave it there". But having an easy place to move stuff avoids this kind of code-hoarding behavior.

## `scripts`

## `symlinks`

This directory contains symlinks to useful configuration files for services (Postgres, Redis, etc.). This makes it easy to tweak or check config settings.

You can also symlink to interesting `node_modules` files that you need to debug or reference such as `create-react-app`'s webpack config directory in case you want to see how to modify a setting without using `craco`. It's usually a little tedious to navigate to.

Here is the script I use to generate the symlinks:

```
#!/usr/bin/env bash

set -x

BASEDIR=$(dirname "$0")
echo "$BASEDIR"

# Postgres

# https://superuser.com/questions/442554/postgresql-homebrew-installation-lacks-config-files
# brew info postgres
ln -sfn /usr/local/var/postgres $BASEDIR/postgres/usr-local-var-postgres
ln -sfn /usr/local/var/postgres/postgresql.conf $BASEDIR/postgres/postgresql.conf
ln -sfn /usr/local/var/log/postgres.log $BASEDIR/postgres/postgresql.log

# ElasticSearch

# https://www.elastic.co/guide/en/elasticsearch/reference/current/brew.html
ln -sfn /usr/local/etc/elasticsearch $BASEDIR/elasticsearch/usr-local-etc-elasticsearch
ln -sfn /usr/local/var/log/elasticsearch $BASEDIR/elasticsearch/usr-local-var-log-elasticsearch

# Redis
ln -sfn /usr/local/etc/redis.conf $BASEDIR/redis/redis.conf

# CRA
# To easily investigate or override with craco, the CRA `webpack.config.js`.
ln -sfn /path/to/monorepo/node_modules/.pnpm/react-scripts@3.4.1/node_modules/react-scripts/config $BASEDIR/cra/config

```

## `status.md`

A file used to keep personal notes of what you are working on and the status of it. A nice addition to your task tracker.

Its convenient because it's visually colocated with your codebase which makes it faster to access than any other tools such as task trackers, Notion, text files, etc.

Can be useful when working on multiple repos to keep a file like this in each.
