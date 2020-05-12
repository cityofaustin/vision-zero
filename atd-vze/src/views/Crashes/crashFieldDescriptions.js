/**
 * The Crash important difference fields is an object that contains the fields (as a key)
 * and its attributes (as a value).
 * @type {object}
 */

export const crashFieldDescription = {
    "case_id": {
        type: "string"
    },
    "crash_date": {
        type: "date"
    },
    "crash_time": {
        type: "time"
    },
    "crash_fatal_fl": {
        type: "flag"
    },
    "private_dr_fl": {
        type: "flag"
    },
    "rpt_outside_city_limit_fl": {
        type: "flag"
    },
    "rpt_latitude": {
        type: "double"
    },
    "rpt_longitude": {
        type: "double"
    },
    "rpt_hwy_num": {
        type: "string"
    },
    "rpt_block_num": {
        type: "string"
    },
    "rpt_street_name": {
        type: "string"
    },
    "rpt_sec_hwy_num": {
        type: "string"
    },
    "rpt_sec_block_num": {
        type: "string"
    },
    "rpt_sec_street_name": {
        type: "string"
    },
    "hwy_nbr": {
        type: "string"
    },
    "hwy_sys": {
        type: "string"
    },
    "hwy_sys_2": {
        type: "string"
    },
    "hwy_nbr_2": {
        type: "string"
    },
    "city_id": {
        type: "integer"
    },
    "latitude": {
        type: "double"
    },
    "longitude": {
        type: "double"
    },
    "street_name": {
        type: "string"
    },
    "street_nbr": {
        type: "string"
    },
    "street_name_2": {
        type: "string"
    },
    "street_nbr_2": {
        type: "string"
    },
    "sus_serious_injry_cnt": {
        type: "integer"
    },
    "nonincap_injry_cnt": {
        type: "integer"
    },
    "poss_injry_cnt": {
        type: "integer"
    },
    "non_injry_cnt": {
        type: "integer"
    },
    "unkn_injry_cnt": {
        type: "integer"
    },
    "tot_injry_cnt": {
        type: "integer"
    },
    "death_cnt": {
        type: "integer"
    },
};
