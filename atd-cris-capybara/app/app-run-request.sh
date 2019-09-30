#!/usr/bin/env bash

echo -e "\n\n"
echo -e "Starting request process..."
echo -e "------------------------------------------------"
xvfb-run --server-args="-screen 0 1024x768x24" ruby request.rb
echo -e "Done.\n"
