#! /usr/bin/python3

import os
import sys

import socket

ip = [l for l in ([ip for ip in socket.gethostbyname_ex(socket.gethostname())[2] if not ip.startswith("127.")][:1], [[(s.connect(("8.8.8.8", 53)), s.getsockname()[0], s.close()) for s in [socket.socket(socket.AF_INET, socket.SOCK_DGRAM)]][0][1]]) if l][0][0]

write_content = ''
SETTINGS_FILE='./android-client/src/com/simplepathstudios/snowstream/SnowstreamSettings.java'
with open(SETTINGS_FILE, 'r') as read_handle:
    for line in read_handle:
        if 'DevServerUrl' in line:
            line = f'\tpublic static String DevServerUrl = "http://{ip}:8000";\n'
        if 'ProdServerUrl' in line:
            line = f'\tpublic static String ProdServerUrl = "http://{ip}:8000";\n'
        write_content += line

with open(SETTINGS_FILE,'w') as write_handle:
    write_handle.write(write_content)

write_content = ''
SETTINGS_FILE='./expo/app/settings.js'
with open(SETTINGS_FILE, 'r') as read_handle:
    for line in read_handle:
        if 'SNOWSTREAM_WEB_API_URL' in line:
            line = f'      this.webApiUrl = "http://{ip}:8000";\n'
        write_content += line

with open(SETTINGS_FILE,'w') as write_handle:
    write_handle.write(write_content)