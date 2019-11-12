#!/usr/bin/env python
"""
Test - Run
Author: Austin Transportation Department, Data and Technology Office

Description: The purpose of this script is to help troubleshooting
running python commands within the splinter docker container.
"""

from process.config import ATD_ETL_CONFIG

print("Running a test within the ETL container. Checking access to environment variables.\n")

print("1. CRIS Website:     '%s'" % ATD_ETL_CONFIG["ATD_CRIS_WEBSITE"])
print("2. Hasura Endpoint:  '%s'" % ATD_ETL_CONFIG["HASURA_ENDPOINT"])

print("\nThe test has finished, check if you see the two environment variables above.\n")
