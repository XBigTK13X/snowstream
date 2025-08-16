FROM tiangolo/uvicorn-gunicorn-fastapi:python3.11

COPY docker/debian.sources /etc/apt/sources.list.d/debian.sources

RUN apt update

RUN apt install -y postgresql postgresql-common \
    rabbitmq-server postgresql-client \
    postgresql-contrib supervisor nginx gosu \
    ffmpeg imagemagick mediainfo jc \
    intel-gpu-tools intel-media-va-driver-non-free vainfo

RUN userdel Debian-exim

RUN groupadd -g 107 render

# https://github.com/NVIDIA/nvidia-docker/wiki/Installation-(Native-GPU-Support)
ENV NVIDIA_VISIBLE_DEVICES=all
ENV NVIDIA_DRIVER_CAPABILITIES="compute,video,utility"

RUN rabbitmq-plugins enable rabbitmq_management

COPY docker/rabbitmq.conf /etc/rabbitmq/rabbitmq.conf

RUN systemctl disable nginx

ENV NVM_DIR=/usr/local/nvm
RUN mkdir -p $NVM_DIR
RUN curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.39.5/install.sh | bash
ENV NODE_VERSION=v16.13.0
RUN /bin/bash -c "source $NVM_DIR/nvm.sh && nvm install $NODE_VERSION && nvm use --delete-prefix $NODE_VERSION"
ENV NODE_PATH=$NVM_DIR/versions/node/$NODE_VERSION/lib/node_modules
ENV PATH=$NVM_DIR/versions/node/$NODE_VERSION/bin:$PATH

COPY docker/nginx.conf /etc/nginx/nginx.conf

RUN bash -c "echo \"include = '/etc/postgresql/15/main/my_postgresql.conf'\" >> /etc/postgresql/15/main/postgresql.conf"

COPY docker/pg_hba.conf /etc/postgresql/15/main/pg_hba.conf

COPY docker/postgresql.conf /etc/postgresql/15/main/mod-postgresql.conf

RUN chown postgres:postgres /etc/postgresql/15/main/pg_hba.conf

RUN chown postgres:postgres /etc/postgresql/15/main/mod-postgresql.conf

RUN mkdir -p /usr/share/nginx/html/transcode

COPY ./web-server/requirements.txt /app/requirements.txt

WORKDIR /app

RUN pip install -r /app/requirements.txt

COPY ./web-server /app

COPY ./docker /app/docker

COPY ./script /app/script

COPY ./expo/dist /app/prod-frontend

COPY docker/alembic.ini /app/alembic.ini

RUN chmod -R 777 /app/script

RUN chmod -R 777 /app/docker

RUN mkdir /docker-entrypoint-initdb.d

ENTRYPOINT []

CMD ["/usr/bin/supervisord", "-c", "/app/docker/supervisord-full.conf"]