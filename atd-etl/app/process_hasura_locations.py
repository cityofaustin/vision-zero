#!/usr/bin/env python
"""
Hasura - Locations
Author: Austin Transportation Department, Data and Technology Services

Description: This script searches through the crashes table (through
Hasura) in Postgres, for any crashes that do not have a location
assigned. If the crash cannot be associated to a location, then it
should skip it. Crashes with fatalities and serious injuries should
take priority.

Note: This script should run always in the background at a
proper interval.

The application requires the requests library:
    https://pypi.org/project/requests/
"""
import agolutil
import sys
import signal
import json
import glob
import concurrent.futures

print("Done with agolutil")