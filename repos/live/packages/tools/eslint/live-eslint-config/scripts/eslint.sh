#!/bin/bash

node_modules/.bin/eslint \
--ext=.jsx,.tsx,.js,.ts "${@:-.}"
