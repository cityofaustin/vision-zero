#
# ATD Vision Zero Processor
# An ETL Processor that uses Python 3.8, Splinter, Selenium and Chrome/ChromeDriver
#

FROM python:3.8-alpine3.10 AS builder

RUN mkdir /install
WORKDIR /install

RUN apk add --no-cache python3-dev libstdc++ && \
    apk add --no-cache g++ zeromq zeromq-dev freetype-dev libpng-dev openblas-dev libffi-dev libressl-dev && \
    ln -s /usr/include/locale.h /usr/include/xlocale.h

RUN pip install --upgrade cython
RUN pip install --install-option="--prefix=/install" numpy
RUN pip install numpy
RUN pip install --install-option="--prefix=/install" atd-agol-util

FROM python:3.8-alpine3.10 AS runtime

RUN mkdir /app && mkdir /app/tmp && mkdir /data

RUN apk add bash chromium chromium-chromedriver p7zip
RUN pip install splinter selenium requests awscli web-pdb sodapy boto3 mail-parser

COPY --from=builder /install /usr/local

WORKDIR /app
COPY app /app
EXPOSE 5555/tcp
CMD ["bash"]




