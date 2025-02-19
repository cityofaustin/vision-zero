FROM python:3.11-slim

WORKDIR /app
COPY . /app

RUN apt-get -y update

RUN chmod -R 755 /app/*
RUN chmod +x /app/run_sql.py
RUN pip install -r requirements.txt
