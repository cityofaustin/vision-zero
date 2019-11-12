#!/usr/bin/env bash

#
# Examples:
#
#   run build
#
#   run process_socrata_export.py
#   run app-run-process-cr3.sh


# Make sure your ENV files are only visible to the current user
chmod 700 ./*.env;
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

    # If the second argument is empty, then assume staging and make $1 the command
    if [[ "$2" == "" ]]; then
        RUN_ENVIRONMENT="staging"; # Assume staging
        RUN_COMMAND=$1
    # We have two arguments, let's use them
    else
        RUN_ENVIRONMENT=$1;
        RUN_COMMAND=$2;
    fi;

    # We need to determine the environment
    if [[ "${RUN_ENVIRONMENT}" == "production" ]]; then
        export ATD_CRIS_CONFIG="$(pwd)/etl.production.env";
    else
        export ATD_CRIS_CONFIG="$(pwd)/etl.staging.env";
    fi;

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
    if [[ "$1" == "bash" ]] || [[ "$2" == "bash" ]]; then
        FINAL_COMMAND=$RUN_COMMAND;
    else
        FINAL_COMMAND="/${RUN_COMMAND}";
    fi;

    # Run Docker
    docker run -it --rm -v $(pwd)/app:/app -v $(pwd)/data:/data -v $(pwd)/tmp:/app/tmp \
        --env-file $ATD_CRIS_CONFIG $ATD_DOCKER_IMAGE $FINAL_COMMAND;

    # Reload Run Script into memory
    source $(pwd)/runetl.sh;

    # Exit
    return;
}

