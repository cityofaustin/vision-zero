#FROM postgis/postgis:latest
FROM frankinaustin/postgis:13-3.2
RUN apt-get update
RUN apt-get -y upgrade 
RUN apt-get install -y aptitude postgresql-plperl-13 vim procps
RUN apt-get install -y python3 pip python3-psycopg2 black
WORKDIR /root/app
