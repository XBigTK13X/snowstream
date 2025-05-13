#! /bin/bash
docker rm -f snowstream
sudo rm -rf .docker-volume/
script/dev-docker-services.sh
