#! /bin/bash

echo "THIS IS THE ONE TO USE!"

cd expo/android
mkdir -p build-out
export EXPO_TV=0
./gradlew assembleRelease
#./gradlew release
cp app/build/outputs/apk/release/app-release.apk build-out/snowstream-mobile.apk
export EXPO_TV=1
./gradlew assembleRelease
#./gradlew release
cp app/build/outputs/apk/release/app-release.apk build-out/snowstream-tv.apk