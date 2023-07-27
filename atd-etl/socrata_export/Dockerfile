FROM python:3.10-slim

RUN apt-get update
RUN apt-get upgrade -y

WORKDIR /app

COPY . /app

RUN cd /app && pip install -r requirements.txt
