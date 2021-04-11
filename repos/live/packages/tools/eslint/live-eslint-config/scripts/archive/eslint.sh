#!/bin/bash

node_modules/.bin/eslint \
--resolve-plugins-relative-to=config/tools/eslint \
--ext=.jsx,.tsx,.js,.ts "${@:-.}"
