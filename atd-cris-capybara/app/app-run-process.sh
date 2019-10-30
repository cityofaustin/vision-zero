#!/usr/bin/env bash

PROCESS_TYPE=$1

for CURRENT_FILE in $(find ./data -name "extract_*$PROCESS_TYPE*.csv");
do
    python3 process.py $PROCESS_TYPE $CURRENT_FILE;
done;