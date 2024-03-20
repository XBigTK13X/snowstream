#! /bin/bash
mkdir -p logs
cd web-server
source venv/bin/activate
echo "Quietly installing requirements"
pip install -r requirements.txt > /dev/null 2>&1 || true
cd ..
kill -TERM -$(cat logs/running.pid) > /dev/null 2>&1 || true
fuser -k 8000/tcp || true
fuser -k 3000/tcp || true
setsid bash -c 'script/web-client-develop.sh > logs/web-client.log 2>&1 & script/server-develop.sh > logs/server.log 2>&1 & script/worker-develop.sh > logs/worker.log 2>&1 &' &
pgid=$!
echo $pgid > logs/running.pid
echo "Dev scripts running in group $pgid. Check logs/* for output"

