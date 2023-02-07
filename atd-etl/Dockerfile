#
# ATD Vision Zero Processor
# An ETL Processor that uses Python 3.8, Splinter, Selenium and Chrome/ChromeDriver
#
FROM python:3.8-alpine3.10

RUN mkdir /app && mkdir /app/tmp && mkdir /data

RUN apk add bash build-base python3-dev libffi-dev openssl-dev \
    chromium chromium-chromedriver p7zip

# the following is helpful when developing using this image but is not needed for a production build
#RUN apk update && apk add build-base python3-dev libffi-dev openssl-dev && pip3 install magic-wormhole

RUN pip install cryptography==3.3.* splinter==0.* selenium==4.* requests==2.* \
    awscli==1.* web-pdb==1.* sodapy==2.* boto3==1.* mail-parser==3.* python-magic==0.*

WORKDIR /app

COPY app /app

EXPOSE 5555/tcp

CMD ["bash"]
