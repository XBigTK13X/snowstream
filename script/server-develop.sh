#! /bin/bash

cd web-server
uv run python -m uvicorn bin.server:app --reload --host 0.0.0.0 --port 8000 --log-config ../docker/uvicorn-log.yaml
