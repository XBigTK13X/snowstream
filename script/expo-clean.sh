rm -rf node_modules
cd expo
cd android
rm -rf build
./gradlew clean
cd ../..
npm install
cd expo
npx expo prebuild --clean
cp ~/Android/keystore.properties android/keystore.properties
npx expo run:android