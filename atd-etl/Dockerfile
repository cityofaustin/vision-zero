#
# ATD Vision Zero Processor
# An ETL Processor that uses Python 3.8, Splinter, Selenium and Chrome/ChromeDriver
#
FROM python:3.8-alpine3.10

RUN mkdir /app && mkdir /app/tmp && mkdir /data

RUN apk add bash build-base python3-dev libffi-dev openssl-dev \
    chromium chromium-chromedriver p7zip

RUN pip install cryptography==3.3.2 splinter selenium requests \
    awscli web-pdb sodapy boto3 mail-parser

WORKDIR /app

COPY app /app

EXPOSE 5555/tcp

CMD ["bash"]
