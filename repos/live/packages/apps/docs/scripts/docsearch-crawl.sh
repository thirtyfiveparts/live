#!/bin/bash

# Script must be run from 'docs' app dir.

# Kill all processes launched from this script on exit.
# We want do stop our node proxy on exit.
trap "kill 0" EXIT

node -p "require('@live/dev-proxy/bin/index.js')" &

# --network="host" allows the container to access 'localhost'

docker run \
-it \
--env-file=./tools/algolia/.algolia-env \
--network="host" \
-e "CONFIG=$(cat ./tools/algolia/config.json | jq -r tostring)" \
algolia/docsearch-scraper

