FROM ruby:stretch

WORKDIR /app

RUN apt-get update -y && apt-get install -y g++ nodejs xvfb qt5-default libqt5webkit5-dev gstreamer1.0-plugins-base gstreamer1.0-tools gstreamer1.0-x qt-sdk

RUN gem install capybara capybara-webkit selenium-webdriver uglifier --no-document

COPY app /app
