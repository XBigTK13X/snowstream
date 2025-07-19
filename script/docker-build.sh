#! /bin/bash

script/prod-build-web-client.sh

docker build -t $SNOWSTREAM_DOCKER_IMAGE .

version=`script/update-version.py read`

docker image tag $SNOWSTREAM_DOCKER_IMAGE $SNOWSTREAM_DOCKER_IMAGE:$version

if [ ! -z $1 ]; then
  docker push $SNOWSTREAM_DOCKER_IMAGE
  docker push $SNOWSTREAM_DOCKER_IMAGE:$version
fi
