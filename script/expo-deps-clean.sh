#! /bin/bash
cd expo
rm -rf node_modules
rm yarn.lock
npx yarn install
cd ..