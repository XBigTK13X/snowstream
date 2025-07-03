#! /bin/bash

export NODE_ENV="production"

echo "=-=- Building the container image -=-="
script/docker-build.sh push

echo "=-=- Running the latest version container on beast -=-="
ssh access@beast.9914.us "bash -c \"cd /mnt/docker; ./on/snowstream.sh\""

echo "=-=- Build the apks -=-="
script/prod-generate-apks.sh

echo "=-=- Push the apks up to the file server -=-="
~/script/push-apks.sh snowstream

echo "=-=- Deploy the apks to all devices -=-="
~/script/remote-adb.py

unset NODE_ENV