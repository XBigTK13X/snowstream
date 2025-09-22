#! /bin/bash

source script/variables.sh

cd expo
rm -rf .expo
rm -rf node_modules
rm yarn.lock || true
rm package-lock.json || true

npx yarn install

cd android
rm -rf build/
./gradlew clean

cd ../..