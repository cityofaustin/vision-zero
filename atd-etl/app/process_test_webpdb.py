#!/usr/bin/env python
"""
Test - Web-PDB
Author: Austin Transportation Department, Data and Technology Services

Description: The purpose of this script is to run and test web-pdb
within the ETL docker container. Our ETL processes will expand in
complexity and they will become more difficult to debug, this tool
will become handy to help develop and troubleshoot our ETL processes.

The application requires the web-pdb library:
    https://pypi.org/project/web-pdb/
"""

import web_pdb

"""
Web-PDB Usage:
Insert the following line into your Python program at the point where you want to start debugging:

import web_pdb; web_pdb.set_trace()
The set_trace() call will suspend your program and open a web-UI at the default port 5555 (port value can be changed). Enter in your browser's address bar: http://<your Python machine hostname or IP>:5555, for example http://monty-python:5555, and you should see the web-UI like the one on the preceding screenshot. Now you can use all PDB commands and features. Additional Current file, Globals and Locals information boxes help you better track your program runtime state.

Subsequent set_trace() calls can be used as hardcoded breakpoints.

Web-PDB is compatible with the new breakpoint() function added in Python 3.7. Set environment variable PYTHONBREAKPOINT="web_pdb.set_trace" to launch Web-PDB with breakpoint().

Source: https://github.com/romanvm/python-web-pdb
"""

input = "This is the input variable"
output = input.replace("input", "output")

print("Running test debugger, you should be able to see these two lines in the debugger: \n")

print('input = "This is the input variable"')
print('output = "This is the output variable"')

print("\nTo proceed visit in your browser: http://localhost:5555")

web_pdb.set_trace()

print("The test has finished.")
