#! /bin/bash

if [ -z $1 ];then
    cd web-server
    uv run alembic upgrade head
else
    uv run alembic -c /app/docker/alembic.ini upgrade head
    rabbitmqctl add_user snowstream snowstream
    rabbitmqctl set_user_tags snowstream administrator
    rabbitmqctl set_permissions -p / snowstream ".*" ".*" ".*"
fi

