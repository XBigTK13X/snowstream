#! /usr/bin/python3

import os
import sys

SNOWSTREAM_MAVEN_REPO = os.environ.get("SNOWSTREAM_MAVEN_REPO")

if not SNOWSTREAM_MAVEN_REPO:
    print("SNOWSTREAM_MAVEN_REPO must be set to perform a build")
    sys.exit(1)

SNOWSTREAM_HERMES = os.environ.get("SNOWSTREAM_HERMES")

if not SNOWSTREAM_HERMES:
    print("SNOWSTREAM_HERMES must be set to perform a build")
    sys.exit(1)

gradle_body = ''
with open('expo/android/build.gradle','r',encoding="utf-8") as read_handle:
    all_found = False
    for line in read_handle.readlines():
        if 'allprojects' in line:
            all_found = True
        if all_found and 'mavenCentral' in line:
            line += '    maven { url "'+SNOWSTREAM_MAVEN_REPO+'" }\n'
            all_found = False
        if 'dependencies' in line:
            line = '''
  ext {
    ndkVersion = "29.0.14206865"
    buildToolsVersion = "36.1.0"
    targetSdkVersion = 36
    compileSdkVersion = 36
    minSdkVersion = 26
  }
  dependencies {
'''
        gradle_body += line

with open('expo/android/build.gradle', 'w', encoding="utf-8") as write_handle:
    write_handle.write(gradle_body)

keystore = '''{
            storeFile  file(keystoreProperties['KEYSTORE_PATH'])
            storePassword  keystoreProperties['KEYSTORE_PASSWORD']
            keyAlias keystoreProperties['KEY_ALIAS']
            keyPassword keystoreProperties['KEY_PASSWORD']
        }
'''
gradle_body = ''
with open('expo/android/app/build.gradle','r',encoding="utf-8") as read_handle:
    writing_keys = False
    keys_written = False
    for line in read_handle.readlines():
        if 'def projectRoot' in line:
            line += '''
def keystorePropertiesFile = System.getenv('SNOWSTREAM_KEYSTORE_PROPS')
def keystoreProperties = new Properties()
keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
'''
        if 'hermesCommand' in line and not '//' in line:
            line = '    hermesCommand = "'+SNOWSTREAM_HERMES+'"\n'

        if 'signingConfigs' in line and not keys_written:
            writing_keys = True
            gradle_body += line

        if writing_keys and '}' in line:
            line = f'        debug {keystore}\n        release {keystore}'
            signing_found = writing_keys = False
            keys_written = True
        if not writing_keys:
            gradle_body += line

with open('expo/android/app/build.gradle', 'w', encoding="utf-8") as write_handle:
    write_handle.write(gradle_body)