"""
Helper Methods
Author: Austin Transportation Department, Data and Technology Services

Description: The purpose of this script is to provide any methods that
assist any script associated to this application.
"""

import sys
import glob
import csv
import io
import json
import re
import datetime
from dateutil import parser

# Dependencies
from .queries import search_crash_query, search_crash_query_full
from .request import run_query
from .helpers_import_fields import (
    CRIS_TXDOT_FIELDS,
    CRIS_TXDOT_COMPARE_FIELDS_LIST,
    CRIS_TXDOT_COMPARE_FIELD_TYPE,
)
from .config import ATD_ETL_CONFIG


def generate_template(
    name, function, fields, fieldnames=[], upsert=False, constraint="", crash=False
):
    """
    Returns a string with a graphql template
    :param str name: The name of the graphql mutation
    :param str function: The name of the graphql function
    :param str fields: The value of the fields in graphql expression
    :param str[] fieldnames: An array of strings containing the names of the columns
    :param bool upsert: If true, adds upsert logic; false otherwise.
    :param str constraint: The name of the constraint on_conflict
    :return str:
    """
    if crash:
        update_cr3 = 'cr3_stored_flag: "N"'
        fieldnames += ["cr3_stored_flag"]
    else:
        update_cr3 = ""

    if upsert:
        on_conflict = """
            , on_conflict: {
              constraint: %CONFLICT_CONSTRAINT%,
              update_columns: [
                %CONFLICT_FIELDS%
              ]
            }
        """.replace(
            "%CONFLICT_CONSTRAINT%", constraint
        ).replace(
            "%CONFLICT_FIELDS%", ",\n".join([f.lower() for f in fieldnames])
        )

    else:
        on_conflict = ""

    return (
        """
        mutation %NAME% {
          %FUNCTION%(
            objects: {
                %FIELDS%
                %UPDATE_CR3%
            }
            %ON_CONFLICT%
          ){
            affected_rows
          } 
        }
    """.replace(
            "%NAME%", name
        )
        .replace("%FUNCTION%", function)
        .replace("%FIELDS%", fields)
        .replace("%UPDATE_CR3%", update_cr3)
        .replace("%ON_CONFLICT%", on_conflict)
    )


def lowercase_group_match(match):
    """
    Return the lowercase of a group match.
    :param match: raw string of the group match
    :return str: string in lower case
    """
    return "%s:" % match.group(1).lower()


def generate_fields_with_filters(line, fieldnames, filters=[]):
    """
    Generates a list of fields for graphql query
    :param line: string - The raw csv line
    :param fieldnames: array of strings - The fields to be used as headers
    :param filters: dict - The filters to be applied
    :return:
    """
    reader = csv.DictReader(
        f=io.StringIO(line), fieldnames=fieldnames, delimiter=","
    )  # parse line
    fields = json.dumps([row for row in reader])  # Generate json

    # Remove object characters
    fields = fields.replace("[{", "").replace("}]", "")
    # Lowercase the keys
    fields = re.sub(r'"([a-zA-Z0-9_]+)":', lowercase_group_match, fields)

    # Make empty strings null
    fields = re.sub(r'([a-zA-Z0-9_]+): "",', r"\1: null,", fields)

    # Break lines & remove ending commas
    fields = re.sub(r'(\, )(([^"]+)(: ?)(\")([^"]+)(\"))', r"\n\2", fields)
    fields = re.sub(r"(null, )([a-zA-Z0-9\_]+)", r"null\n\2", fields)
    fields = re.sub(r"(, )([a-zA-Z0-9\_]+)(: null)", r"\n\2: null", fields)

    # Apply filters
    for filter_group in filters:

        filter_function = filter_group[0]
        filter_function_arguments = filter_group[1]

        try:
            fields_copy = fields
            fields = filter_function(input=fields, fields=filter_function_arguments)
        except Exception as e:
            print("Error when applying filter: %s" % str(e))

    return fields


def get_crash_id(line):
    """
    Takes a raw CSV line and returns a crash_id
    :param str line: The raw CSV line
    :return str: The Crash ID
    """
    try:
        return line.strip().split(",")[0]
    except Exception as e:
        print("Error: " + str(e))
        return ""


