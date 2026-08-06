#! /bin/bash

source script/variables.sh

cd expo
rm -rf .expo
rm -rf node_modules
rm -rf android
rm -rf ios
rm -f yarn.lock

npx yarn install

cd ..