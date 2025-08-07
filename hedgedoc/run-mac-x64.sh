#!/bin/bash

if [[ $OSTYPE != 'darwin'* ]]; then
	echo "ONLY FROM MACOS"
	exit 1
fi

(cd hedgedoc/mac-x64/ && cp -r ../../public . 2>/bin/null && tar zxvf node_modules.tar.gz && ./hedgedoc)
