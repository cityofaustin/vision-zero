FROM python:3.14-slim

WORKDIR /app
COPY . /app

RUN apt-get -y update
RUN chmod -R 755 /app/*
RUN chmod +x /app/incident_import.py
RUN pip install -r requirements.txt

ENTRYPOINT ["python"]
