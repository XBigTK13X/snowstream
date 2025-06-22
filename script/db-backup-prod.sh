#! /bin/bash

PROD_DIR="root@beast.9914.us:/mnt/docker/volume/snowstream/postgresql/"

LOCAL_DIR="/home/kretst/develop/snowstream/.docker-volume/postgresql/"

script/dev-kill-all.sh

docker rm -f snowstream

sudo rm -rf .docker-volume/postgresql

sudo rsync -paHAXxv --numeric-ids --progress $PROD_DIR $LOCAL_DIR