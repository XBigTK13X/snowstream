#! /bin/bash

sudo rsync -paHAXxv --numeric-ids --progress "root@beast.9914.us:/mnt/docker/volume/snowstream/postgresql/" "/home/kretst/develop/snowstream/.docker-volume/postgresql/"