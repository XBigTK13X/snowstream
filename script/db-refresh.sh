#! /bin/bash
docker rm -f snowstream
sudo rm -rf .docker-volume/postgresql
script/dev-docker-services.sh
