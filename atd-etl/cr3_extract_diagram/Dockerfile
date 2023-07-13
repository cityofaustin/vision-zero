FROM python:3.10-slim

RUN apt-get update
RUN apt-get upgrade -y
RUN apt-get install -y poppler-utils tesseract-ocr

# Copy our own application
WORKDIR /app
COPY . /app/cr3_extract_diagram

RUN chmod -R 755 /app/*

# Install requirements
RUN cd /app/cr3_extract_diagram && apt-get update && \
    pip install -r requirements.txt