def generate_gql(line, fieldnames, file_type, upsert=True):
    """
    Returns a string with the final graphql query
    :param string line: The raw csv line
    :param string[] fieldnames: An array containing the names of fields
    :param string file_type: the type of insertion (crash, units, etc...)
    :param bool upsert: When True, it generates an on_conflict statement for upsertion.
    :return:
    """

    filters = CRIS_TXDOT_FIELDS[file_type]["filters"]
    query_name = CRIS_TXDOT_FIELDS[file_type]["query_name"]
    function_name = CRIS_TXDOT_FIELDS[file_type]["function_name"]

    try:
        fields = generate_fields_with_filters(
            line=line, fieldnames=fieldnames, filters=filters
        )

        # The variable `filters[0][1]` contains all the columns we need to remove.
        # We need `template_fields` to contain a lower-case array of all strings
        # in `fieldnames` as long as they are not in the removed list `filters[0][1]`
        template_fields = [
            field.lower() for field in fieldnames if field.lower() not in filters[0][1]
        ]

        # Generate Template
        template = generate_template(
            name=query_name,
            function=function_name,
            fields=fields,
            fieldnames=template_fields,
            upsert=upsert,
            constraint={
                "crash": "atd_txdot_crashes_pkey",
                "charges": "uniq_atd_txdot_charges",
                "unit": "atd_txdot_units_unique",
                "person": "atd_txdot_person_unique",
                "primaryperson": "atd_txdot_primaryperson_unique",
            }.get(file_type, None),
            crash=(file_type == "crash"),
        )
    except Exception as e:
        print("generate_gql() Error: " + str(e))
        template = ""

    return template


def record_exists_hook(line, file_type):
    """
    Returns True if the record already exists, False if it cannot find it.
    :param line: string - The raw record in CSV format
    :param file_type: string - The parameter as passed to the terminal
    :return: boolean - True if the record exists, False otherwise.
    """

    # If the record type is a crash:
    if file_type == "crash":
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
        except Exception as e:
            print("record_exists_hook() Error: " + str(e))
            return True

    # Any other record types just assume false.
    # In the future we may want to write a function that
    # performs searches.
    return False


def handle_record_error_hook(line, gql, file_type, response={}, line_number="n\a"):
    """
    Returns true to stop the execution of this script, false to mark as a non-error and move on.
    :param line: string - the csv line being processed
    :param gql: string - the graphql query that was at fault
    :param file_type: string - the type of record being processed
    :param response: dict - The json response from the request output
    :param line_number: string - The line number where the error occurs
    :return: bool - True to signal error and stop execution, False otherwise.
    """

    # We must ignore constraint-violation errors,
    # it means we are trying to overwrite a record.
    if "constraint-violation" in str(response):
        return False
    # Otherwise, this could be a legitimate problem,
    # for which we must stop the execution
    else:
        print(
            """\n\n------------------------------------------
Fatal Error
-----------------------------------------
Line:   \t%s 
CrashID:\t%s
Line:   \t%s
Type:   \t%s \n
Query:  \t%s \n
Response: %s \n
------------------------------------------\n\n
        """
            % (
                line_number,
                get_crash_id(line),
                str(line).strip(),
                file_type,
                gql,
                str(response),
            )
        )
        return True


def get_file_list(file_type):
    """
    Returns a list of all files to be processed
    :param file_type: string - The type to be used: crash, charges, person, primaryperson, unit
    :return: array
    """
    return glob.glob("/data/extract_*_%s_*.csv" % file_type)


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
        "skip_rows_raw": [],
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
        else:
            config["file_dryrun"] = False
    except:
        config["file_dryrun"] = False
        print("Dry-run not defined, assuming running without dry-run mode.")

    # Gather the list of files
    config["file_list_raw"] = get_file_list(file_type=config["file_type"])

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
        finalFileList.append({"file": file, "skip": skip_lines_value})

    # Assign to the final template the finalFileList array of dictionaries
    config["file_list"] = finalFileList

    # Return the config
    return config


