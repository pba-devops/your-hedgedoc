#!/bin/bash

yarn install
yarn build

mkdir hedgedoc 2>/dev/null
cp -r public/ hedgedoc/

nexe \
  --verbose \
  --build \
  --python python3 \
  --resource "./lib/**/*" \
  --resource "./package.json" \
  --resource "./config.json" \
  --resource "./locales/**/*" \
  --resource "./bin**/*" \
  --output hedgedoc/app-mac-x64
