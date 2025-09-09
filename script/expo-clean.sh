cd expo
rm -rf node_modules
rm yarn.lock
rm package-lock.json

cd android
rm -rf build
./gradlew clean

cd ..
npx yarn install