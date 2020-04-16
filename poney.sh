#!/bin/sh

#----------------------------------------#
# Launch what's needed in docker
#----------------------------------------#

# Crons
/usr/sbin/crond -f -l 2
# Prestart, runned manually otherwise npm process use as much RAM as node process
BASE_PATH=$1 npm --prefix /usr/src/app/server prestart
# Start itself
BASE_PATH=$1 node /usr/src/app/server/src/index.js