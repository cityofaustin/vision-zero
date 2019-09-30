FROM ruby:stretch

RUN mkdir /app && mkdir /app/tmp

WORKDIR /app

RUN echo "deb http://ftp.de.debian.org/debian testing main" >> /etc/apt/sources.list && \
    echo 'APT::Default-Release "stretch";' | tee -a /etc/apt/apt.conf.d/00local

RUN apt-get update -y && apt-get -t stretch install -y g++ xvfb qt5-default libqt5webkit5-dev \
    gstreamer1.0-plugins-base gstreamer1.0-tools gstreamer1.0-x qt-sdk p7zip-full

RUN apt-get -t testing install -y python3.7 python3-pip

RUN gem install capybara capybara-webkit selenium-webdriver  mail --no-document
RUN pip3 install awscli knackpy psycopg2 requests

COPY app /app
