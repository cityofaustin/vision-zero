#!/usr/bin/env bash

export ATD_IMAGE="atddocker/atd-vz-etl";

#
# We need to assign the name of the branch as the tag to be deployed
#
export ATD_TAG="${CIRCLE_BRANCH}";

function build_containers {
    echo "Logging in to Docker hub"
    docker login -u $ATD_DOCKER_USER -p $ATD_DOCKER_PASS

    echo "docker build --no-cache -f Dockerfile -t $ATD_IMAGE:$ATD_TAG .";
    docker build -f --no-cache atd-etl/Dockerfile -t $ATD_IMAGE:$ATD_TAG ./atd-etl

    echo "docker tag $ATD_IMAGE:$ATD_TAG $ATD_IMAGE:$ATD_TAG;";
    docker tag $ATD_IMAGE:$ATD_TAG $ATD_IMAGE:$ATD_TAG;

    echo "docker push $ATD_IMAGE:$ATD_TAG";
    docker push $ATD_IMAGE:$ATD_TAG;
}