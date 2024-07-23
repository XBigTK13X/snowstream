#! /bin/bash
echo "Make sure credentials.json, keystore.properties, and build.gradle->keystore path are updated"
eas build -p android --profile production --local