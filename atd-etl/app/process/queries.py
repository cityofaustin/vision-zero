"""
Query Helpers
Author: Austin Transportation Department, Data and Technology Services

Description: The purpose of this script is to generate graphql queries
to run against the Hasura endpoint. These methods include the searching
of existing records, mutations, deletions, etc.

Important: These methods do not require the graphql queries to be
executed, they only generate the queries and delegate the execution
to whatever script is running them.
"""


def search_crash_query(crash_id):
    """
    Generates a graphql query to search for a crash
    :param crash_id: string - The Crash ID to search for.
    :return: string
    """
    return """
        query search_crash_query {
          atd_txdot_crashes(limit: 1, where: {crash_id: {_eq: %CRASH_ID%}}){
            crash_id
          }
        }
    """.replace("%CRASH_ID%", crash_id)


def search_person(line):
    """
    Generates a graphql query to search for a specific person.
    :param line: string - The raw CSV line
    :return: string
    """
    # (p.crash_id, p.unit_nbr, p.prsn_nbr, p.prsn_type_id, p.prsn_occpnt_pos_id)
    return line


def search_primaryperson(line):
    """
    Generates a graphql query to search for a specific primary person.
    :param line: string - The raw CSV line
    :return: string
    """
    # (p.crash_id, p.unit_nbr, p.prsn_nbr, p.prsn_type_id, p.prsn_occpnt_pos_id)
    return line


def search_charges(line):
    """
    Generates a graphql query to search for a specific charge.
    :param line: string - The raw CSV line
    :return: string
    """
    # Search by everything
    charge = line.split(",")


    return """
        query search_charges {
            atd_txdot_charges(
                where: {
                    crash_id: {_eq: %s},
                    unit_nbr: {_eq: %s}
                    prsn_nbr: {_eq: %s},
                    charge_cat_id: {_eq: %s},
                    charge: {_eq: ""},
                    citation_nbr: {_eq: ""},
                }
            ) {
            charge_id
          }
        }
    """ % (charge[0], charge[1], charge[2], charge[3], charge[4], charge[5])
    return line


def search_crash_query_full(crash_id, field_list):
    """
    Generates a graphql query to search for a crash
    :param crash_id: string - The Crash ID to search for.
    :return: string
    """
    return """
        query search_crash_query {
          atd_txdot_crashes(limit: 1, where: {crash_id: {_eq: %CRASH_ID%}}){
            %FIELD_LIST%
          }
        }
    """.replace("%CRASH_ID%", crash_id)\
        .replace("%FIELD_LIST%", "\n            ".join(field_list))