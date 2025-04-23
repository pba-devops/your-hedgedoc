#!/bin/sh

CURRENT_FOLDER=/c/Users/baala_p/Documents/Dev/Tools/your-hedgedoc/scripts

(cd $CURRENT_FOLDER/.. && zip -re backup.zip hedgedoc-db hedgedoc/public/uploads && cp backup.zip /g/FIP_PAY/COMMUN/TO_PHILIPPE/ && echo "Backup done" || echo "Backup failed")
