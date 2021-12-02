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

#
# We also need to export the name of the docker image we are going to use
#
export ATD_DOCKER_IMAGE="atddocker/atd-vz-etl:local";
export ATD_DOCKER_IMAGE_AGOL="atddocker/atd-vz-etl-agol:local";

function runetl {
    # Let's establish our default web-pdb port:
    WEB_PDB_PORT="5555";

    # We are also going to allow for changes for the default web-pdb port:
    if [[ "$3" = "--port" ]] || [[ "$3" = "-p" ]]; then
        WEB_PDB_PORT="$4"
    fi;

    # If the first argumentis build, then we build the container
    if [[ "$1" == "build" ]]; then
        if [[ "$2" == "agol" ]]; then
            docker build -f Dockerfile.agol -t $ATD_DOCKER_IMAGE_AGOL .;
            return;
        elif [[ "$2" == "clean" ]]; then
            docker image prune;
            return;
        fi;


        docker build -f Dockerfile -t $ATD_DOCKER_IMAGE .;
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
        echo "Please refer to the documentation to create an env file.";
        return;
    fi;

    # If the command is Hasura locations, then change the image accordingly
    if [[ "$RUN_COMMAND" = "app/process_hasura_locations.py" ]]; then
        export ATD_DOCKER_IMAGE="$ATD_DOCKER_IMAGE_AGOL";
    fi;

    echo -e "\n\n----- ETL RUN ------";
    echo -e "Run Environment: \t${RUN_ENVIRONMENT}";
    echo -e "Run File: \t\t${RUN_COMMAND}";
    echo -e "ATD_CRIS_CONFIG: \t${ATD_CRIS_CONFIG}";
    echo -e "ATD_DOCKER_IMAGE: \t${ATD_DOCKER_IMAGE}";
    echo -e "--------------------\n";

    echo "--------------------------------------------------------------------";
    echo "--- Running web-pdb debugger at http://localhost:${WEB_PDB_PORT} ---";
    echo "--------------------------------------------------------------------";

    # Prepend the forward slash if missing in the run command...
    if [[ "${RUN_COMMAND}" =~ ^app/ ]]; then
        RUN_COMMAND="/${RUN_COMMAND}";
    fi;

    FINAL_COMMAND="docker run -it --rm -p $WEB_PDB_PORT:5555/tcp \
        -v $(pwd)/app:/app -v $(pwd)/data:/data -v $(pwd)/tmp:/app/tmp \
        --env-file $ATD_CRIS_CONFIG $ATD_DOCKER_IMAGE $RUN_COMMAND;"

    echo $FINAL_COMMAND;
    echo "--------------------------------------------------------------------";

    # Run Docker
    eval ${FINAL_COMMAND};

    # Reload Run Script into memory
    source $(pwd)/runetl.sh;

    # Exit
    return;
}
