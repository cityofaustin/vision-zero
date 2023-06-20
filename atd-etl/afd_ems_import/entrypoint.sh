#!/bin/bash

# spin up the SSH server so this image can be its own bastion
/usr/sbin/sshd

action=$1
echo "action: '$action'"
# Check for which program to run
if [ "$action" == "ems" ]; then
    python3 ./ems_incident_upload.py
elif [ "$action" == "afd" ]; then
    python3 ./afd_incident_upload.py
else
    echo "Invalid argument. Please specify either 'ems' or 'afd'."
fi