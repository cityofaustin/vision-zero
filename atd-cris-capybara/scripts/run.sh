#!/usr/bin/env bash

docker run -it --rm \
--env ATD_CRIS_USERNAME=$ATD_CRIS_USERNAME \
--env ATD_CRIS_PASSWORD=$ATD_CRIS_PASSWORD \
--env ATD_CRIS_REPORT_DATE_START="01/01/2019" \
--env ATD_CRIS_REPORT_DATE_END=`date +%m/%d/%Y` \
atddocker/atd-cris-capybara \
sh -c "xvfb-run --server-args=\"-screen 0 1024x768x24\" ruby main.rb"