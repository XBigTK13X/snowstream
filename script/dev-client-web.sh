#! /bin/bash
source script/variables.sh
cd expo
export BROWSER=none
if [ -z "$1" ]; then
    echo "Running dev web client"
    script -f /tmp/dev-client-web.log
    npx expo start --web
else
    echo "Running prod web client"
    script -f /tmp/dev-client-web.log
    npx expo start --web --no-dev --minify
fi
cd ..