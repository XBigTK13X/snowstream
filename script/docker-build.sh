#! /bin/bash

source script/variables.sh

script/prod-build-web-client.sh

set -e
docker build -t $SNOWSTREAM_DOCKER_IMAGE .
set +e

version=`script/update-version.py read`

docker image tag $SNOWSTREAM_DOCKER_IMAGE $SNOWSTREAM_DOCKER_IMAGE:$version

if [ ! -z $1 ]; then
  docker push $SNOWSTREAM_DOCKER_IMAGE
  docker push $SNOWSTREAM_DOCKER_IMAGE:$version
fi
