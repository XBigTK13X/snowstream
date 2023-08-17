#! /bin/bash

docker rm -f snowstream-db || true

docker pull postgres:15.3

docker run -d \
    -e POSTGRES_PASSWORD=snowstream \
    -e POSTGRES_USER=snowstream \
    -e POSTGRES_DB=snowstream \
    --name snowstream-db \
    -p 9060:5432 \
    -v ~/.snowstream/db:/var/lib/postgresql \
    postgres:15.3