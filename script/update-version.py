#! /usr/bin/python3

import os
import sys
import datetime

CLIENT_SETTINGS_PATH = './expo/src/settings.js'
SERVER_SETTINGS_PATH = './web-server/settings.py'
EXPO_SETTINGS_PATH = './expo/app.json'
PACKAGE_JSON_PATH = './expo/package.json'
BUILD_GRADLE_PATH = './expo/android/app/build.gradle'

version = None
with open(SERVER_SETTINGS_PATH,'r') as read_handle:
    for line in read_handle.readlines():
        if 'version' in line:
            version = line.split(' = ')[1]
if len(sys.argv) < 2:

    print(f"Pass a new version. Current version is {version.replace('"','')}")
    sys.exit(1)

if sys.argv[1] == 'read':
    print(version.replace('"',''),end='')
    sys.exit(0)

build_date = datetime.datetime.now().strftime('%B %d, %Y')
build_version = sys.argv[1]

def update_info(
    input_path:str,
    version_needle:str=None,
    version_replacement:str=None,
    build_needle:str=None,
    build_replacement:str=None
    ):
    print(f"Updating {input_path}")
    file_content = ''
    with open(input_path,'r') as read_handle:
        for line in read_handle.readlines():
            if version_needle and version_needle in line:
                file_content += version_replacement
            elif build_needle and build_needle in line:
                file_content += build_replacement
            else:
                file_content += line
    with open(input_path,'w') as write_handle:
        write_handle.write(file_content)

update_info(
    input_path=SERVER_SETTINGS_PATH,
    version_needle='server_version',
    version_replacement=f'        self.server_version = "{build_version}"\n',
    build_needle='server_build_date',
    build_replacement=f'        self.server_build_date = "{build_date}"\n'
)

update_info(
    input_path=CLIENT_SETTINGS_PATH,
    version_needle='clientVersion',
    version_replacement=f'        this.clientVersion = "{build_version}"\n',
    build_needle='clientBuildDate',
    build_replacement=f'        this.clientBuildDate = "{build_date}"\n'
)

update_info(
    input_path=EXPO_SETTINGS_PATH,
    version_needle='"version"',
    version_replacement=f'    "version": "{build_version}",\n'
)

update_info(
    input_path=PACKAGE_JSON_PATH,
    version_needle='"version"',
    version_replacement=f'    "version": "{build_version}",\n'
)

update_info(
    input_path=BUILD_GRADLE_PATH,
    version_needle='versionName',
    version_replacement=f'        versionName "{build_version}"\n'
)