#!/bin/bash

if [[ $OSTYPE != 'msys'* ]] && [[ $OSTYPE != 'cygwin'* ]]; then
	echo "ONLY FROM WINDONS"
	exit 1
fi

rm -rf node_modules 2>/dev/null

ARCH=win-x64

yarn install
yarn build

mkdir -p hedgedoc/$ARCH 2>/dev/null
rm -rf hedgedoc/$ARCH/node_modules 2>/dev/null

cp -r public/ hedgedoc/$ARCH/
cp -r node_modules hedgedoc/$ARCH/

nexe \
  --verbose \
  --build \
  --python python3 \
  --resource "./lib/**/*" \
  --resource "./package.json" \
  --resource "./config.json" \
  --resource "./locales/**/*" \
  --resource "./bin**/*" \
  --output hedgedoc/$ARCH/hedgedoc.exe

rm -rf node_modules 2>/dev/null
