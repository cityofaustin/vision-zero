"""
Helper Methods
Author: Austin Transportation Department, Data and Technology Office

Description: The purpose of this script is to provide any methods that
assist any script associated to this application.
"""

import sys
import glob
import csv
import io
import re
import json

# Dependencies
from .queries import search_crash_query
from .request import run_query


def generate_template(name, function, fields):
    """
    Returns a string with a graphql template
    :param name:
    :param function:
    :param fields:
    :return:
    """
    return """
        mutation %NAME% {
          %FUNCTION%(
            objects: {
            %FIELDS%
            }
          ){
            affected_rows
          }
        }
    """.replace("%NAME%", name)\
        .replace("%FUNCTION%", function)\
        .replace("%FIELDS%", fields)


def remove_field(input, fields):
    """
    Removes fields froma field list in a graphql query
    :param input:
    :param fields:
    :return:
    """
    output = input
    for field in fields:
        output = re.sub(r"%s: ([a-zA-Z0-9\"]+)(, )?" % field, "", output)

    return output


def quote_numeric(input, fields):
    """
    Quotes a numeric value for graphql insertin
    :param input:
    :param fields:
    :return:
    """
    output = input
    for field in fields:
        output = re.sub(r"%s: ([0-9]+)(,?)" % field, r'%s: "\1"\2' % field, output)

    return output


def lowercase_group_match(match):
    return match.group(1).lower() + ":"


def generate_fields(line, fieldnames, remove_fields = [], quoted_numeric = []):
    """
    Generates a list of fields for graphql query
    :param line:
    :param fieldnames:
    :param remove_fields:
    :return:
    """
    reader = csv.DictReader(f=io.StringIO(line), fieldnames=fieldnames, delimiter=',') # parse line
    fields = json.dumps([row for row in reader]) # Generate json
    fields = re.sub(r'"([a-zA-Z0-9_]+)":', lowercase_group_match, fields) # Clean the keys
    fields = re.sub(r'"([0-9\.]+)"', r'\1', fields) # Clean the values
    fields = remove_field(fields, remove_fields) # Remove fields
    fields = fields.replace('""', "null").replace ("[{", "").replace("}]", "") # Clean up
    fields = fields.replace(", ", ", \n") # Break line
    fields = quote_numeric(fields, quoted_numeric)  # Quote Numeric Text
    fields = fields.replace(", ", "") # Remove commas
    return fields


def get_crash_id(line):
    """
    Takes a raw CSV line and returns a crash_id
    :param line: string - The raw CSV line
    :return: string - The Crash ID
    """
    try:
        return line.strip().split(",")[0]
    except Exception as e:
        print("Error: " + str(e))
        return ""


def generate_gql(line, fieldnames, type):
    """
    Returns a string with the final graphql query
    :param type:
    :param fields:
    :return:
    """

    if type == "crash":
        remove = []
        numerictext = [
            "id_number",
            "case_id",
            "street_nbr",
            "street_name",
            "surf_width",
            "surf_type_id",
            "hp_shldr_right",
            "hp_shldr_left",
            "hp_median_width",
            "rpt_hwy_num",
            "rpt_block_num",
            "rpt_sec_block_num",
            "rpt_sec_hwy_num",
            "rpt_street_name",
            "rpt_sec_street_name",
            "rpt_sec_street_desc",
            "rpt_ref_mark_nbr",
            "roadbed_width",
            "hwy_nbr",
            "hwy_nbr_2",
            "hwy_dsgn_hrt_id",
            "base_type_id",
            "nbr_of_lane",
            "row_width_usual",
            "hwy_dsgn_lane_id",
            "local_use",
            "ori_number",
            "investigat_notify_meth",
            "wdcode_id",
        ]

        fields = generate_fields(line,
                                 fieldnames,
                                 remove_fields=remove,
                                 quoted_numeric=numerictext)
        return generate_template(name="insertCrashQuery",
                                 function="insert_atd_txdot_crashes",
                                 fields=fields)

    if type == "charges":
        print("CHAAARGE")
        remove = []
        numerictext = []
        fields = generate_fields(line,
                                 fieldnames,
                                 remove_fields=remove,
                                 quoted_numeric=numerictext)
        return generate_template(name="insertChargeQuery",
                                 function="insert_atd_txdot_charges",
                                 fields=fields)

    if type == "unit":
        remove = []
        numerictext = []
        fields = generate_fields(line,
                                 fieldnames,
                                 remove_fields=remove,
                                 quoted_numeric=numerictext)
        return generate_template(name="insertUnitQuery",
                                 function="insert_atd_txdot_units",
                                 fields=fields)

    if type == "person":
        remove = []
        numerictext = []
        fields = generate_fields(line,
                                 fieldnames,
                                 remove_fields=remove,
                                 quoted_numeric=numerictext)
        return generate_template(name="insertPersonQuery",
                                 function="insert_atd_txdot_person",
                                 fields=fields)

    if type == "primaryperson":
        remove = []
        numerictext = ["drvr_zip"]
        fields = generate_fields(line,
                                 fieldnames,
                                 remove_fields=remove,
                                 quoted_numeric=numerictext)
        return generate_template(name="insertPersonQuery",
                                 function="insert_atd_txdot_primaryperson",
                                 fields=fields)

    return ""


