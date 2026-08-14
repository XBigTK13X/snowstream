#! /bin/bash

if [ -z $1 ]; then
    echo "Migration name is required"
    exit 1
fi

cd web-server

uv run alembic revision -m "$1"