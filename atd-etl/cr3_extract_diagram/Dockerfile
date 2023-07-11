FROM python:3.10-slim

# Copy our own application
WORKDIR /app
COPY . /app/cr3_extract_diagram

RUN chmod -R 755 /app/*

# Install requirements
RUN cd /app/cr3_extract_diagram && apt-get update && \
    pip install -r requirements.txt
