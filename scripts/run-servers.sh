#!/bin/bash

sleep 2

rm -f /run/postgresql/.s.PGSQL.5432
rm -f /tmp/.s.PGSQL.5432
rm -f /tmp/.s.PGSQL.5432.lock
rc-service /etc/init.d/postgresql start

sleep 20

if [ ! -f "/HEDGEDOC_OK" ]; then

	( cd /hedgedoc/ && ./bin/setup )
	touch /HEDGEDOC_OK

fi

(cd /hedgedoc && yarn start)
