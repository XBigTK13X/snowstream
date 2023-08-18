#! /bin/bash

chown -R postgres:postgres /var/lib/postgresql

su postgres -c "/app/docker/entrypoint-postgres.sh postgres -i"