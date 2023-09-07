FROM tiangolo/uvicorn-gunicorn-fastapi:python3.11

RUN apt update; apt install -y postgresql postgresql-common \
    rabbitmq-server postgresql-client \
    postgresql-contrib supervisor nginx gosu

RUN rabbitmq-plugins enable rabbitmq_management

RUN systemctl disable nginx

ENV NVM_DIR /usr/local/nvm
RUN mkdir -p $NVM_DIR
RUN curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.39.5/install.sh | bash
ENV NODE_VERSION v16.13.0
RUN /bin/bash -c "source $NVM_DIR/nvm.sh && nvm install $NODE_VERSION && nvm use --delete-prefix $NODE_VERSION"
ENV NODE_PATH $NVM_DIR/versions/node/$NODE_VERSION/lib/node_modules
ENV PATH      $NVM_DIR/versions/node/$NODE_VERSION/bin:$PATH

COPY docker/nginx.conf /etc/nginx/nginx.conf

COPY docker/pg_hba.conf /etc/postgresql/15/main/pg_hba.conf

RUN chown postgres:postgres /etc/postgresql/15/main/pg_hba.conf

COPY ./web-server/requirements.txt /app/requirements.txt

RUN pip install -r /app/requirements.txt

COPY ./web-server /app

COPY ./web-server/server.py /app/main.py

COPY ./docker /app/docker

COPY ./script /app/script

COPY web-client/ /frontend-build

WORKDIR /frontend-build

RUN chmod +x /app/script/prod-build-web-client.sh

RUN bash -c "/app/script/prod-build-web-client.sh"

COPY docker/alembic.ini /app/alembic.ini

RUN chmod -R 777 /app/script

RUN chmod -R 777 /app/docker

RUN mkdir /docker-entrypoint-initdb.d

WORKDIR /app

ENTRYPOINT []

CMD ["/usr/bin/supervisord", "-c", "/app/docker/supervisord-full.conf"]