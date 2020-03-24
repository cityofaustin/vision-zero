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
    unset WORKING_STAGE;
    echo "We can only deploy master or production.";
    exit 1;
    ;;
esac

# Deploys API to AWS
function deploy_aws_lambda {
    if [[ "${WORKING_STAGE}" == "" ]]; then
        echo "No working stage could be determined."
        exit 1;
    fi;

    # 
    cd "atd-cr3-api";

    python3 -m venv venv;
    source venv/bin/activate;
    pip install -r requirements.txt

    # Run zappa
    echo $ZAPPA_SETTINGS > zappa_settings.json;
    zappa update $WORKING_STAGE;
}
