class HasuraAPIError(Exception):
    """Indicates an error when interacting with the Hasura graphQL API"""

    pass


class EMSPersonIdError(Exception):
    """Indicates violation of the unique ems__incidents_person_id_key constraint -
    this happens attempting to match an EMS record to a person record that is
    already matched to a different EMS records"""

    pass
