import os
import json
import glob
import csv

from process_config import *
from process_pg import *
from process_templates import *
from process_knack import *
from process_aws import *


# Order:
order_of_execution = [
    "crash", # no dependencies
    "unit", # depends on crash_uid
    "primaryperson", # depends on crash_id, units
    "charges" # depends on: people, crash_id
]


records = run_query("SELECT * FROM %s LIMIT 1;" % ATD_CRIS_DATABASE_TABLES['primaryperson'])

for row in records:
    # Get the record type (so we can load a specific template)
    record_type = 'primaryperson'

    # Get a copy of our templates
    rt_template = load_template(record_type=record_type)
    rt_template_db = load_template_db(record_type=record_type)
    
    # Generate a raw record, based on the templates we gathered and our current row.
    record = template_hydrate(template=rt_template,
                    db_dict=rt_template_db,
                    db_row=row,
                    raw=True)

    # Check if it exists
    # response = knack_insert_or_update(data_table=VZ_DATA_APP['tables'][record_type],
    #     unique_field_id=VZ_DATA_APP['unique_field_id'][record_type],
    #     record=record
    # )

    print(json.dumps(record))
    print("\n\n---- DONE WITH DB ----\n\n")



# # 
# # We will need to concatenate all files into a single file:
# # 
# reports = "crash unit primaryperson charges"
# cmd = 'for REPORT in {}; '.format(reports)
# cmd += 'do echo " - ${REPORT}"; awk "FNR > 1" tmp/data/extract*$REPORT*.csv > tmp/data/$REPORT.concat.csv; done'
# print("Concatenating, please wait: " + cmd)
# os.system(cmd)


# 
# Then we are going to open each and parse each individual row
#

# # First we must generate the files that need to be read, in proper order of execution. 
# files = list(
#     # A lambda expression will create a list of files based on the order of execution
#     map(lambda x: "/app/tmp/data/{}.concat.csv".format(path, x), order_of_execution)
# )

# for current_file in files:
#     record_type = get_type(current_file)
#     if(record_type != 'unit'):
#         continue

#     print("Processing file: " + current_file)
#     try:
#         current_csv_file = open(current_file)
#         csv_file = csv.reader(current_csv_file, delimiter=',')

#     # Get a copy of our templates
#     rt_template = load_template(record_type=record_type)
#     rt_template_db = load_template_db(record_type=record_type)
    
#     i = 1
#     for row in csv_file:
#         print("{}: current_row: {}, crash_id: {}".format(record_type, i, row[0]))

#         # Generate a raw record, based on the templates we gathered and our current row.
#         record = template_hydrate(template=rt_template,
#                     db_dict=rt_template_db,
#                     db_row=row,
#                     raw=True)

#         print(json.dumps(record))

#         response = knack_insert_or_update(data_table=VZ_DATA_APP['tables'][record_type],
#             unique_field_id='field_1',
#             record=record
#         )

#         print(json.dumps(response))
        
        

#         if(i == 1):
#             break

#         i += 1

        

    # upload_to_s3(current_file)


