#!/usr/bin/env bash

# Determine work branch
case "${CIRCLE_BRANCH}" in
  "production")
    export WORKING_STAGE="production";
    ;;

  *)
    export WORKING_STAGE="staging";
    ;;
esac

# Deploys API to AWS
function deploy_aws_lambda {
    if [[ "${WORKING_STAGE}" == "" ]]; then
        echo "No working stage could be determined."
        exit 1;
    fi;

    if [[ "${AWS_ACCESS_KEY_ID}" == "" ]] || [[ "${AWS_SECRET_ACCESS_KEY}" = "" ]]; then
        echo "The AWS keys are not set"
        exit 1;
    fi;

    # Check ATD CR3 API
    cd "atd-cr3-api";

    python3 -m venv venv;
    source venv/bin/activate;
    pip install -r requirements.txt

    # Run zappa
    echo $ZAPPA_SETTINGS > zappa_settings.json;
    zappa update $WORKING_STAGE;
}
