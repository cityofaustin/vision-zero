FROM ubuntu:latest

RUN apt-get update; apt-get install -y vim aptitude python3-pip
RUN pip install --system requests
RUN pip install --system boto3

WORKDIR /root
