#! /bin/bash

cd web-server
pip install -r requirements.txt
uvicorn server:app --reload
