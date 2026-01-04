#! /bin/bash

cd expo
export EXPO_TV=0
npx expo export --platform web --clear
cd ..