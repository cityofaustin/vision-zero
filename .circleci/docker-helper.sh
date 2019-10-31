#!/bin/bash
set -euo pipefail

ATD_IMAGE="atddocker/atd-cris-capybara";

#
# We need to assign the name of the branch as the tag to be deployed
#
if [[ "${CIRCLE_BRANCH}" == "production" ]]; then
    export ATD_TAG="latest";
else
    export ATD_TAG="cibuild";
fi;

echo "docker build --no-cache -f Dockerfile -t $ATD_IMAGE:$ATD_TAG ."
docker build -f atd-cris-capybara/Dockerfile -t "$ATD_IMAGE:$ATD_TAG" ./atd-cris-capybara

echo "docker tag $ATD_IMAGE:$ATD_TAG $ATD_IMAGE:$ATD_TAG;"
docker tag "$ATD_IMAGE:$ATD_TAG $ATD_IMAGE:$ATD_TAG"

if [ -z "$ATD_DOCKER_USER" ]; then
  echo "You are not authorized to push the image. Skipping."
  exit 0
fi

echo "Logging in to Docker hub"
docker login -u "$ATD_DOCKER_USER" -p "$ATD_DOCKER_PASS"

echo "docker push $ATD_IMAGE:$ATD_TAG"
docker push "$ATD_IMAGE:$ATD_TAG"
