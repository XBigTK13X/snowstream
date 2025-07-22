#! /bin/bash
source script/variables.sh
cd expo
export EXPO_TV=0
npx expo run:android
cd ..