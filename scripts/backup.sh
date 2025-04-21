#!/bin/sh

(cd /var/lib/postgresql/12/ && tar zcvf /database-dir.tar.gz data)
(cd /etc && tar zcvf /etc-postgresql-dir.tar.gz postgresql)
(cd /hedgedoc/public/ && tar zcvf /uploads.tar.gz uploads)
(cd /hedgedoc/public/ && tar zcvf /downloads.tar.gz downloads)
(cd /hedgedoc/public/ && tar zcvf /sounds.tar.gz sounds)
