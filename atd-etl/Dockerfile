#
# ATD Vision Zero Processor
# An ETL Processor that uses Python 3.8, Splinter, Selenium and Chrome/ChromeDriver
#
FROM python:3-alpine3.8

RUN mkdir /app && mkdir /app/tmp && mkdir /data

RUN apk add bash chromium chromium-chromedriver p7zip

RUN pip install splinter selenium requests awscli web-pdb sodapy boto3 mail-parser

WORKDIR /app

COPY app /app

EXPOSE 5555/tcp

CMD ["bash"]
