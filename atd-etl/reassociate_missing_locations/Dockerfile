FROM python:3.11-bookworm

RUN apt-get update
RUN apt-get upgrade -y
#RUN apt-get install -y poppler-utils tesseract-ocr

# Copy our own application
WORKDIR /app
COPY . /app/

# Install requirements
#RUN pip install -r requirements.txt
