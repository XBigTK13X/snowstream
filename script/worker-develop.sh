#! /bin/bash

cd web-server
npx nodemon --exec uv run python -m bin.worker.py
