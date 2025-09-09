FROM python:3.11-slim

WORKDIR /app
COPY . /app

RUN apt-get -y update
RUN chmod -R 755 /app/*
RUN chmod +x /app/backfill.py
RUN pip install boto3
