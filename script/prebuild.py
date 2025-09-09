#! /usr/bin/python3

gradle_body = ''
with open('expo/android/build.gradle','r',encoding="utf-8") as read_handle:
    all_found = False
    for line in read_handle.readlines():
        if 'allprojects' in line:
            all_found = True
        if all_found and 'mavenCentral' in line:
            line += '\n    maven { url "/home/kretst/maven-repo" }\n'
        gradle_body += line
with open('expo/android/build.gradle', 'w', encoding="utf-8") as write_handle:
    write_handle.write(gradle_body)