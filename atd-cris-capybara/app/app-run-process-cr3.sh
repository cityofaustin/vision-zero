#!/usr/bin/env bash

echo -e "\n\n"
echo -e "Starting CRIS Search CR3 request process..."
echo -e "------------------------------------------------"
xvfb-run --server-args="-screen 0 1024x768x24" ruby process_cr3.rb
echo -e "Done.\n"