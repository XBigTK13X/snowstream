#! /bin/bash

echo "Updating the database with the latest schema"
/app/script/db-migrate.sh docker

echo "Launching the web api"
uvicorn --fd 0 bin.server:app