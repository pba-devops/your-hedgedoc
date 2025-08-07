#!/bin/bash

if [[ $OSTYPE != 'linux-gnu'* ]]; then
	echo "ONLY FROM LINUX"
	exit 1
fi

(cd hedgedoc/linux-x64/ && cp -r ../../public . 2>/bin/null && tar zxvf node_modules.tar.gz && ./hedgedoc)
