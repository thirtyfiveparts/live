#!/bin/bash

node_modules/.bin/eslint \
--fix \
--ext=.jsx,.tsx,.js,.ts "${@:-.}"
