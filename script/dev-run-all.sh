#! /bin/bash
mkdir -p logs
kill -TERM -$(cat logs/running.pid) > /dev/null 2>&1 || true
setsid bash -c 'script/dev-docker-services.sh > logs/docker-services.log 2>&1 && 2>&1 & script/web-client-develop.sh > logs/web-client.log 2>&1 & script/server-develop.sh > logs/server.log 2>&1' &
pgid=$!
echo $pgid > logs/running.pid
echo "Dev scripts running in group $pgid. Check logs/* for output"

