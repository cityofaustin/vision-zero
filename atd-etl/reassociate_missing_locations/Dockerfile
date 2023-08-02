FROM python:3.11-bookworm

# Debain package mgmt update
RUN apt-get update
RUN apt-get upgrade -y

# Copy our own application
WORKDIR /app
COPY . /app/

# Install requirements
RUN pip install -r requirements.txt
