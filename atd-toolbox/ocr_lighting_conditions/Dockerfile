FROM ubuntu:latest

RUN apt-get update; apt-get install -y vim aptitude python3-pip poppler-utils
RUN pip install --system requests boto3 pdf2image
#RUN pip install --system boto3
#RUN pip install --system pdf2image

WORKDIR /root
