
import knackpy
import json
import os
from process_config import *

def record_exists(object_id, field_id, record_value):
    """
    Finds a record based on the object_id, field_id, and the value of that field.
    If the record is found, it returns the raw data, returns False if it cannot find the record.
    :param object_id: string The raw knack object_id
    :param field_id: string The raw knack field_id
    :param record_value: The value of that record
    :return: dict (the a
    """
    filters = {
      'match': 'and',
      'rules': [
        {
            'field': field_id,
            'operator':'is',
            'value': record_value
        }
      ]
    }

    response = knackpy.Knack(
        obj=object_id,
        app_id=ATD_CRIS_KNACK_DATA_APP['app_id'],
        api_key=ATD_CRIS_KNACK_DATA_APP['api_key'],
        filters=filters,
        page_limit=1,
        rows_per_page=1
    )

    try:
        if(len(response.data) > 0):
            return response.data_raw[0]
        else:
            return False
    except:
        return False


def record_create(object_id, record_raw):
    """
    Creates a record using raw data and the knack object_id (table)
    :param object_id: string The raw knack object id
    :param record_raw: dict The raw record that needs to be inserted.
    :return:
    """
    response = knackpy.record(
        record_raw,
        obj_key=object_id,
        app_id=ATD_CRIS_KNACK_DATA_APP['app_id'],
        api_key=ATD_CRIS_KNACK_DATA_APP['api_key'],
        method='create'
    )

    print("record_create() Response:")
    print(json.dumps(response))

    return isinstance(response, dict)

def record_update(object_id, record_raw):
    """
    Updates an existing record using raw data and the knack object_id (table)
    :param object_id: string The raw knack object id
    :param record_raw: dict The raw record that needs to be inserted.
    :return:
    """
    response = knackpy.record(
        record_raw,
        obj_key=object_id,
        app_id=ATD_CRIS_KNACK_DATA_APP['app_id'],
        api_key=ATD_CRIS_KNACK_DATA_APP['api_key'],
        method='update'
    )

    print("record_update() Response:")
    print(json.dumps(response))
    return isinstance(response, dict)


def knack_insert_or_update(data_table, unique_field_id, record):
    """
    It will first check if the record already exists in knack; if it cannot find it,
    then a new record will be created. If it is found, then it will be updated.
    :param data_table: string The Object id
    :param unique_field_id:
    :param record:
    :return:
    """

    print("unique_field_id: {}".format(unique_field_id))
    unique_id_value = record[unique_field_id]
    print("Checking if record '{}' exists with value '{}': ".format(unique_field_id,unique_id_value))
    exists = record_exists(data_table, unique_field_id, unique_id_value)

    if(exists is False):
        print("Record '{}' does not exist. CREATING!...".format(unique_id_value))
        return record_create(data_table, record)
    else:
        record['id'] = exists['id']
        print("Record '{}' exists! UPDATING...".format(record['id']))
        return record_update(data_table, record)

    print(json.dumps(record))
    print("\n\n")