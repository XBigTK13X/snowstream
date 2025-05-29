#! /bin/bash

if [ -z $1 ]; then
  echo "First argument of version string is required, current version is below"
  cat ./web-server/settings.py | grep server_version
  exit 1
fi

BUILD_VERSION="$1"

BUILD_DATE=$(date +'%B %d, %Y')

echo "Version $BUILD_VERSION - Built $BUILD_DATE"

echo "Need to update"
echo "expo/app/settings.js"
echo "web-server/settings.py"

sed -i -E "s/server_version = '{1}(.*?)'{1}/server_version = '${BUILD_VERSION}'/" ./web-server/settings.py
sed -i -E "s/server_build_date = '{1}(.*?)'{1}/server_build_date = '${BUILD_DATE}'/" ./web-server/settings.py
sed -i -E "s/clientVersion = \\\"{1}(.*?)\\\"{1}/clientVersion = \\\"${BUILD_VERSION}\\\"/" ./expo/app/settings.js
sed -i -E "s/clientBuildDate = \\\"{1}(.*?)\\\"{1}/clientBuildDate = \\\"${BUILD_DATE}\\\"/" ./expo/app/settings.js