#! /bin/bash

cd expo
export EXPO_TV=1
npx expo prebuild
npx run android
