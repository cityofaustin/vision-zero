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
# Waits until the local hasura server is ready
#
# TODO add skip check for default db
function run_migration() {
  echo "----- MIGRATIONS STARTED -----";
  hasura --skip-update-check version;
  echo "Applying migration";
  hasura --skip-update-check migrate apply;
  echo "Applying metadata";
  hasura --skip-update-check metadata apply;
  echo "----- MIGRATIONS FINISHED -----";
}

#
# Controls the migration process
#
function run_migration_process() {
  cd ./atd-vzd;
  echo "Running migration process @ ${PWD}"
  run_migration;
}