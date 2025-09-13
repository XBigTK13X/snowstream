#! /bin/bash

echo "Docker services working dir"

pwd

docker pull $SNOWSTREAM_DOCKER_IMAGE

docker rm -f snowstream || true

mkdir -p .docker-volume/postgresql
mkdir -p .docker-volume/web-transcode
mkdir -p web-server/.snowstream/thumbnail
chmod -R 777 .docker-volume/web-transcode

# Ports
# 5432  - postgres
# 15672 - rabbit gui
# 5672  - rabbit
# 8000  - snowstream
# 80    - nginx
# 9001  - supervisord gui

docker run -d \
    -e POSTGRES_PASSWORD=snowstream \
    -e POSTGRES_USER=snowstream \
    -e POSTGRES_DB=snowstream \
    -e PGDATA=/var/lib/postgresql/data \
    -e RABBITMQ_LOGS=- \
    -e SNOWSTREAM_LOG_FILE_PATH=/app/logs/snowstream.log \
    --name snowstream \
    --device /dev/dri:/dev/dri \
    --privileged \
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
    -v $(pwd)/web-server/.snowstream:/mnt/.snowstream \
    -v /mnt/test-data:/mnt/test-data \
    -v /mnt/j-media/tv:/mnt/j-media/tv \
    -v /mnt/j-media/keepsake:/mnt/j-media/keepsake \
    -v /mnt/j-media/photo:/mnt/j-media/photo \
    -v /mnt/m-media/movie:/mnt/m-media/movie \
    $SNOWSTREAM_DOCKER_IMAGE

sleep 12

if [ -z "$1" ]; then
    script/db-migrate.sh
fi