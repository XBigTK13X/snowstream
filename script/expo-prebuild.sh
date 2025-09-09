cd expo
npx expo prebuild --clean
cp ~/Android/keystore.properties android/keystore.properties
cd ..
script/prebuild.py