def get_crash_record(crash_id):
    """
    Obtains a single crash record based on the crash_id
    :param crash_id: string - The crash id to obtain from the database
    :return: string
    """
    # First generate a query with a list of the columns we care about
    query = search_crash_query_full(
        crash_id=crash_id,
        field_list=(
            CRIS_TXDOT_COMPARE_FIELDS_LIST
            + [
                "apd_human_update",
                "geocode_provider",
                "qa_status",
                "updated_by",
                "changes_approved_date",
            ]
        ),
    )

    # Then try to run the query to get the actual record
    try:
        result = run_query(query)
        return result["data"]["atd_txdot_crashes"][0]

    except Exception as e:
        return None


def is_cris_date(string):
    """
    Returns True if the string is a date in mm/dd/yyyy format, False otherwise.
    :param string: string - The string being evaluated
    :return: boolean
    """
    return bool(re.match(r"(\d{2})\/(\d{2})\/(\d{4})", string))


def is_cris_time(string):
    """
    Returns True if string has a hh:mm (AM|PM) time format, returns False otherwise.
    :param string:
    :return:
    """
    return bool(re.match(r"(\d{2}):(\d{2}) (AM|PM)", string))


def convert_date(string):
    """
    Turns a mm/dd/yyyy date into a yyyy-mm-dd date.
    :param string: string - The date being converted
    :return: string
    """
    if is_cris_date(string):
        input_date = datetime.datetime.strptime(string, "%m/%d/%Y")
        return input_date.strftime("%Y-%m-%d")
    else:
        return string


def convert_time(string):
    """
    Converts a time string from a 12 hour format, to a 24 hour format
    :param string: string - The string being converted
    :return: string
    """
    if is_cris_time(string):
        input_time = datetime.datetime.strptime(string, "%I:%M %p")
        return input_time.strftime("%H:%M:00")
    else:
        return string


def clean_none_null(string):
    """
    Removes 'None' and 'null' from string
    :param string: string - The string being evaluated
    :return: string
    """
    return str(string).replace("None", "").replace("null", "")


def convert_decimal(string):
    """
    Takes a string and converts is into a decimal
    :param str string:
    :return float:
    """
    try:
        return float(string)
    except:
        return ""


def convert_integer(string):
    """
    Takes a string and converts is into a decimal
    :param str string:
    :return int:
    """
    try:
        return int(string)
    except:
        return ""


def clean_up_record(record):
    # Remove the crash_id record if present
    if "crash_id" in record:
        del record["crash_id"]

    # Get the lower case list of fields in CRIS_TXDOT_COMPARE_FIELD_TYPE
    field_names = [key.lower() for key in CRIS_TXDOT_COMPARE_FIELD_TYPE.keys()]

    # For each field, make necessary conversions...
    for field in field_names:
        if field not in record:
            continue
        # Remove None and null
        record[field] = clean_none_null(record[field])

        # Get the field type
        field_type = CRIS_TXDOT_COMPARE_FIELD_TYPE[field]

        # If not a date, time, decimal or int, skip...
        if field_type not in ["date", "time", "decimal", "int"]:
            continue

        # Convert CSV's date format to postgres format
        if field_type == "date":
            record[field] = convert_date(record[field])
        # Convert CSV's time format to postgres format
        if field_type == "time":
            record[field] = convert_time(record[field])
        # Parse Decimals
        if field_type == "decimal":
            record[field] = convert_decimal(record[field])
        # Parse Decimals
        if field_type == "int":
            record[field] = convert_integer(record[field])

    return record


def record_compare(record_new, record_existing):
    """
    Compares two dictionaries. It uses the CRIS_TXDOT_COMPARE_FIELDS_LIST
    to determine what fields are important enough, and returns list of differences
    :param dict record_new: The new object being parsed from csv
    :param dict record_existing: The existing object, as parsed from an HTTP query
    :return: list
    """
    differences = []
    record_new = clean_up_record(record_new)
    record_existing = clean_up_record(record_existing)

    for field in CRIS_TXDOT_COMPARE_FIELDS_LIST:
        if record_new.get(field, "") != record_existing.get(field, ""):
            differences.append(field)

    # Found no differences in any of the fields
    return differences


