#! /bin/bash

find /app/prod-frontend -type f -exec sed -i -e 's/SNOWSTREAM_WEB_API_URL/'"$SNOWSTREAM_WEB_API_URL"'/g' {} \;

/app/script/db-migrate.sh docker

uvicorn --fd 0 server:app