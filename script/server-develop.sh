#! /bin/bash

cd web-server
source venv/bin/activate
python -m uvicorn bin.server:app --reload --host 0.0.0.0 --port 8000
