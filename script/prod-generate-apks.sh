#! /bin/bash

cd expo/android
mkdir -p build-out
export EXPO_TV=0
./gradlew release
cp app/build/outputs/apk/release/app-release.apk build-out/snowstream-mobile.apk
export EXPO_TV=1
./gradlew release
cp app/build/outputs/apk/release/app-release.apk build-out/snowstream-tv.apk