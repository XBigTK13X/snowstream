#! /bin/bash

source script/variables.sh
cd expo
export EXPO_TV=1
npx expo run:android
# script -f /tmp/dev-client-tv.log
npx expo start --dev-client
cd ..