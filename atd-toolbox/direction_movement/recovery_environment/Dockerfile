#FROM postgis/postgis:latest
FROM frankinaustin/postgis:13-3.2
RUN apt-get update
RUN apt-get install -y aptitude postgresql-plperl-13
RUN apt-get install -y python3
WORKDIR /root/app
CMD tail -f /dev/null