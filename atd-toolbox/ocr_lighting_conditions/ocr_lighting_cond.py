import os
import sys
from   uuid import uuid4
import logging
import requests
import argparse

import boto3
from   pdf2image import convert_from_path, convert_from_bytes

# configure logging
logging.basicConfig()
log = logging.getLogger('CR3_download')
log.setLevel(logging.DEBUG)


argparse = argparse.ArgumentParser(description = 'A utility to OCR lighting conditions from CR3 files')
argparse.add_argument("-v", "--verbose",
    help = 'Be verbose about actions',
    required=False,
    action = 'store_true')
args = argparse.parse_args()

print(args)

s3 = boto3.client('s3')

# get some environment variables to auth to S3
ACCESS_KEY = os.getenv('AWS_ACCESS_KEY_ID')
SECRET_KEY = os.getenv('AWS_SECRET_ACCESS_KEY')

query = """
query getCrashes($limit: Int!) {
  atd_txdot_crashes(limit: $limit, where: {ocr_light_cond_id: {_is_null: true}}) {
    crash_id
    light_cond_id
    ocr_light_cond_id
  }
}
"""

response = requests.post(
    url=os.getenv("GRAPHQL_ENDPOINT"),
    headers={
        "Accept": "*/*",
        "content-type": "application/json",
        "x-hasura-admin-secret": os.getenv("HASURA_ADMIN_KEY")
        },
    json={
        "query": query,
        "variables": {
            "limit": 1
            }
        }
    )

print(response)
for crash in response.json()['data']['atd_txdot_crashes']:
    print(crash)

    # build url and download the CR3
    #if (args.v):
        #print('Pulling CR3 PDF from S3');
    key =  os.getenv("CR3_PATH") + '/' + str(crash['crash_id']) + '.pdf'
    print(key)
    obj = []
    try:
        pdf = s3.get_object(Bucket=os.getenv("CR3_BUCKET"), Key=key)
    except:
        sys.stderr.write("Error: Failed to get PDF from the S3 object\n")
        continue

    #if (args.v):
        #print('Rendering PDF into images');
    pages = []
    pages = convert_from_bytes(pdf['Body'].read(), 150)


    #if (args.d):
        #if (args.v):
            #print('Excuting a check for a digitally created PDF');
    digital_end_to_end = True
    # these pixels are expected to be black on digitally created PDFs
    pixels = [(110,3520), (3080, 3046), (3050, 2264), (2580, 6056), (1252, 154), (2582, 4166), (1182, 1838)]
    for pixel in pixels:
        rgb_pixel = pages[1].getpixel(pixel)
        if not(rgb_pixel[0] == 0 and rgb_pixel[1] == 0 and rgb_pixel[2] == 0):
            digital_end_to_end = False
        #if (args.v):
            #print('Pixel' + "(%04d,%04d)" % pixel + ': ' + str(rgb_pixel))
    #if (args.v):
        #print('PDF Digital End to End?: ' + str(digital_end_to_end));
    #if not(digital_end_to_end):
        #if (args.v):
            #sys.stderr.write("Error: Non-digitally created PDF detected.\n")
        #continue
    if digital_end_to_end:
        print("digi")

        #diagram_uuid = uuid4()
        #buffer = io.BytesIO()
        diagram_image = pages[1].crop((3360,3400,3600,3510))
        path =  './extracts/' + str(crash['crash_id']) + '.png'
        diagram_image.save(path)

        #diagram_image.save(buffer, format='PNG')
