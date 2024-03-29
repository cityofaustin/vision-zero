# This image was used over python:3.10-slim to support python-magic library
FROM python:3.11-bookworm

RUN apt-get update
RUN apt-get upgrade -y

WORKDIR /app

COPY . /app

RUN cd /app && pip install -r requirements.txt

CMD -t 5