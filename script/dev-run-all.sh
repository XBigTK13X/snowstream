#! /bin/bash
cd web-server
mkdir -p .snowstream/log
source venv/bin/activate
echo "Quietly installing requirements"
pip install -r requirements.txt > /dev/null 2>&1 || true
cd ..
kill -TERM -$(cat web-server/.snowstream/running.pid) > /dev/null 2>&1 || true
fuser -k 8000/tcp || true
fuser -k 3000/tcp || true
setsid bash -c 'script/server-develop.sh > web-server/.snowstream/log/server.log 2>&1 & script/worker-develop.sh > web-server/.snowstream/log/worker.log 2>&1 &' &
pgid=$!
echo $pgid > web-server/.snowstream/running.pid
echo "Dev scripts running in group $pgid. Check .snowstream/log/* for output"

