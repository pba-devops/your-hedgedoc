#!/bin/bash

#set -E

DATABASE_LOCATION=/c/Users/baala_p/Documents/Dev/Tools/your-hedgedoc/hedgedoc-db
DATABASE_NOT_RUNNING="no server running"

sleep 0

if [ ! -d "${DATABASE_LOCATION}" ] ; then

	echo "NO POSTGRES INSTANCE"
	exit 1

fi

DATABASE_STATUS=$(pg_ctl -D "${DATABASE_LOCATION}" status)
if [[ $DATABASE_STATUS != *$DATABASE_NOT_RUNNING* ]] ; then

	echo "STOP DATABASE"
	pg_ctl -D "${DATABASE_LOCATION}" stop

fi

sleep  2

kill $(ps -e | grep node | awk '{print $1}') 2>/dev/null
