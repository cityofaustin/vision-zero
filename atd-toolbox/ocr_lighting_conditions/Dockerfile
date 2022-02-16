FROM ubuntu:latest

RUN apt-get update; 

ARG DEBIAN_FRONTEND=noninteractive
ENV TZ=America/Chicago
RUN apt-get install -y tzdata

RUN apt-get install -y vim aptitude python3-pip poppler-utils tesseract-ocr
RUN pip install --system requests boto3 pdf2image pillow
RUN pip install --system requests pytesseract

WORKDIR /root
