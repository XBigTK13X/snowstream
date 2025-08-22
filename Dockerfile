FROM python:3.12-trixie

# Ensure we use ffmpeg with libmfx enabled for quicksync
COPY docker/debian.sources /etc/apt/sources.list.d/debian.sources
RUN apt update
RUN DEBIAN_FRONTEND=noninteractive apt install -y gpgv
RUN wget https://www.deb-multimedia.org/pool/main/d/deb-multimedia-keyring/deb-multimedia-keyring_2024.9.1_all.deb
RUN dpkg -i deb-multimedia-keyring_2024.9.1_all.deb
RUN rm deb-multimedia-keyring_2024.9.1_all.deb
COPY docker/dmo.sources /etc/apt/sources.list.d/dmo.sources
RUN apt update
RUN DEBIAN_FRONTEND=noninteractive apt dist-upgrade -y

# database
RUN DEBIAN_FRONTEND=noninteractive apt install -y postgresql postgresql-common postgresql-client postgresql-contrib
# message queue
RUN DEBIAN_FRONTEND=noninteractive apt install -y rabbitmq-server
# internal container process management
RUN DEBIAN_FRONTEND=noninteractive apt install -y supervisor
# web server
RUN DEBIAN_FRONTEND=noninteractive apt install -y nginx
# transcoding and video inspection
RUN DEBIAN_FRONTEND=noninteractive apt install -y ffmpeg mediainfo mkvtoolnix
# thumbnails
RUN DEBIAN_FRONTEND=noninteractive apt install -y imagemagick
# quicksync and vaapi
RUN DEBIAN_FRONTEND=noninteractive apt install -y intel-media-va-driver-non-free libmfx-gen-dev
# transcode troubleshooting
RUN DEBIAN_FRONTEND=noninteractive apt install -y intel-gpu-tools vainfo
# ease reading cli output as json
RUN DEBIAN_FRONTEND=noninteractive apt install -y jc
# sudo helper
RUN DEBIAN_FRONTEND=noninteractive apt install -y gosu

#RUN userdel Debian-exim
#RUN groupadd -g 107 render

RUN rabbitmq-plugins enable rabbitmq_management
COPY docker/rabbitmq.conf /etc/rabbitmq/rabbitmq.conf

RUN systemctl disable nginx
COPY docker/nginx.conf /etc/nginx/nginx.conf

RUN bash -c "echo \"include = '/etc/postgresql/17/main/my_postgresql.conf'\" >> /etc/postgresql/17/main/postgresql.conf"
COPY docker/pg_hba.conf /etc/postgresql/17/main/pg_hba.conf
COPY docker/postgresql.conf /etc/postgresql/17/main/mod-postgresql.conf
RUN chown postgres:postgres /etc/postgresql/17/main/pg_hba.conf
RUN chown postgres:postgres /etc/postgresql/17/main/mod-postgresql.conf

COPY ./web-server/requirements.txt /app/requirements.txt
WORKDIR /app
RUN pip install -r /app/requirements.txt
COPY ./web-server /app
RUN rm -rf /app/.snowstream

COPY ./docker /app/docker
COPY ./script /app/script
COPY ./expo/dist /app/prod-frontend
COPY docker/alembic.ini /app/alembic.ini
RUN chmod -R 777 /app/script
RUN chmod -R 777 /app/docker
RUN mkdir /docker-entrypoint-initdb.d

ENTRYPOINT []

CMD ["/usr/bin/supervisord", "-c", "/app/docker/supervisord-full.conf"]