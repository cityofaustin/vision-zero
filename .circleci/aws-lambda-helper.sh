#!/usr/bin/env bash

# CIRCLE_PR_NUMBER only works on forked PRs
export ATD_PR_NUMBER=$(curl -s -H "Accept: application/vnd.github.groot-preview+json" "https://api.github.com/repos/cityofaustin/atd-vz-data/commits/${CIRCLE_SHA1}/pulls" | jq -r '.[].number')

case "${CIRCLE_BRANCH}" in
  "production")
    export WORKING_STAGE="production";
  ;;
  "master")
    export WORKING_STAGE="staging";
  ;;
  *)
    echo "PR Detected, resetting working stage";
    export WORKING_STAGE="pr_${ATD_PR_NUMBER}";
    echo "New working stage: ${WORKING_STAGE}...";
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
      echo "Generating environment variables for environment '${WORKING_STAGE}'...";
      if [[ "${WORKING_STAGE}" != "pr_" ]] && [[ "${WORKING_STAGE}" == pr_* ]]; then
        echo "Detected PR, adjusting environment to Staging...";
        LOCAL_STAGE="staging"
      else
        # Check if the working stage is incomplete
        if [[ "${WORKING_STAGE}" == "pr_" ]]; then
            echo "Cannot deploy if there is no PR number, stopping."
            exit 0;
        fi;

        # Copy whatever working stage is, master or production.
        echo "No PR detected, using '${WORKING_STAGE}' as environment..."
        LOCAL_STAGE="${WORKING_STAGE}";
      fi;
      echo "Using stage: '${LOCAL_STAGE}' (Current working stage: '${WORKING_STAGE}')...";
      STAGE_ENV_VARS=$(cat zappa_settings.json | jq -r ".${LOCAL_STAGE}.aws_environment_variables");
      echo -e "{\"Description\": \"ATD VisionZero Events Handler\", \"Environment\": { \"Variables\": ${STAGE_ENV_VARS}}}" | jq -rc > handler_config.json;
}

#
# Deploys a single function
#
function deploy_event_function {
  FUNCTION_NAME=$1
  echo "Deploying function: ${FUNCTION_NAME} @ ${PWD}";
  # Create or update function
  { # try
    echo "Creating lambda function ${FUNCTION_NAME} @ ${PWD}";
    aws lambda create-function \
        --role $ATD_VZ_DATA_EVENTS_ROLE \
        --handler "app.handler" \
        --tags "project=atd-vz-data,environment=${WORKING_STAGE}" \
        --runtime python3.7 \
        --function-name "${FUNCTION_NAME}" \
        --zip-file fileb://$PWD/function.zip > /dev/null;
  } || { # catch: update
    echo -e "\n\nUpdating lambda function ${FUNCTION_NAME} @ ${PWD}";
    aws lambda update-function-code \
        --function-name "${FUNCTION_NAME}" \
        --zip-file fileb://$PWD/function.zip > /dev/null;
  }
  echo "Current directory: ";
  # Set concurrency to maximum allowed: 5
  echo "Setting concurrency for ${FUNCTION_NAME} @ ${PWD}";
  aws lambda put-function-concurrency \
        --function-name "${FUNCTION_NAME}" \
        --reserved-concurrent-executions 5;
  # Set environment variables for the function
  echo "Resetting environment variables: ${FUNCTION_NAME} @ ${PWD}";
  aws lambda update-function-configuration \
        --function-name "${FUNCTION_NAME}" \
        --cli-input-json file://$PWD/handler_config.json | jq -r ".LastModified";
  echo "Finished Lambda Update/Deployment";
}

function deploy_event_source_mapping {
    FUNCTION_NAME=$1
    EVENT_SOURCE_ARN=$2
    MAPPINGS_COUNT=$(aws lambda list-event-source-mappings --function-name "${FUNCTION_NAME}" | jq -r ".EventSourceMappings | length");

    # If no mappings are found, then create it...
    if [[ "${MAPPINGS_COUNT}" = "0" ]]; then
        echo "Deploying event source mapping '${FUNCTION_NAME}' @ '${EVENT_SOURCE_ARN}'";
        aws lambda create-event-source-mapping --function-name "${FUNCTION_NAME}"  \
            --batch-size 10 --event-source-arn "${EVENT_SOURCE_ARN}";

    # If there is one or more, then ignore, chances are it already exists.
    else
        echo "Skipping, the mapping already exists";
    fi;
}

#
# Deploys an SQS Queue
#
function deploy_sqs {
    QUEUE_NAME=$1
    echo "Deploying queue '${QUEUE_NAME}'";
    {
        QUEUE_URL=$(aws sqs get-queue-url --queue-name "${QUEUE_NAME}" 2>/dev/null | jq -r ".QueueUrl");
        echo "The queue already exists: '${QUEUE_URL}'";
    } || {
        QUEUE_URL="";
        echo "The queue does not exist, creating: '${QUEUE_NAME}'";
    }

    # If the queue url is empty, it means it does not exist. We must create it.
    if [[ "${QUEUE_URL}" = "" ]]; then
        # Create with default values, no re-drive policy.
        echo "Creating Queue";
        CREATE_SQS=$(aws sqs create-queue --queue-name "${QUEUE_NAME}" --attributes "DelaySeconds=0,MaximumMessageSize=262144,MessageRetentionPeriod=345600,VisibilityTimeout=30,RedrivePolicy='{\"deadLetterTargetArn\":\"arn:aws:sqs:us-east-1:295525487728:atd_vz_deadletter_queue\",\"maxReceiveCount\":3}'" 2> /dev/null);
        QUEUE_URL=$(aws sqs get-queue-url --queue-name "${QUEUE_NAME}" 2>/dev/null | jq -r ".QueueUrl");
        echo "Done creating queue: QUEUE_URL: ${QUEUE_URL}";
    else
        echo "Skipping SQS creation, the queue already exists: ${QUEUE_NAME}";
    fi;

    # Gather SQS attributes from URL, extract amazon resource name
    QUEUE_ARN=$(aws sqs get-queue-attributes --queue-url "${QUEUE_URL}" --attribute-names "QueueArn" 2>/dev/null | jq -r ".Attributes.QueueArn");
    echo "QUEUE_ARN: ${QUEUE_ARN}";
    echo "QUEUE_URL: ${QUEUE_URL}";

    # Create event-source mapping
    echo "Creating event-source mapping between function ${QUEUE_NAME} and queue ARN: ${QUEUE_ARN}";
    deploy_event_source_mapping $QUEUE_NAME $QUEUE_ARN;
}


function clean_up {
    echo "Cleaning up";
    python aws-lambda-sqs-clean.py;
}

#
# Deploys all functions in the events directory
#
function deploy_event_functions {
  MAIN_DIR=$PWD
  for FUNCTION in $(find atd-events -type d -mindepth 1 -maxdepth 1 ! -iname "tests");
  do
      FUNCTION_DIR=$(echo "${FUNCTION}" | cut -d "/" -f 2);
      FUNCTION_NAME="atd-vz-data-events-${FUNCTION_DIR}_${WORKING_STAGE}";
      echo "Current directory: ${PWD}";
      echo "Building function '${FUNCTION_NAME}' @ path: '${FUNCTION}'";
      cd $FUNCTION;
      echo "Entered directory: ${PWD}";
      install_requirements;
      bundle_function;
      generate_env_vars;
      deploy_event_function "$FUNCTION_NAME";
      deploy_sqs "$FUNCTION_NAME";
      cd $MAIN_DIR;
      echo "Exit, current path: ${PWD}";
  done;
}
