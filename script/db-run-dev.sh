#! /bin/bash

mkdir -p .docker-volume/postgresql

docker rm -f snowstream-db || true

docker pull postgres:15.3

docker run -d \
    -e POSTGRES_PASSWORD=snowstream \
    -e POSTGRES_USER=snowstream \
    -e POSTGRES_DB=snowstream \
    --name snowstream-db \
    -p 9060:5432 \
    -v $(pwd)/.docker-volume/postgresql:/var/lib/postgresql/data \
    postgres:15.3

sleep 5

script/db-migrate.sh