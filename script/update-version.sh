#! /bin/bash

if [ -z $1 ]; then
  echo "First argument of version string is required, current version is below"
  cat ./web-server/settings.py | grep server_version
  exit 1
fi

BUILD_VERSION="$1"

BUILD_DATE=$(date +'%B %d, %Y')

echo "Version $BUILD_VERSION - Built $BUILD_DATE"

sed -i -E "s/server_version = '{1}(.*?)'{1}/server_version = '${BUILD_VERSION}'/" ./web-server/settings.py
sed -i -E "s/server_build_date = '{1}(.*?)'{1}/server_build_date = '${BUILD_DATE}'/" ./web-server/settings.py
sed -i -E "s/clientVersion = \\\"{1}(.*?)\\\"{1}/clientVersion = \\\"${BUILD_VERSION}\\\"/" ./web-client/src/settings.js
sed -i -E "s/clientBuildDate = \\\"{1}(.*?)\\\"{1}/clientBuildDate = \\\"${BUILD_DATE}\\\"/" ./web-client/src/settings.js
sed -i -E "s/versionName \\\"{1}(.*?)\\\"{1}/versionName \\\"${BUILD_VERSION}\\\"/" ./android-client/build.gradle
sed -i -E "s/ClientVersion = \\\"{1}(.*?)\\\"{1}/ClientVersion = \\\"${BUILD_VERSION}\\\"/" ./android-client/src/com/simplepathstudios/snowstream/SnowstreamSettings.java
sed -i -E "s/ClientBuildDate = \\\"{1}(.*?)\\\"{1}/ClientBuildDate = \\\"${BUILD_DATE}\\\"/" ./android-client/src/com/simplepathstudios/snowstream/SnowstreamSettings.java