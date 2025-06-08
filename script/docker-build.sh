#! /bin/bash

script/prod-build-web-client.sh

docker build -t xbigtk13x/snowstream .

if [ ! -z $1 ]; then
  docker push xbigtk13x/snowstream
fi
