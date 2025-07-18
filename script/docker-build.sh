#! /bin/bash

script/prod-build-web-client.sh

docker build -t gitea.9914.us/xbigtk13x/snowstream .

version=`script/update-version.py read`

docker image tag gitea.9914.us/xbigtk13x/snowstream gitea.9914.us/xbigtk13x/snowstream:$version

if [ ! -z $1 ]; then
  docker push gitea.9914.us/xbigtk13x/snowstream
  docker push gitea.9914.us/xbigtk13x/snowstream:$version
fi
