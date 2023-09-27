#! /bin/bash

fuser -k 8000/tcp
fuser -k 3000/tcp
kill -TERM -$(cat logs/running.pid)