def generate_crash_record(line, fieldnames):
    """
    Translates a raw csv line into a python dictionary
    :param line: string - The raw csv line
    :param fieldnames: array of strings - The strings to be used as headers
    :return: dict
    """
    reader = csv.DictReader(
        f=io.StringIO(line), fieldnames=fieldnames, delimiter=","
    )  # parse line
    fields = json.dumps([row for row in reader])  # Generate json
    # Remove object characters
    fields = fields.replace("[", "").replace("]", "")
    # Return a dictionary
    return json.loads(fields)


def insert_crash_change_template(new_record_dict, differences, crash_id):
    """
    Generates a crash insertion graphql query
    :param new_record_dict: dict - The new record as a dictionary
    :param differences
    :param str crash_id
    :return: string
    """

    new_record_crash_date = None
    try: 
        new_record_crash_date = new_record_dict["crash_date"].strftime("%Y-%m-%d")  #convert_date(new_record_dict["crash_date"])
    except:
        print("Failed to convert crash_date")

    for key in new_record_dict:
        if isinstance(new_record_dict[key], datetime.date):
            new_record_dict[key] = new_record_dict[key].strftime("%Y-%m-%d")
        if isinstance(new_record_dict[key], datetime.time):
            new_record_dict[key] = new_record_dict[key].strftime("%H:%M:%S")

    # Turn the dictionary into a character-escaped json string
    new_record_escaped = json.dumps(json.dumps(new_record_dict), default=str)
    # Build the template and inject required values
    output = (
        """
        mutation insertCrashChangeMutation {
          insert_atd_txdot_changes(
            objects: {
              record_id: %NEW_RECORD_ID%,
              record_json: %NEW_RECORD_ESCAPED_JSON%,
              record_uqid: %NEW_UNIQUE_ID%
              record_type: "crash",
              affected_columns: %AFFECTED_COLUMNS%,
              status_id: 0,
              updated_by: "System",
              crash_date: %NEW_RECORD_CRASH_DATE%
            },
            on_conflict: {
              constraint: atd_txdot_changes_unique,
              update_columns: [
                record_id,
                record_json,
                record_type,
                affected_columns,
                status_id,
                updated_by
                crash_date
              ]
            }
          ) {
            affected_rows
          }
        }
        """.replace(
            "%NEW_RECORD_ESCAPED_JSON%", new_record_escaped
        )
        .replace("%NEW_RECORD_ID%", crash_id)
        .replace("%NEW_UNIQUE_ID%", crash_id)
        .replace("%AFFECTED_COLUMNS%", json.dumps(json.dumps(differences), default=str))
        .replace(
            "%NEW_RECORD_CRASH_DATE%",
            "null" if new_record_crash_date is None else f'"{new_record_crash_date}"',
        )
    )
    return output


def can_record_update(record):
    """
    Return true if changes_approved_date is greater than 3 days
    :param dict record: The current record being evaluated
    :return bool:
    """
    # Try getting changes_approved_date from record
    try:
        approved_time = parser.parse(record["changes_approved_date"])
        delta = datetime.datetime.now() - approved_time
        return delta.days > 3
    except:
        return True


def is_human_updated(record):
    """
    Returns true if the record has been edited by a human.
    :param dict record:
    :return bool:
    """
    return (
        (record["apd_human_update"] == "Y")
        or (record["geocode_provider"] == 5 and record["qa_status"] == 3)
        or (str(record["updated_by"]).endswith("@austintexas.gov"))
    )


def is_important_update(differences):
    return "death_cnt" in differences or "sus_serious_injry_cnt" in differences


