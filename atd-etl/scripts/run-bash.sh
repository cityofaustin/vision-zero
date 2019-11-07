#!/usr/bin/env bash

set -o errexit

source ./scripts/run-config.sh;

docker run -it --rm -v $(pwd)/app:/app -v $(pwd)/data:/data \
    --env-file $ATD_CRIS_CONFIG $ATD_DOCKER_IMAGE bash;
