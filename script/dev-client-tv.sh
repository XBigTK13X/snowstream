#! /bin/bash

source script/variables.sh
cd expo
export EXPO_TV=1
if [ ! -z "$1" ]; then
    npx expo run:android
fi
npx expo start --dev-client
cd ..