#!/usr/bin/env bash

docker run -it --rm \
    --env-file $ATD_CRIS_CONFIG \
    atddocker/atd-cris-capybara \
    "sh -c /app/app-run-geocode.sh"