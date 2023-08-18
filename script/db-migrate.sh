#! /bin/bash

if [ -z $1 ];then
    cd web-server
    alembic upgrade head
else
    alembic -c /app/docker/alembic.ini upgrade head
    rabbitmqctl add_user snowstream snowstream
    rabbitmqctl set_user_tags snowstream administrator
    rabbitmqctl set_permissions -p / snowstream ".*" ".*" ".*"
fi

