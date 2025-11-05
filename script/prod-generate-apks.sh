#! /bin/bash

source script/variables.sh

echo "THIS IS THE ONE TO USE!"

cd expo/android
mkdir -p build-out

if [ -z "$1" ];then
    export EXPO_TV=0
    set -e
    ./gradlew assembleRelease
    set +e
    #./gradlew release
    cp app/build/outputs/apk/release/app-release.apk build-out/snowstream-mobile.apk
    export EXPO_TV=1
    set -e
    ./gradlew assembleRelease
    set +e
    #./gradlew release
    cp app/build/outputs/apk/release/app-release.apk build-out/snowstream-tv.apk
else
    export EXPO_TV=1
    ./gradlew bundleRelease
    cp app/build/outputs/bundle/release/app-release.aab build-out/snowstream-tv.aab
fi