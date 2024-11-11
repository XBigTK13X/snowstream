#! /bin/bash

cd expo
export EXPO_TV=1
npx expo prebuild
npx expo run:android
