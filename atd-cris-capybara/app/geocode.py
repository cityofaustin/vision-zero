import requests
import os
import json

ATD_HERE_API_ENDPOINT="https://geocoder.api.here.com/6.2/geocode.json"

parameters = {
    "app_id": os.getenv("ATD_CRIS_HERE_APP_ID"),
    "app_code": os.getenv("ATD_CRIS_HERE_APP_CODE"),
    "searchtext": "1100 Congress Ave, Austin, TX 78701"
}

request = requests.get(ATD_HERE_API_ENDPOINT, params=parameters)

coordinates = request.json()['Response']['View'][0]['Result'][0]['Location']['DisplayPosition']

print(json.dumps(coordinates))

