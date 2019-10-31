FROM ruby:2.6.5-buster
LABEL MAINTAINER="Sergio Garcia <sergio.garcia@austintexas.gov>"
LABEL MAINTAINER="Rémy Greinhofer <remy.greinhofer@gmail.com>"

WORKDIR /usr/src/app

RUN apt-get update -y \
  && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
  awscli \
  g++ \
  gstreamer1.0-plugins-base \
  gstreamer1.0-tools \
  gstreamer1.0-x \
  libqt5webkit5-dev \
  p7zip-full \
  python3 \
  python3-requests \
  qt5-default \
  ruby-capybara \
  ruby-selenium-webdriver \
  xauth \
  xvfb \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* \
  && gem install capybara-webkit mail --no-document

COPY app /usr/src/app
