#!/usr/bin/env bash

case "${BRANCH_NAME}" in
"production")
  export WORKING_STAGE="production"
  ;;
*)
  export WORKING_STAGE="staging"
  ;;
esac

echo "SOURCE -> BRANCH_NAME: ${BRANCH_NAME}"
echo "SOURCE -> WORKING_STAGE: ${WORKING_STAGE}"

#
# Export environment variables that Hasura CLI will use
#
function export_hasura_env_vars() {
    # Use jq to get Hasura endpoint and admin secret from ZAPPA_SETTINGS
    export HASURA_GRAPHQL_ENDPOINT=$(echo ${ZAPPA_SETTINGS} | \
    jq -r ".\"${WORKING_STAGE}\".aws_environment_variables.HASURA_ENDPOINT")
    
    export HASURA_GRAPHQL_ADMIN_SECRET=$(echo ${ZAPPA_SETTINGS} | \
    jq -r ".\"${WORKING_STAGE}\".aws_environment_variables.HASURA_ADMIN_SECRET")
    
    # Remove /v1/graphql from the end of the graphql endpoint for Hasura CLI commands
    export HASURA_GRAPHQL_ENDPOINT=${HASURA_GRAPHQL_ENDPOINT%/v1/graphql}
}

#
# Apply migrations and metadata
#
function run_migration() {
  echo "----- MIGRATIONS STARTED -----";
  hasura --skip-update-check version;

  echo "Applying migration";
  hasura migrate apply \
  --skip-update-check --disable-interactive --database-name default \
  --admin-secret $HASURA_GRAPHQL_ADMIN_SECRET \
  --endpoint $HASURA_GRAPHQL_ENDPOINT;
  
  echo "Applying metadata";
  hasura metadata apply \
  --skip-update-check \
  --admin-secret $HASURA_GRAPHQL_ADMIN_SECRET \
  --endpoint $HASURA_GRAPHQL_ENDPOINT;
  
  echo "----- MIGRATIONS FINISHED -----";
}

#
# Controls the migration process
#
function run_migration_process() {
  cd ./database;
  echo "Running migration process @ ${PWD}"
  export_hasura_env_vars;
  run_migration;
}
