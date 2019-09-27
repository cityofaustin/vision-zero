#!/usr/bin/env bash

echo -e "\n\n"
echo -e "Starting email and zip file download process..."
echo -e "------------------------------------------------"
xvfb-run --server-args="-screen 0 1024x768x24" ruby download.rb
echo -e "Done.\n"

echo -e "\nStarting CSV processing..."
echo -e "------------------------------------------------"
python3 process.py
echo -e "Done.\n\n"