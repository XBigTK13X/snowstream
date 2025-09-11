cd expo
rm -rf node_modules
rm yarn.lock || true
rm package-lock.json || true

npx yarn install

cd android
rm -rf build/
./gradlew clean

cd ../..