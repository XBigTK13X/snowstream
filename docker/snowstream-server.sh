#! /bin/bash

/app/script/db-migrate.sh docker

uvicorn --fd 0 server:app