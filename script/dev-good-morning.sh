#! /bin/bash

script/token-swap-android-settings.py

cd web-server

source venv/bin/activate

cd ..

source script/variables.sh

script/dev-docker-services.sh

sleep 5

script/dev-run-all.sh
