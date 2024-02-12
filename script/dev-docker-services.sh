#! /bin/bash

mkdir -p .docker-volume/postgresql

docker rm -f snowstream || true

docker pull xbigtk13x/snowstream

# Ports
# 5432  - postgres
# 15672 - rabbit gui
# 5672  - rabbit
# 8000  - snowstream
# 80    - nginx
# 9001  - supervisord gui

mkdir -p .docker-volume/web-transcode

chmod -R 777 .docker-volume/web-transcode

docker run -d \
    -e POSTGRES_PASSWORD=snowstream \
    -e POSTGRES_USER=snowstream \
    -e POSTGRES_DB=snowstream \
    -e PGDATA=/var/lib/postgresql/data \
    -e RABBITMQ_LOGS=- \
    -e SNOWSTREAM_LOG_FILE_PATH=/app/logs/snowstream.log \
    --name snowstream \
    -p 9060:5432 \
    -p 9061:15672 \
    -p 9062:5672 \
    -p 9063:8000 \
    -p 9064:80 \
    -p 9065:9001 \
    -p 9066:1984 \
    -p 9067:9067 \
    -v $(pwd)/.docker-volume/logs:/app/logs \
    -v $(pwd)/.docker-volume/postgresql:/var/lib/postgresql/data \
    -v $(pwd)/.docker-volume/rabbitmq:/var/lib/rabbitmq \
    -v $(pwd)/.docker-volume/transcode:/app/cache-transcode \
    -v /media/kretst/LINDATA/snowstream/library/movies:/web-media/movies \
    -v /media/kretst/LINDATA/snowstream/library/shows:/web-media/shows \
    xbigtk13x/snowstream

sleep 8

script/db-migrate.sh