#!/usr/bin/env bash

PROCESS_TYPE=$1
SKIP_ROWS=$2
QUIT=0

function PreTrap {
    QUIT=1;
}

trap PreTrap SIGINT SIGTERM SIGTSTP

for CURRENT_FILE in $(find /data -name "extract_*$PROCESS_TYPE*.csv"); do
    if [[ "${QUIT}" = "1" ]]; then
        exit;
    fi;

    python3 process.py $PROCESS_TYPE $CURRENT_FILE $SKIP_ROWS;
done;