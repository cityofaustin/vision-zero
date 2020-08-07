import json


def load_file(file_path: str) -> dict:
    """
    Loads a json into a dictionary
    :param str file_path: The file location
    :return dict:
    """
    with open(file_path) as json_file:
        return json.load(json_file)
