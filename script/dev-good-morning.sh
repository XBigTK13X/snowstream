#! /bin/bash

script/token-swap-android-settings.py

source venv/bin/activate

source script/variables.sh

script/dev-docker-services.sh

sleep 5

script/dev-run-all.sh

code .

