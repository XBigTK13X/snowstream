#! /bin/bash

cd web-server
virtualenv -p /usr/bin/python3 venv
source venv/bin/activate
pip install -r requirements.txt 
cd ..
cd web-client
npm install
cd ..