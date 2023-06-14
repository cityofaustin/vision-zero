FROM ubuntu:22.04

# Set the timezone
RUN ln -snf /usr/share/zoneinfo/America/Chicago /etc/localtime && echo America/Chicago > /etc/timezone
RUN apt-get update && apt-get install -y tzdata

RUN apt-get -y upgrade
RUN apt-get install -y aptitude magic-wormhole vim black python3-pip

COPY requirements.txt /tmp/requirements.txt
RUN pip install -r /tmp/requirements.txt

COPY entrypoint.sh /entrypoint.sh

COPY . /app

WORKDIR /app
CMD ["/entrypoint.sh"]
