FROM tiangolo/uvicorn-gunicorn-fastapi:python3.11

COPY ./web-server/requirements.txt /app/requirements.txt

RUN pip install --no-cache-dir -r /app/requirements.txt

COPY ./web-server /app

COPY ./web-server/server.py /app/main.py