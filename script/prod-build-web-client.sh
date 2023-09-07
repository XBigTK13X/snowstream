#! /bin/bash

cd /frontend-build
npm run build
cd /
cp -r /frontend-build/build/ /app/prod-frontend/