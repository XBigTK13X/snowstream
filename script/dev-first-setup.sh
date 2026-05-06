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
    python3.14 \
    python3.14-devel

cd web-server
uv sync
cd ..

cd expo
npx yarn install
cd ..