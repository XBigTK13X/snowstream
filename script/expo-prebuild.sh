#! /bin/bash

source script/variables.sh

cd expo
# Prepare the native projects
EXPO_NO_GIT_STATUS=1 EXPO_TV=1 npx expo prebuild --clean
cp ~/Android/keystore.properties android/keystore.properties
cd ..
# Make changes to the native projects
script/prebuild.py
cd expo
# If you don't do the second prebuild, then autolinking usually fails
EXPO_NO_GIT_STATUS=1 EXPO_TV=1 npx expo prebuild
cd ..