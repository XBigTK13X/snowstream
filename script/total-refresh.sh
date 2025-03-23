#! /bin/bash
script/db-refresh.sh
sleep 4
script/dev-run-all.sh
sleep 4
if [ -f script/seed-data.sh ]; then
    script/seed-data.sh
fi

if [ -f script/seed-data.py ]; then
    script/seed-data.py
fi