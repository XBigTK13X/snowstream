#! /bin/bash

source script/variables.sh
cd expo
export EXPO_TV=0
npx expo run:android
# script -f /tmp/dev-client-android.log
npx expo start --dev-client
cd ..