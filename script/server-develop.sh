#! /bin/bash

cd web-server
source venv/bin/activate
pip install -r requirements.txt
python -m uvicorn server:app --reload
