#!/usr/bin/env bash

# Determine work branch
case "${CIRCLE_BRANCH}" in
  "production")
    export WORKING_STAGE="production";
  ;;

  "master")
    export WORKING_STAGE="staging";
  ;;

  *)
    export WORKING_STAGE="pr";
  ;;
esac

export ATD_IMAGE="atddocker/atd-vz-etl";
export ATD_IMAGE_AGOL="atddocker/atd-vz-etl-agol"
#
# We need to assign the name of the branch as the tag to be deployed
#
export ATD_TAG="${WORKING_STAGE}";


function build_containers {

    if [[ "${WORKING_STAGE}" == "pr" ]]; then
        echo "PRs are not currently deployed to the docker-hub.";
        exit 0;
    fi;

    echo "Logging in to Docker hub"
    docker login -u $ATD_DOCKER_USER -p $ATD_DOCKER_PASS

    # First build, tag and push the regular ETL image
    echo "docker build -f Dockerfile -t $ATD_IMAGE:$ATD_TAG .";
    docker build -f atd-etl/Dockerfile -t $ATD_IMAGE:$ATD_TAG ./atd-etl

    echo "docker tag $ATD_IMAGE:$ATD_TAG $ATD_IMAGE:$ATD_TAG;";
    docker tag $ATD_IMAGE:$ATD_TAG $ATD_IMAGE:$ATD_TAG;

    echo "docker push $ATD_IMAGE:$ATD_TAG";
    docker push $ATD_IMAGE:$ATD_TAG;

    # Then build, tag and push the Agol-containing Image
    echo "docker build -f Dockerfile.agol -t $ATD_IMAGE_AGOL:$ATD_TAG .";
    docker build -f atd-etl/Dockerfile.agol -t $ATD_IMAGE_AGOL:$ATD_TAG ./atd-etl

    echo "docker tag $ATD_IMAGE_AGOL:$ATD_TAG $ATD_IMAGE_AGOL:$ATD_TAG;";
    docker tag $ATD_IMAGE_AGOL:$ATD_TAG $ATD_IMAGE_AGOL:$ATD_TAG;

    echo "docker push $ATD_IMAGE_AGOL:$ATD_TAG";
    docker push $ATD_IMAGE_AGOL:$ATD_TAG;
}
