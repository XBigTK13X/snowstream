cd expo
EXPO_NO_GIT_STATUS=1 EXPO_TV=1 npx expo prebuild --clean
cp ~/Android/keystore.properties android/keystore.properties
cd ..
script/prebuild.py