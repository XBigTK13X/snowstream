#! /bin/bash

sudo dnf install --allowerasing \
    jc \
    mediainfo \
    ffmpeg \
    java-21-openjdk-devel \
    libxml2-devel \
    libxslt-devel \
    python3-devel \
    libpq-devel \
    python3.12 \
    python3.12-devel

cd web-server
python3.12 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cd ..

cd expo
npx yarn install
cd ..