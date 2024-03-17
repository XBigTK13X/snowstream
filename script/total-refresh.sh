#! /bin/bash
script/db-refresh.sh
sleep 4
script/dev-run-all.sh
sleep 4
script/seed-data.sh || script/seed-data.py
