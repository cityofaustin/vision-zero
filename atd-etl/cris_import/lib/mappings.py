# This file is used to provide mappings and lists of fields for various purposes to the
# CRIS import flow. It's designed to provide the absolute minimum of information needed.
# Wherever data about a field can be queried from the database, the flow will do that,
# hopefully eliminating the need to maintain this file in the future, except when we need
# to mark a new field as editable by the VZ team.


def get_table_map():
    return {
        "crash": "atd_txdot_crashes",
        "unit": "atd_txdot_units",
        "person": "atd_txdot_person",
        "primaryperson": "atd_txdot_primaryperson",
        # this table needs to be reworked to use this system
        # "charges": "atd_txdot_charges",
    }


def get_key_columns():
    return {
        "atd_txdot_crashes": ["crash_id"],
        "atd_txdot_units": ["crash_id", "unit_nbr"],
        "atd_txdot_primaryperson": [
            "crash_id",
            "unit_nbr",
            "prsn_nbr",
            "prsn_type_id",
            "prsn_occpnt_pos_id",
        ],
        "atd_txdot_person": [
            "crash_id",
            "unit_nbr",
            "prsn_nbr",
            "prsn_type_id",
            "prsn_occpnt_pos_id",
        ],
        "atd_txdot_charges": ["crash_id", "prsn_nbr", "unit_nbr"],
    }


def no_override_columns():
    return {
        "atd_txdot_crashes": {
            "crash_id",  # key column
            "longitude_primary",
            "latitude_primary",
            "city_id",
            "crash_speed_limit",
            "road_type_id",
            "traffic_cntl_id",
            "crash_sev_id",
            "atd_fatality_count",
            "apd_confirmed_death_count",
            "tot_injry_cnt",
            "sus_serious_injry_cnt",
            "address_confirmed_primary",
            "address_confirmed_secondary",
            "private_dr_fl",
            "road_constr_zone_fl",
            "case_id",
            "sus_serious_injry_cnt",
            "intrsct_relat_id",
            "rpt_outside_city_limit_fl",
        },
        "atd_txdot_units": {
            "crash_id",  # key column
            "unit_nbr",  # key column
            "travel_direction",
            "movement_id",
            "sus_serious_injry_cnt",
            "unit_desc_id",
            "veh_body_styl_id",
        },
        "atd_txdot_person": {
            "crash_id",  # key column
            "unit_nbr",  # key column
            "prsn_nbr",  # key column
            "prsn_type_id",  # key column (but why?)
            "prsn_occpnt_pos_id",  # key column (but why?)
            "prsn_injry_sev_id",
            "prsn_age",
            "prsn_name_honorific",
            "prsn_last_name",
            "prsn_first_name",
            "prsn_mid_name",
            "prsn_gndr_id",
            "prsn_ethnicity_id",
        },
        "atd_txdot_primaryperson": {
            "crash_id",  # key column
            "unit_nbr",  # key column
            "prsn_nbr",  # key column
            "prsn_type_id",  # key column (but why?)
            "prsn_occpnt_pos_id",  # key column (but why?)
            "injury_severity",
            "prsn_age",
            "prsn_name_honorific",
            "prsn_last_name",
            "prsn_first_name",
            "prsn_mid_name",
            "prsn_gndr_id",
            "prsn_ethnicity_id",
        },
        "atd_txdot_charges": {
            "crash_id",  # key column
            "prsn_nbr",  # key column
            "unit_nbr",  # key column
            "charge_cat_id",  # FIXME in the bigger picture: we have misconfigured schema we store this value in
        },
    }
