#! /bin/bash

cd web-server

uv run python -m pytest -p no:warnings --verbose -s bin/test/*