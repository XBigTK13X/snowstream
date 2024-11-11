#! /bin/bash

echo "THIS DOESN'T WORK AT ALL. USE THE OTHER SCRIPT"
echo "Well...maybe this does work after clearing .docker-volume? Need to check the artifact repo auth"
cd expo
echo "Make sure credentials.json, keystore.properties, and build.gradle->keystore path are updated"
eas build -p android --profile production --local
cd ..
