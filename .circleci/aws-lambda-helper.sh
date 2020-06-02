#!/usr/bin/env bash

case "${CIRCLE_BRANCH}" in
  "production")
    export WORKING_STAGE="production";
    ;;

  *)
    export WORKING_STAGE="staging";
    ;;
esac

#
# First, we need to create the python package by installing requirements
#
function install_requirements {
  echo "Installing AWS's CLI";
  pip install awscli;
  echo "Installing requirements...";
  pip install -r ./requirements.txt --target ./package;
}

#
# Secondly, we must bundle the package and python script into a single zip file bundle
#
function bundle_function {
  echo "Bundling function...";
  cd package;
  zip -r9 ../function.zip .;
  cd ${OLDPWD};
  zip -g function.zip app.py;
}

#
# Generates environment variables for deployment
#
function generate_env_vars {
      echo $ZAPPA_SETTINGS > zappa_settings.json;
      STAGE_ENV_VARS=$(cat zappa_settings.json | jq -r ".${WORKING_STAGE}.aws_environment_variables");
      echo -e "{\"Description\": \"ATD VisionZero Events Handler\", \"Environment\": { \"Variables\": ${STAGE_ENV_VARS}}}" | jq -rc > handler_config.json;
}

#
# Deploys a single function
#
function deploy_event_function {
  echo "Deploying function...";
  # Obtain the function name
  FUNCTION_DIR=$(echo "${1}" | cut -d "/" -f 2);
  FUNCTION_NAME="atd-vz-data-events-${FUNCTION_DIR}_${WORKING_STAGE}"
  # Create or update function
  { # try
    echo "Creating lambda function ${FUNCTION_NAME}";
    aws lambda create-function \
        --role $ATD_VZ_DATA_EVENTS_ROLE \
        --handler "app.handler" \
        --tags "project=atd-vz-data,environment=${WORKING_STAGE}" \
        --runtime python3.7 \
        --function-name "${FUNCTION_NAME}" \
        --zip-file fileb://function.zip > /dev/null;
  } || { # catch: update
    echo -e "\n\nUpdating lambda function ${FUNCTION_NAME}";
    aws lambda update-function-code \
        --function-name "${FUNCTION_NAME}" \
        --zip-file fileb://function.zip > /dev/null;
  }

  # Set concurrency to maximum allowed: 5
  echo "Setting concurrency...";
  aws lambda put-function-concurrency \
        --function-name "${FUNCTION_NAME}" \
        --reserved-concurrent-executions 5;
  # Set environment variables for the function
  echo "Resetting environment variables"
  aws lambda update-function-configuration \
        --function-name "${FUNCTION_NAME}" \
        --cli-input-json file://handler_config.json > /dev/null;
}

#
# Deploys all functions in the events directory
#
function deploy_event_functions {
  MAIN_DIR=$PWD
  for FUNCTION in $(find atd-events -type d -mindepth 1 -maxdepth 1);
  do
      echo "Current directory: ${PWD}";
      echo "Building function ${FUNCTION}";
      cd $FUNCTION;
      echo "Entered directory: ${PWD}";
      install_requirements;
      bundle_function $FUNCTION;
      generate_env_vars;
      deploy_event_function $FUNCTION;
      cd $MAIN_DIR;
      echo "Exit, current path: ${PWD}";
  done;
}
