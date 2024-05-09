rm -rf node_modules
cd expo
cd android
rm -rf build
./gradlew clean
cd ../..
npm install
cd expo
npx expo prebuild --clean
npx expo run:android