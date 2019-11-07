#!/usr/bin/env bash

#
# Basic configuration for running the docker file locally...
#
set -o errexit
# Make sure the scripts are executable to the current user
chmod 700 ./scripts/*.sh;
# Make sure your ENV files are only visible to the current user
chmod 700 ./*.env;

#
# Check if either production or staging files are present and use that to run docker processes.
#
if [[ -f "./etl.production.env" ]]; then
    echo "Setting 'ATD_CRIS_CONFIG' to use keys in './etl.production.env'";
    export ATD_CRIS_CONFIG="./etl.production.env";
elif [[ -f "./etl.staging.env" ]]; then
    echo "Setting 'ATD_CRIS_CONFIG' to use keys in './etl.staging.env'";
    export ATD_CRIS_CONFIG="./etl.staging.env";
else
    echo "Error: The ATD_CRIS_CONFIG variable is not set because it cannot find either 'etl.production.env' or 'etl.staging.env'. Please refer to the documentation to create either file."
    exit 1;
fi

#
# We also need to export the name of the docker image we are going to use
#
export ATD_DOCKER_IMAGE="atddocker/atd-vz-etl:local";


