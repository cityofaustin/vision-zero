#!/usr/bin/env bash

# Necessary for configuration
source ./run-config.sh;

docker run -it --rm --env-file $ATD_ENV_CONFIG_FILE \
    $ATD_DOCKER_IMAGE "sh -c /app/app-run-process-cr3.sh";
