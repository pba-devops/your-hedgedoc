#!/bin/bash

#set -E

DATABASE_LOCATION=$_TOOLS_LOCATION/your-hedgedoc/hedgedoc-db
DATABASE_NOT_RUNNING="no server running"

sleep 0

if [ ! -d "${DATABASE_LOCATION}" ] ; then

	echo "DATABASE SERVER CREATION"
	initdb -D $DATABASE_LOCATION -U postgres -W -E UTF8 -A scram-sha-256
	echo "DATABASE SERVER FIRST START"
	pg_ctl -D "${DATABASE_LOCATION}" -l logfile start
	echo "HEDGEDOC_DB DATABASE CREATION"
	psql -U postgres -c 'CREATE DATABASE hedgedoc_db;'

fi

DATABASE_STATUS=$(pg_ctl -D "${DATABASE_LOCATION}" status)
if [[ $DATABASE_STATUS == *$DATABASE_NOT_RUNNING* ]] ; then

	echo "NO DATABASE RUNNING"
	pg_ctl -D "${DATABASE_LOCATION}" -l logfile start

else

	echo "DATABASE ALREADY STARTED"

fi

sleep  2

export NODE_ENV=production
export CMD_DB_USERNAME=postgres
export CMD_DB_PASSWORD=postgres
export CMD_DB_DATABASE=hedgedoc_db
export CMD_DB_HOST=localhost
export CMD_DB_PORT=5432
export CMD_DB_DIALECT=postgres
export CMD_DOMAIN=localhost
export CMD_URL_ADDPORT=true
export CMD_PORT=3000
export CMD_PROTOCOL_USESSL=false
export CMD_SESSION_SECRET=hedgedoc
env | grep CMD_
echo "NODE_ENV: $NODE_ENV"

(cd ../hedgedoc && yarn start)

sleep 0

#pg_ctl -D "${DATABASE_LOCATION}" -l logfile stop
