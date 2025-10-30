class HasuraAPIError(Exception):
    """Indicates an error when interacting with the Hasura graphQL API"""

    pass


class EMSPersonIdError(Exception):
    """Indicates violation of the ems__incidents_person_id_key constraint when
    attempting to update an ems__incidents record"""

    pass
