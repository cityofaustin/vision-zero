#!/usr/bin/env bash

export ATD_IMAGE="atddocker/atd-cris-capybara";

#
# We need to assign the name of the branch as the tag to be deployed
#
if [[ "${CIRCLE_BRANCH}" == "production" ]]; then
    export ATD_TAG="latest";
else
    export ATD_TAG="${CIRCLE_BRANCH}";
fi;

function build_containers {
    echo "Logging in to Docker hub"
    docker login -u $ATD_DOCKER_USER -p $ATD_DOCKER_PASS

    echo "docker build --no-cache -f Dockerfile -t $ATD_IMAGE:$ATD_TAG .";
    docker build -f atd-cris-capybara/Dockerfile -t $ATD_IMAGE:$ATD_TAG ./atd-cris-capybara

    echo "docker tag $ATD_IMAGE:$ATD_TAG $ATD_IMAGE:$ATD_TAG;";
    docker tag $ATD_IMAGE:$ATD_TAG $ATD_IMAGE:$ATD_TAG;

    echo "docker push $ATD_IMAGE:$ATD_TAG";
    docker push $ATD_IMAGE:$ATD_TAG;
}