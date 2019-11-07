#!/usr/bin/env bash

#
# A shortcut to build the docker container for local development
#
set -o errexit

source ./scripts/run-config.sh;

docker build -f Dockerfile -t $ATD_DOCKER_IMAGE .