def record_crash_compare(line, fieldnames, crash_id, record_existing):
    """
    Hook that finds an existing record, and compares it with a new incoming record built from a raw csv line.
    :param str line: The raw csv line
    :param str[] fieldnames: The strings to be used as headers
    :param str crash_id: crash id
    :param str record_existing: existing record
    :return tuple(bool, string): False if we want to ignore changes. True if it needs to be updated. Returns a feedback message
    """
    # Gather the field names
    fieldnames = [column.lower() for column in fieldnames]
    # Double check if the record is valid, if not exit.
    if record_existing is None:
        return True, "The record is invalid or non-existing"
    # The record is valid, it needs queueing or an upsert.
    else:
        # First generate a new crash record object from line
        record_new = generate_crash_record(line=line, fieldnames=fieldnames)
        # Now calculate the differences
        differences = record_compare(
            record_new=record_new, record_existing=record_existing
        )
        # Determine if record is updated by human:
        human_updated = is_human_updated(record=record_existing)
        # Checks if death_cnt or sus_serious_injry_cnt has changed
        important_update = is_important_update(differences)
        # Check if it can update based on changes_approved_date
        can_update = can_record_update(record=record_existing)
        # If there are no differences, just ignore...
        if len(differences) == 0:
            return False, "There are no differences, ignored."
        else:
            print(differences)

        # check if record is at least 3 days old
        if can_update is False:
            # It's too soon, ignore change.
            return False, "Cannot update this record (Record is not older than 3 days)"

        # There are differences, and it can automatically update unless
        # either human_updated or important_update is true
        compare_enabled = (
            ATD_ETL_CONFIG["ATD_CRIS_IMPORT_COMPARE_FUNCTION"] == "ENABLED"
        )
        if human_updated:
          return False, "Skipping changes on manually QA/updated record"
        elif important_update:
            affected_rows = 0
            if compare_enabled:
                mutation_template = insert_crash_change_template(
                    new_record_dict=record_new,
                    differences=differences,
                    crash_id=crash_id,
                )
                result = run_query(mutation_template)

                if "errors" in result:
                    print("GraphQL Error:")
                    print(mutation_template)
                    print(result)
                try:
                    affected_rows = result["data"]["insert_atd_txdot_changes"][
                        "affected_rows"
                    ]
                except:
                    affected_rows = 0

            if affected_rows == 1:
                print("\tCreated (or updated existing) change request (%s)" % crash_id)
                # We return false because we captured the changes into
                # a request on the database via run_query (Hasura)
                return False, "Record Queued"
            else:
                raise Exception("Failed to insert crash review request: %s" % crash_id)
        # Not human edited, update everything automatically.
        else:
            return True, "Record update in order"


def is_crash_in_queue(crash_id):
    """
    Returns True if it can find a new crash in the changes list.
    :param str crash_id: The crash_id to query for
    :return bool:
    """
    query = """
        query findChange {
          atd_txdot_changes(
                limit: 1, 
                offset: 0,
                where: {
                    record_type : {_eq: "crash"},
                    record_id: {_eq: "%CRASH_ID%"},
                    status_id: {_eq:0}
                }
            ) {
            record_id
            record_type
          }
        }
    """.replace(
        "%CRASH_ID%", crash_id
    )
    response = run_query(query)
    return len(response["data"]["atd_txdot_changes"]) > 0


def csv_to_dict(line, fieldnames):
    """
    Turns a csv line into a dictionary
    :param str line: A comma-separated line
    :param str[] fieldnames: An array of strings containing the headers for each column to be used as keys.
    :return dict:
    """
    reader = csv.DictReader(
        f=io.StringIO(line),
        fieldnames=list(map(lambda x: x.lower(), fieldnames)),
        delimiter=",",
    )  # parse line
    return json.dumps([row for row in reader])  # Generate json


def aggregate_values(values_list, values_keys):
    """
    Returns a string with concatenated values based on a dictionary values and a list of keys
    :param dict values_list: The dictionary to get values from
    :param str[] values_keys: A list of strings to be used as keys
    :return str:
    """
    output = ""
    for key in values_keys:
        output += values_list.get(key, "")
    return output


def record_unique_identifier(line, fieldnames, file_type):
    """
    Generates a unique identifier string based on the file type.
    :param str line: The current line being processed
    :param list fieldnames: The list of headers
    :param str file_type: The type of file to be inserted
    :return str:
    """
    try:
        record = json.loads(csv_to_dict(line=line, fieldnames=fieldnames))[0]
        output = {
            "crash": aggregate_values(record, ["crash_id"]),
            "person": aggregate_values(record, ["crash_id", "unit_nbr", "prsn_nbr"]),
            "primaryperson": aggregate_values(
                record, ["crash_id", "unit_nbr", "prsn_nbr"]
            ),
            "unit": aggregate_values(record, ["crash_id", "unit_nbr"]),
            "charges": aggregate_values(
                record, ["crash_id", "unit_nbr", "prsn_nbr", "charge_cat_id"]
            ),
        }.get(file_type, "")
        return output
    except:
        return ""


