# @live/remark-github

Forked from https://github.com/remarkjs/remark-github

# Features

Github repos

- pull stars/watchers/contribs/etc.
- pull github description or read from package.json
- add shields.io for live updating counts in published readmes

# Implementation

Cache github api calls to avoid rate-limits. Cache every day perhaps.
