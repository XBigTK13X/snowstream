#! /bin/bash

if [ ! -z $1 ]; then
    echo "Purging invalid gradle state"
    cd expo/android
    ./gradlew --stop
    rm -rf ~/.gradle/caches
    rm -rf .gradle build app/build
    cd ../..
fi

echo "Rebuilding the android app"
script/expo-clean.sh

script/expo-prebuild.sh

script/full-release.sh client