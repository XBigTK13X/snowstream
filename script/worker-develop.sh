#! /bin/bash

cd web-server
source venv/bin/activate
pip install -r requirements.txt
npx nodemon worker.py
