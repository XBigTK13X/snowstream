#! /bin/bash

cd expo
export EXPO_TV=0
npx expo prebuild
npx expo run:android
