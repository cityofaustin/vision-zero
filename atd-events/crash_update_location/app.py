#
# Resolves the location for a crash.
#

import json
import requests
import time


def handler(event, context):
    """
    Event handler main loop. It handles a single or multiple SQS messages.
    :param dict event: One or many SQS messages
    :param dict context: Event context
    """
    for record in event['Records']:
        timeStr = time.ctime()
        print('Current Timestamp : ', timeStr)
        print(json.dumps(record))
        timeStr = time.ctime()
        print("Done executing: ", timeStr)