def record_exists_hook(line, type):
    """
    Returns True if the record already exists, False if it cannot find it.
    :param line: string - The raw record in CSV format
    :param type: string - The parameter as passed to the terminal
    :return: boolean - True if the record exists, False otherwise.
    """

    # If the record type is a crash:
    if type == "crash":
        """
            Approach: 
                - Crashes:
                    1. Checks if the crash is already there
                    2. If the crash does not exist then returns False
                    3. Script will attempt to insert
                - Others:
                    - Assume the record isn't there.
                    - Let fail at insertion.
        """
        crash_id = get_crash_id(line)
        query = search_crash_query(crash_id)

        try:
            result = run_query(query)
            return len(result["data"]["atd_txdot_crashes"]) > 0
        except Exception:
            return True

    # Any other record types just assume false.
    # In the future we may want to write a function that
    # performs searches.
    return False


def handle_record_error_hook(line, gql, type):
    """
    Returns true to stop the execution of this script, false to mark as a non-error and move on.
    :param line: string - the csv line being processed
    :param gql: string - the graphql query that was at fault
    :param type: string - the type of record being processed
    :return: bool - True to signal error and stop execution, False otherwise.
    """

    # If this is a crash, we want to know why it didn't insert, so we need to stop.
    if type == "crash":
        print(gql)
        return True

    # If not a crash, we are not interested to know what happened. Move on to next one.
    # This is because the other records do not have a primary key, so to avoid duplicates
    # we rely on unique indexes. So if a duplicate record tries to insert, it just fails.
    # So there is no need to stop the rest of the execution.
    else:
        crash_id = get_crash_id(line)
        print("Error skipping: %s (%s)" % (crash_id, type))
        return False


def get_file_list(type):
    """
    Returns a list of all files to be processed
    :param type: string - The type to be used: crash, charges, person, primaryperson, unit
    :return: array
    """
    return glob.glob("/data/extract_*%s*.csv" % type)


def generate_run_config():
    """
    It takes the arguments passed to the python script and it generates
    a configuration json dictionary with a list of all csv files to process
    and the number of lines to skip per file.
    :return: dict
    """

    # Our dictionary template
    config = {
        "file_dryrun": False,
        "file_type": "",
        "file_list_raw": [],
        "skip_rows_raw": []
    }

    # First we try to get the file type from the 1st argument
    try:
        config["file_type"] = str(sys.argv[1]).lower()
    except:
        # Or force quit, we really need it.
        print("No file type provided")
        exit(1)

    # Gather a skip rows expressions
    try:
        sr_expression = str(sys.argv[2]).lower()
        config["skip_rows_raw"] = sr_expression.split(",")
    except:
        config["skip_rows_raw"] = []

    # We need to determine if this is a dry-run
    try:
        if "--dryrun" in sys.argv:
            config["file_dryrun"] = True
            print("WE SHEEE DRY MODE")
        else:
            config["file_dryrun"] = False
            print("DO NOT SHEEE DRY MODE")
    except:
        config["file_dryrun"] = False
        print("Dry-run not defined, assuming runing without dry-run mode.")

    # Gather the list of files
    config["file_list_raw"] = get_file_list(type=config["file_type"])

    # Final list placeholder
    finalFileList = []

    # For every file in the list
    for i in range(0, len(config["file_list_raw"])):
        # Get the file path
        file = config["file_list_raw"][i]

        try:
            # Try reading the number of lines in different array
            # or assume zero on exception.
            skip_lines_string = config["skip_rows_raw"][i]

            # If this is a star, signal we are going to skip all lines.
            if skip_lines_string == "*":
                skip_lines_string = "-1"

            # Parse string number into actual integer
            skip_lines_value = int(skip_lines_string)
        except:
            # On failure assume zero
            skip_lines_value = 0

        # Append a mini-dictionary into the finalFileList
        finalFileList.append({
            "file": file,
            "skip": skip_lines_value
        })

    # Assign to the final template the finalFileList array of dictionaries
    config["file_list"] = finalFileList

    # Return the config
    return config


