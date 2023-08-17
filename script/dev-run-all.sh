#! /bin/bash
mkdir -p logs
kill -TERM -$(cat logs/running.pid)
setsid sh -c 'script/db-run-dev.sh > logs/db-run-dev.log 2>&1 & script/web-client-develop.sh > logs/web-client-develop.log 2>&1 & script/server-develop.sh > logs/server-develop.sh 2>&1' &
pgid=$!
echo $pgid > logs/running.pid
echo "Dev scripts running in group $pgid. Check logs/* for output"

