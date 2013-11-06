#!/bin/sh

if command -v open > /dev/null 2>&1; then
  open -a TextWrangler *.htm js/*.js css/*.css
fi