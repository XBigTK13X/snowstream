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
ENV PATH $NVM_DIR/versions/node/$NODE_VERSION/bin:$PATH

RUN curl -L https://github.com/AlexxIT/go2rtc/releases/download/v1.7.0/go2rtc_linux_amd64 --output /usr/bin/go2rtc

RUN chmod +x /usr/bin/go2rtc

RUN curl -L https://johnvansickle.com/ffmpeg/builds/ffmpeg-git-amd64-static.tar.xz --output /app/ffmpeg.tar.xz

RUN tar -xvf /app/ffmpeg.tar.xz

RUN bash -c "cp /app/ffmpeg-git*/ffprobe /usr/bin/ffprobe; cp /app/ffmpeg-git*/ffmpeg /usr/bin/ffmpeg"

RUN bash -c "rm -rf /app/ffmpeg*"

RUN chmod +x /usr/bin/ffmpeg

RUN chmod +x /usr/bin/ffprobe

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

RUN mkdir -p /go2rtc

WORKDIR /app

ENTRYPOINT []

CMD ["/usr/bin/supervisord", "-c", "/app/docker/supervisord-full.conf"]