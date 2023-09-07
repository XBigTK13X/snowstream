FROM tiangolo/uvicorn-gunicorn-fastapi:python3.11

RUN apt update; apt install -y postgresql postgresql-common \
    rabbitmq-server postgresql-client \
    postgresql-contrib supervisor nginx gosu

RUN rabbitmq-plugins enable rabbitmq_management

RUN systemctl disable nginx

COPY docker/nginx.conf /etc/nginx/nginx.conf

COPY docker/pg_hba.conf /etc/postgresql/15/main/pg_hba.conf

RUN chown postgres:postgres /etc/postgresql/15/main/pg_hba.conf

COPY ./web-server/requirements.txt /app/requirements.txt

RUN pip install -r /app/requirements.txt

COPY ./web-server /app

COPY ./web-server/server.py /app/main.py

COPY ./docker /app/docker

COPY ./script /app/script

COPY docker/alembic.ini /app/alembic.ini

RUN chmod -R 777 /app/script

RUN chmod -R 777 /app/docker

RUN mkdir /docker-entrypoint-initdb.d

ENTRYPOINT []

CMD ["/usr/bin/supervisord", "-c", "/app/docker/supervisord-full.conf"]