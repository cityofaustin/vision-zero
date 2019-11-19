#!/usr/bin/env bash

#
# Examples:
#
#   run build
#
#   runetl ~/etl.staging.env bash
#   runetl ~/etl.production.env app/process_test_run.py
#


# Make sure your ENV files are only visible to the current user
chmod +x app/*.py;
chmod +x app/*.sh;

#
# We also need to export the name of the docker image we are going to use
#
export ATD_DOCKER_IMAGE="atddocker/atd-vz-etl:local";

function runetl {
    # We have a limit of two arguments
    if [[ "$3" != "" ]]; then
        echo "Unrecognized argument: $3";
        return;
    fi;

    # If the first argumentis build, then we build the container
    if [[ "$1" == "build" ]]; then
        docker build -f Dockerfile -t $ATD_DOCKER_IMAGE .
        return;
    fi;

    # We are going to assume $1 is the file $2 is the command
    ATD_CRIS_CONFIG=$1;
    RUN_COMMAND=$2;


    if [[ "${ATD_CRIS_CONFIG}" =~ "production" ]];
    then
        RUN_ENVIRONMENT="production"
    else
        RUN_ENVIRONMENT="staging"
    fi

    # Makes sure the file exists
    if [[ -f "${ATD_CRIS_CONFIG}" ]]; then
        echo "Using environment variables in '${ATD_CRIS_CONFIG}'...";
    else
        echo "Error: The ATD_CRIS_CONFIG variable is not set because it cannot find the file '${ATD_CRIS_CONFIG}'";
        echo "Please refer to the documentation to create and env file.";
        return;
    fi;

    echo -e "\n\n----- ETL RUN ------";
    echo -e "Run Environment: \t${RUN_ENVIRONMENT}";
    echo -e "Run File: \t\t${RUN_COMMAND}";
    echo -e "ATD_CRIS_CONFIG: \t${ATD_CRIS_CONFIG}";
    echo -e "ATD_DOCKER_IMAGE: \t${ATD_DOCKER_IMAGE}";
    echo -e "--------------------\n";


    # If the command is not bash, prepend the forward slash...
    if [[ "$2" == "bash" ]]; then
        FINAL_COMMAND=$RUN_COMMAND;
    else
        FINAL_COMMAND="/${RUN_COMMAND}";
    fi;

    # Run Docker
    docker run -it --rm -p 5555:5555/tcp \
        -v $(pwd)/app:/app -v $(pwd)/data:/data -v $(pwd)/tmp:/app/tmp \
        --env-file $ATD_CRIS_CONFIG $ATD_DOCKER_IMAGE $FINAL_COMMAND;

    # Reload Run Script into memory
    source $(pwd)/runetl.sh;

    # Exit
    return;
}