def insert_secondary_table_change(line, fieldnames, file_type):
    """
    Inserts a secondary crash record, returns True if it succeeds.
    :param str line: The current line being processed
    :param list fieldnames: The list of headers
    :param str file_type: The type of file to be inserted
    :return bool:
    """
    crash_id = get_crash_id(line)
    unique_id = record_unique_identifier(
        line=line, fieldnames=fieldnames, file_type=file_type
    )

    if len(unique_id) == 0:
        raise Exception("Could not generate a unique id")

    query = (
        """
        mutation insertNewSecondaryChange {
          insert_atd_txdot_changes(
                objects: {
                    record_id: %CRASH_ID%
                    record_type: "%TYPE%",
                    record_json: %CONTENT%,
                    record_uqid: %UNIQUE_ID%
                    status_id: 0,
                }
             , on_conflict: {
                constraint: atd_txdot_changes_unique,
                update_columns: [
                    record_id
                    record_type
                    record_json
                    record_uqid
                    status_id
                ]
            }
            ) {
            affected_rows
          }
        }
    """.replace(
            "%CRASH_ID%", crash_id
        )
        .replace("%TYPE%", file_type)
        .replace("%UNIQUE_ID%", unique_id)
        .replace(
            "%CONTENT%",
            # Equivalent to running json.dumps(json.dumps(dict)) in order
            # to escape special characters into a valid graphql string.
            json.dumps(csv_to_dict(line=line, fieldnames=fieldnames)),
        )
    )
    # Run the graphql query
    result = run_query(query)
    if "errors" in result:
        print("GraphQL Error:")
        print(query)
        print(result)

    try:
        # Return True if we have succeeded, False otherwise.
        return result["data"]["insert_atd_txdot_changes"]["affected_rows"] > 0
    except:
        raise Exception(
            "Failed to insert %s to review request: %s" % (file_type, crash_id)
        )


def get_case_id(line):
    """
    Returns the case id for a given csv line
    :param str line: The csv line in question
    :return str: The case_id string
    """
    try:
        return line.strip().split(",")[10]
    except Exception as e:
        print("Error: " + str(e))
        return ""


def get_list_temp_records():
    """
    Returns an array of strings containing the case_id of all temp records in the database
    :return dict: The crash_ids mapped to a case_id
    """
    query = """
        query findTempCrashes {
          atd_txdot_crashes(
            where: {
              temp_record: {_eq: true},
              _and:[
                {case_id: {_is_null: false}},
                {case_id: {_neq:""}},  
              ]
            }
          ){
            case_id
            crash_id
          }
        }
    """
    # Let's run the above query
    result = run_query(query)

    # If we have any errors, let's print it for troubleshooting
    if "errors" in result:
        print("GraphQL Error:")
        print(query)
        print(result)

    # Map the case_ids to a crash id and return
    return dict(
        list(
            map(
                lambda node: (node["case_id"], str(node["crash_id"])),
                result["data"]["atd_txdot_crashes"],
            )
        )
    )


def delete_temp_record(crash_id):
    """
    It deletes the crash id across multiple tables.
    :param str crash_id: The crash id to be deleted.
    """
    query = """
        mutation deleteCrash {
            delete_atd_txdot_crashes(where: {crash_id: { _eq: $crashId }}){
                affected_rows
            }
            delete_atd_txdot_units(where: {crash_id: { _eq: $crashId }}){
                affected_rows
            }
            delete_atd_txdot_primaryperson(where: {crash_id: { _eq: $crashId }}){
                affected_rows
            }
            delete_atd_txdot_person(where: {crash_id: { _eq: $crashId }}){
                affected_rows
            }
        }
    """.replace(
        "$crashId", crash_id
    )

    response = run_query(query)
    print("Deletion Response")
    print(response)
