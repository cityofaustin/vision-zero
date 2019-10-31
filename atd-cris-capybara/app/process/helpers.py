import csv
import io
import re
import json

from .queries import searchCrashQuery
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



def generate_gql(line, fieldnames, type):
    """
    Returns a string with the final graphql query
    :param type:
    :param fields:
    :return:
    """

    if type.lower() == "crash":
        remove = []
        numerictext = [
            "rpt_block_num",
            "rpt_sec_block_num",
            "id_number",
            "street_nbr"
        ]

        fields = generate_fields(line,
                                 fieldnames,
                                 remove_fields=remove,
                                 quoted_numeric=numerictext)
        return generate_template(name="insertCrashQuery",
                                 function="insert_atd_txdot_crashes",
                                 fields=fields)

    if type.lower() == "charges":
        remove = []
        numerictext = []
        fields = generate_fields(line,
                                 fieldnames,
                                 remove_fields=remove,
                                 quoted_numeric=numerictext)
        return generate_template(name="insertChargeQuery",
                                 function="insert_atd_txdot_charges",
                                 fields=fields)

    if type.lower() == "unit":
        remove = []
        numerictext = []
        fields = generate_fields(line,
                                 fieldnames,
                                 remove_fields=remove,
                                 quoted_numeric=numerictext)
        return generate_template(name="insertUnitQuery",
                                 function="insert_atd_txdot_units",
                                 fields=fields)

    if type.lower() == "person":
        remove = []
        numerictext = []
        fields = generate_fields(line,
                                 fieldnames,
                                 remove_fields=remove,
                                 quoted_numeric=numerictext)
        return generate_template(name="insertPersonQuery",
                                 function="insert_atd_txdot_person",
                                 fields=fields)

    if type.lower() == "primaryperson":
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

def record_exists(line, type):
    """
    Returns True if the record already exists, False if it cannot find it.
    :param line:
    :param type:
    :return:
    """
    if type.lower() == "crash":
        """
            Approach: 
                - We can try to get the record, and see if we receive anything using crash_id
        """
        crash_id = line.split(",")[0]
        query = searchCrashQuery(crash_id)

        try:
            result = run_query(query)
            return len(result["data"]["atd_txdot_crashes"]) > 0
        except Exception as e:
            print(str(e))
            return True 

    if type.lower() == "person":
        query = searchPerson(line)
        print("These are person records: " + query)

    if type.lower() == "priamryperson":
        query = searchPrimaryPerson(line)
        print("These are primary person records: " + query)

    if type.lower() == "charges":
        query = searchCharges(line)
        print("These are charges: " + query)

    if type.lower() == "units":
        query = searchUnits(line)
        print("These are units: " + query)


    # if type.lower() == "charges":
    # if type.lower() == "unit":
    # if type.lower() == "person":
    # if type.lower() == "primaryperson":

    return False