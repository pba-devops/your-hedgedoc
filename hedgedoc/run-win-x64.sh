#!/bin/bash

if [[ $OSTYPE != 'msys'* ]] && [[ $OSTYPE != 'cygwin'* ]]; then
	echo "ONLY FROM WINDOWS"
	exit 1
fi

(cd hedgedoc/win-x64/ && cp -r ../../public . 2>/bin/null && tar zxvf node_modules.tar.gz && ./hedgedoc)
