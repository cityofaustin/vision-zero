
import re
import json 
from dateutil.parser import parse
from process_knack import *

def load_template(record_type):
    """
    Retrieves a copy of a template, based on the record type.
    :param record_type: string The descriptor of the record type (ie. crash, primaryperson, unit, or charges)
    :return:
    """
    templates = {
        "crash": rt_template_crash,
        "primaryperson": rt_template_primaryperson,
        "unit": rt_template_unit,
        "charges": rt_template_charges
    }
    return templates.get(record_type, None).copy()

def load_template_db(record_type):
    """
    Retrieves the row location index, for either database or csv parsing.
    :param record_type: string The descriptor of the record type (ie. crash, primaryperson, unit, or charges)
    :return:
    """
    templates = {
        "crash": rt_template_crash_db,
        "primaryperson": rt_template_primaryperson_db,
        "unit": rt_template_unit_db,
        "charges": rt_template_charges_db
    }
    return templates.get(record_type, None).copy()

def is_date(string, fuzzy=False):
    """
    Return whether the string can be interpreted as a date.

    :param string: str, string to check for date
    :param fuzzy: bool, ignore unknown tokens in string if True
    """
    try: 
        parse(string, fuzzy=fuzzy)
        return True

    except ValueError:
        return False

def value_sanitize(v):
    """
    Cleans up a string for use in knack.
    :param v:  string The string to be sanitized
    :return:
    """
    if(v == None or isinstance(v, int) or isinstance(v, float)):
        return v

    return str(v)


def template_swap(template):
    """
    Changes the values of the keys from knack field names to knack field ids.
    :param template: dict The template that needs to be switched.
    :return: Returns a dict with the different keys
    """
    output = {}
    for key in template:
        output[template[key]] = key
    return output

def template_empty(template):
    """
    Empties every value in the template.
    :param template: dict The template that needs every value to be emptied.
    :return:
    """
    output = {}
    for key in template:
        output[key] = None

    return output


def extract_keys_from_format(format_string):
    """
    Extracts the column names from a string template format found in knack. For example,
     If the input is `{Prsn_Nbr}_{Unit_Nbr}_{Crash_ID}` the output will be an array:
     ["Prsn_Nbr","Unit_Nbr","Crash_ID"]

    :param format_string: string The knack value template.
    :return: array
    """
    return re.findall(r'{(\w+)}', format_string)

def generate_composite_value(template, db_dict, db_row, field_id):
    """
    Gathers a value for a composite time. For example, if it reads this format: {Prsn_Nbr}_{Unit_Nbr}_{Crash_ID}
    it will gather the value for each one of those columns and build it accordingly to that template.
    :param template:
    :param db_dict:
    :param db_row:
    :param field_id:
    :return:
    """
    value_format = template[field_id]['format']
    value_output = value_format
    value_array = extract_keys_from_format(value_format)
    # For each key in the composite format:
    for key in value_array:
        # Find the dict index:
        index = db_dict[str(key).lower()]
        # Then it's value
        value = db_row[index]
        # Then inject value to output
        value_output = value_output.replace("{" + key + "}", str(value))
    return value_output

def gather_connection_value(template, db_dict, db_row, field_id):
    """
    If the current field is a connection, then it will try to gather the value of the column, and it will try
    to find the record on the opposite table. If it fids it, it will gather the internal knack record id of that record
    and associate it to the current column.

    :param template: dict The current template model
    :param db_dict: dict The current index model
    :param db_row: array The current row (csv or database)
    :param field_id:
    :return:
    """
    # First we need to get the column name where we need to draw data from
    value_from = template[field_id]['value_from']
    # Then we need the knack object_id where we need to get data from the cloud.
    value_from_object_id = template[field_id]['object_id']
    # Now we need to know the field_id that we will use to find the record (usually crash_id)
    value_from_field_id = template[field_id]['field_id']
    # Now we need the index number in the csv array or table row array, based on the field name.
    from_field_index = db_dict[str(value_from).lower()]
    # Now we gather the value from the csv/db array based on the index.
    from_field_value = db_row[from_field_index]

    # We will now try to find the record from the specific object, field_id, and value.
    connection_record = record_exists(object_id=value_from_object_id,
        field_id=value_from_field_id,
        record_value=from_field_value
    )

    # If nothing is found, then return None. Else, return the internal knack record id.
    if(connection_record is False):
        return None
    else:
        print(json.dumps(connection_record))
        return connection_record['id']


def template_hydrate(template, db_dict, db_row, raw=False):
    """
    Populates a template with the data from db_row. It makes all the necessary associations depending on the
    type of data in the field, whether it is a regular value, a composite value or a connection to another table.
    :param template:
    :param db_dict:
    :param db_row:
    :param raw:
    :return:
    """
    output = {}
    
    for field in template: 
        # try:
        print("We have a: " + str(type(template[field])))
        if(isinstance(template[field], dict)):
            # We have a composite value
            
            field_type = template[field]['type']
            key = template[field]['field_id'] if raw else field
            if(field_type == "connection"):
                print("We have a connection, gimmie a sec...")
                val = gather_connection_value(template=template,
                        db_dict=db_dict,
                        db_row=db_row,
                        field_id=field
                )
            if(field_type == "composite"):
                val = generate_composite_value(template=template,
                        db_dict=db_dict,
                        db_row=db_row,
                        field_id=field
                )
            output[key] = str(val)
        else:
            # We have a regular value
            key = template[field] if raw else field
            i = db_dict[str(field).lower()]
            val = value_sanitize(db_row[i])
            output[key] = value_sanitize(val)
        # except Exception as e:
        #     print("Error: " + str(e))
        #     output[key] = None
        #     print("WARNING: Invalid Field: " + field + " (Not found in database.)")
        
    
    return output




rt_template_crash = {
    "Crash_ID": "field_1",
    "Crash_Fatal_Fl": "field_2",
    "Cmv_Involv_Fl": "field_3",
    "Schl_Bus_Fl": "field_4",
    "Rr_Relat_Fl": "field_5",
    "Medical_Advisory_Fl": "field_6",
    "Amend_Supp_Fl": "field_7",
    "Active_School_Zone_Fl": "field_8",
    "Crash_Date": "field_9",
    "Crash_Time": "field_10",
    "Case_ID": "field_11",
    "Local_Use": "field_12",
    "Rpt_CRIS_Cnty_ID": "field_13",
    "Rpt_City_ID": "field_14",
    "Rpt_Outside_City_Limit_Fl": "field_15",
    "Thousand_Damage_Fl": "field_16",
    "Rpt_Latitude": "field_17",
    "Rpt_Longitude": "field_18",
    "Rpt_Rdwy_Sys_ID": "field_19",
    "Rpt_Hwy_Num": "field_20",
    "Rpt_Hwy_Sfx": "field_21",
    "Rpt_Road_Part_ID": "field_22",
    "Rpt_Block_Num": "field_23",
    "Rpt_Street_Pfx": "field_24",
    "Rpt_Street_Name": "field_25",
    "Rpt_Street_Sfx": "field_26",
    "Private_Dr_Fl": "field_27",
    "Toll_Road_Fl": "field_28",
    "Crash_Speed_Limit": "field_29",
    "Road_Constr_Zone_Fl": "field_30",
    "Road_Constr_Zone_Wrkr_Fl": "field_31",
    "Rpt_Street_Desc": "field_32",
    "At_Intrsct_Fl": "field_33",
    "Rpt_Sec_Rdwy_Sys_ID": "field_34",
    "Rpt_Sec_Hwy_Num": "field_35",
    "Rpt_Sec_Hwy_Sfx": "field_36",
    "Rpt_Sec_Road_Part_ID": "field_37",
    "Rpt_Sec_Block_Num": "field_38",
    "Rpt_Sec_Street_Pfx": "field_39",
    "Rpt_Sec_Street_Name": "field_40",
    "Rpt_Sec_Street_Sfx": "field_41",
    "Rpt_Ref_Mark_Offset_Amt": "field_42",
    "Rpt_Ref_Mark_Dist_Uom": "field_43",
    "Rpt_Ref_Mark_Dir": "field_44",
    "Rpt_Ref_Mark_Nbr": "field_45",
    "Rpt_Sec_Street_Desc": "field_46",
    "Rpt_CrossingNumber": "field_47",
    "Wthr_Cond_ID": "field_48",
    "Light_Cond_ID": "field_49",
    "Entr_Road_ID": "field_50",
    "Road_Type_ID": "field_51",
    "Road_Algn_ID": "field_52",
    "Surf_Cond_ID": "field_53",
    "Traffic_Cntl_ID": "field_54",
    "Investigat_Notify_Time": "field_55",
    "Investigat_Notify_Meth": "field_56",
    "Investigat_Arrv_Time": "field_57",
    "Report_Date": "field_58",
    "Investigat_Comp_Fl": "field_59",
    "ORI_Number": "field_60",
    "Investigat_Agency_ID": "field_61",
    "Investigat_Area_ID": "field_62",
    "Investigat_District_ID": "field_63",
    "Investigat_Region_ID": "field_64",
    "Bridge_Detail_ID": "field_65",
    "Harm_Evnt_ID": "field_66",
    "Intrsct_Relat_ID": "field_67",
    "FHE_Collsn_ID": "field_68",
    "Obj_Struck_ID": "field_69",
    "Othr_Factr_ID": "field_70",
    "Road_Part_Adj_ID": "field_71",
    "Road_Cls_ID": "field_72",
    "Road_Relat_ID": "field_73",
    "Phys_Featr_1_ID": "field_74",
    "Phys_Featr_2_ID": "field_75",
    "Cnty_ID": "field_76",
    "City_ID": "field_77",
    "Latitude": "field_78",
    "Longitude": "field_79",
    "Hwy_Sys": "field_80",
    "Hwy_Nbr": "field_81",
    "Hwy_Sfx": "field_82",
    "Dfo": "field_83",
    "Street_Name": "field_84",
    "Street_Nbr": "field_85",
    "Control": "field_86",
    "Section": "field_87",
    "Milepoint": "field_88",
    "Ref_Mark_Nbr": "field_89",
    "Ref_Mark_Displ": "field_90",
    "Hwy_Sys_2": "field_91",
    "Hwy_Nbr_2": "field_92",
    "Hwy_Sfx_2": "field_93",
    "Street_Name_2": "field_94",
    "Street_Nbr_2": "field_95",
    "Control_2": "field_96",
    "Section_2": "field_97",
    "Milepoint_2": "field_98",
    "Txdot_Rptable_Fl": "field_99",
    "Onsys_Fl": "field_100",
    "Rural_Fl": "field_101",
    "Crash_Sev_ID": "field_102",
    "Pop_Group_ID": "field_103",
    "Located_Fl": "field_104",
    "Day_of_Week": "field_105",
    "Hwy_Dsgn_Lane_ID": "field_106",
    "Hwy_Dsgn_Hrt_ID": "field_107",
    "Hp_Shldr_Left": "field_108",
    "Hp_Shldr_Right": "field_109",
    "Hp_Median_Width": "field_110",
    "Base_Type_ID": "field_111",
    "Nbr_Of_Lane": "field_112",
    "Row_Width_Usual": "field_113",
    "Roadbed_Width": "field_114",
    "Surf_Width": "field_115",
    "Surf_Type_ID": "field_116",
    "Curb_Type_Left_ID": "field_117",
    "Curb_Type_Right_ID": "field_118",
    "Shldr_Type_Left_ID": "field_119",
    "Shldr_Width_Left": "field_120",
    "Shldr_Use_Left_ID": "field_121",
    "Shldr_Type_Right_ID": "field_122",
    "Shldr_Width_Right": "field_123",
    "Shldr_Use_Right_ID": "field_124",
    "Median_Type_ID": "field_125",
    "Median_Width": "field_126",
    "Rural_Urban_Type_ID": "field_127",
    "Func_Sys_ID": "field_128",
    "Adt_Curnt_Amt": "field_129",
    "Adt_Curnt_Year": "field_130",
    "Adt_Adj_Curnt_Amt": "field_131",
    "Pct_Single_Trk_Adt": "field_132",
    "Pct_Combo_Trk_Adt": "field_133",
    "Trk_Aadt_Pct": "field_134",
    "Curve_Type_ID": "field_135",
    "Curve_Lngth": "field_136",
    "Cd_Degr": "field_137",
    "Delta_Left_Right_ID": "field_138",
    "Dd_Degr": "field_139",
    "Feature_Crossed": "field_140",
    "Structure_Number": "field_141",
    "I_R_Min_Vert_Clear": "field_142",
    "Approach_Width": "field_143",
    "Bridge_Median_ID": "field_144",
    "Bridge_Loading_Type_ID": "field_145",
    "Bridge_Loading_In_1000_Lbs": "field_146",
    "Bridge_Srvc_Type_On_ID": "field_147",
    "Bridge_Srvc_Type_Under_ID": "field_148",
    "Culvert_Type_ID": "field_149",
    "Roadway_Width": "field_150",
    "Deck_Width": "field_151",
    "Bridge_Dir_Of_Traffic_ID": "field_152",
    "Bridge_Rte_Struct_Func_ID": "field_153",
    "Bridge_IR_Struct_Func_ID": "field_154",
    "CrossingNumber": "field_155",
    "RRCo": "field_156",
    "Poscrossing_ID": "field_157",
    "WDCode_ID": "field_158",
    "Standstop": "field_159",
    "Yield": "field_160",
    "Incap_Injry_Cnt": "field_161",
    "Nonincap_Injry_Cnt": "field_162",
    "Poss_Injry_Cnt": "field_163",
    "Non_Injry_Cnt": "field_164",
    "Unkn_Injry_Cnt": "field_165",
    "Tot_Injry_Cnt": "field_166",
    "Death_Cnt": "field_167",
    "MPO_ID": "field_168",
    "Investigat_Service_ID": "field_169",
    "Investigat_DA_ID": "field_170",
    "Investigator_Narrative": "field_171"
}

rt_template_crash_db = {
    "crash_id": 0,
    "crash_fatal_fl": 1,
    "cmv_involv_fl": 2,
    "schl_bus_fl": 3,
    "rr_relat_fl": 4,
    "medical_advisory_fl": 5,
    "amend_supp_fl": 6,
    "active_school_zone_fl": 7,
    "crash_date": 8,
    "crash_time": 9,
    "case_id": 10,
    "local_use": 11,
    "rpt_cris_cnty_id": 12,
    "rpt_city_id": 13,
    "rpt_outside_city_limit_fl": 14,
    "thousand_damage_fl": 15,
    "rpt_latitude": 16,
    "rpt_longitude": 17,
    "rpt_rdwy_sys_id": 18,
    "rpt_hwy_num": 19,
    "rpt_hwy_sfx": 20,
    "rpt_road_part_id": 21,
    "rpt_block_num": 22,
    "rpt_street_pfx": 23,
    "rpt_street_name": 24,
    "rpt_street_sfx": 25,
    "private_dr_fl": 26,
    "toll_road_fl": 27,
    "crash_speed_limit": 28,
    "road_constr_zone_fl": 29,
    "road_constr_zone_wrkr_fl": 30,
    "rpt_street_desc": 31,
    "at_intrsct_fl": 32,
    "rpt_sec_rdwy_sys_id": 33,
    "rpt_sec_hwy_num": 34,
    "rpt_sec_hwy_sfx": 35,
    "rpt_sec_road_part_id": 36,
    "rpt_sec_block_num": 37,
    "rpt_sec_street_pfx": 38,
    "rpt_sec_street_name": 39,
    "rpt_sec_street_sfx": 40,
    "rpt_ref_mark_offset_amt": 41,
    "rpt_ref_mark_dist_uom": 42,
    "rpt_ref_mark_dir": 43,
    "rpt_ref_mark_nbr": 44,
    "rpt_sec_street_desc": 45,
    "rpt_crossingnumber": 46,
    "wthr_cond_id": 47,
    "light_cond_id": 48,
    "entr_road_id": 49,
    "road_type_id": 50,
    "road_algn_id": 51,
    "surf_cond_id": 52,
    "traffic_cntl_id": 53,
    "investigat_notify_time": 54,
    "investigat_notify_meth": 55,
    "investigat_arrv_time": 56,
    "report_date": 57,
    "investigat_comp_fl": 58,
    "investigator_name": 59,
    "id_number": 60,
    "ori_number": 61,
    "investigat_agency_id": 62,
    "investigat_area_id": 63,
    "investigat_district_id": 64,
    "investigat_region_id": 65,
    "bridge_detail_id": 66,
    "harm_evnt_id": 67,
    "intrsct_relat_id": 68,
    "fhe_collsn_id": 69,
    "obj_struck_id": 70,
    "othr_factr_id": 71,
    "road_part_adj_id": 72,
    "road_cls_id": 73,
    "road_relat_id": 74,
    "phys_featr_1_id": 75,
    "phys_featr_2_id": 76,
    "cnty_id": 77,
    "city_id": 78,
    "latitude": 79,
    "longitude": 80,
    "hwy_sys": 81,
    "hwy_nbr": 82,
    "hwy_sfx": 83,
    "dfo": 84,
    "street_name": 85,
    "street_nbr": 86,
    "control": 87,
    "section": 88,
    "milepoint": 89,
    "ref_mark_nbr": 90,
    "ref_mark_displ": 91,
    "hwy_sys_2": 92,
    "hwy_nbr_2": 93,
    "hwy_sfx_2": 94,
    "street_name_2": 95,
    "street_nbr_2": 96,
    "control_2": 97,
    "section_2": 98,
    "milepoint_2": 99,
    "txdot_rptable_fl": 100,
    "onsys_fl": 101,
    "rural_fl": 102,
    "crash_sev_id": 103,
    "pop_group_id": 104,
    "located_fl": 105,
    "day_of_week": 106,
    "hwy_dsgn_lane_id": 107,
    "hwy_dsgn_hrt_id": 108,
    "hp_shldr_left": 109,
    "hp_shldr_right": 110,
    "hp_median_width": 111,
    "base_type_id": 112,
    "nbr_of_lane": 113,
    "row_width_usual": 114,
    "roadbed_width": 115,
    "surf_width": 116,
    "surf_type_id": 117,
    "curb_type_left_id": 118,
    "curb_type_right_id": 119,
    "shldr_type_left_id": 120,
    "shldr_width_left": 121,
    "shldr_use_left_id": 122,
    "shldr_type_right_id": 123,
    "shldr_width_right": 124,
    "shldr_use_right_id": 125,
    "median_type_id": 126,
    "median_width": 127,
    "rural_urban_type_id": 128,
    "func_sys_id": 129,
    "adt_curnt_amt": 130,
    "adt_curnt_year": 131,
    "adt_adj_curnt_amt": 132,
    "pct_single_trk_adt": 133,
    "pct_combo_trk_adt": 134,
    "trk_aadt_pct": 135,
    "curve_type_id": 136,
    "curve_lngth": 137,
    "cd_degr": 138,
    "delta_left_right_id": 139,
    "dd_degr": 140,
    "feature_crossed": 141,
    "structure_number": 142,
    "i_r_min_vert_clear": 143,
    "approach_width": 144,
    "bridge_median_id": 145,
    "bridge_loading_type_id": 146,
    "bridge_loading_in_1000_lbs": 147,
    "bridge_srvc_type_on_id": 148,
    "bridge_srvc_type_under_id": 149,
    "culvert_type_id": 150,
    "roadway_width": 151,
    "deck_width": 152,
    "bridge_dir_of_traffic_id": 153,
    "bridge_rte_struct_func_id": 154,
    "bridge_ir_struct_func_id": 155,
    "crossingnumber": 156,
    "rrco": 157,
    "poscrossing_id": 158,
    "wdcode_id": 159,
    "standstop": 160,
    "yield": 161,
    "incap_injry_cnt": 162,
    "nonincap_injry_cnt": 163,
    "poss_injry_cnt": 164,
    "non_injry_cnt": 165,
    "unkn_injry_cnt": 166,
    "tot_injry_cnt": 167,
    "death_cnt": 168,
    "mpo_id": 169,
    "investigat_service_id": 170,
    "investigat_da_id": 171,
    "investigator_narrative": 172
}














rt_template_primaryperson = {
    "Crash_ID": "field_256",
    "Death_Cnt": "field_257",
    "Drvr_Drg_Cat_1_ID": "field_258",
    "Drvr_Lic_Cls_ID": "field_259",
    "Drvr_Lic_State_ID": "field_260",
    "Drvr_Lic_Type_ID": "field_261",
    "Drvr_Zip": "field_262",
    "Incap_Injry_Cnt": "field_263",
    "Non_Injry_Cnt": "field_264",
    "Nonincap_Injry_Cnt": "field_265",
    "Poss_Injry_Cnt": "field_266",
    "Prsn_Age": "field_267",
    "Prsn_Airbag_ID": "field_268",
    "Prsn_Alc_Rslt_ID": "field_269",
    "Prsn_Alc_Spec_Type_ID": "field_270",
    "Prsn_Bac_Test_Rslt": "field_271",
    "Prsn_Death_Time": "field_272",
    "Prsn_Drg_Rslt_ID": "field_273",
    "Prsn_Drg_Spec_Type_ID": "field_274",
    "Prsn_Ejct_ID": "field_275",
    "Prsn_Ethnicity_ID": "field_276",
    "Prsn_Gndr_ID": "field_277",
    "Prsn_Helmet_ID": "field_278",
    "Prsn_Injry_Sev_ID": "field_279",
    "Prsn_Nbr": "field_280",
    "Prsn_Occpnt_Pos_ID": "field_281",
    "Prsn_Rest_ID": "field_282",
    "Prsn_Sol_Fl": "field_283",
    "Prsn_Type_ID": "field_284",
    "Tot_Injry_Cnt": "field_285",
    "Unit_Nbr": "field_286",
    "atd_custom_Person_ID": {
        "field_id": "field_288",
        "type": "composite",
        "format": "{Prsn_Nbr}_{Unit_Nbr}_{Crash_ID}"
    },
    "atd_custom_Unit_ID": {
        "field_id": "field_291",
        "type": "composite",
        "format": "{Crash_ID}_{Unit_Nbr}"
    },
    "crash": {
        "field_id": "field_289",
        "type": "connection",
        "value_from": "Crash_ID",
        "object_id": "object_1",
        "remote_field_id": "field_1"
    },
    "unit": {
        "field_id": "field_290",
        "type": "connection",
        "value_from": "Unit_Nbr",
        "object_id": "object_2",
        "remote_field_id": "field_173"
    },
    "Unkn_Injry_Cnt": "field_287"
}

rt_template_primaryperson_db = {
    "crash_id": 0,
    "unit_nbr": 1,
    "prsn_nbr": 2,
    "prsn_type_id": 3,
    "prsn_occpnt_pos_id": 4,
    "prsn_name_honorific": 5,
    "prsn_last_name": 6,
    "prsn_first_name": 7,
    "prsn_mid_name": 8,
    "prsn_name_sfx": 9,
    "prsn_injry_sev_id": 10,
    "prsn_age": 11,
    "prsn_ethnicity_id": 12,
    "prsn_gndr_id": 13,
    "prsn_ejct_id": 14,
    "prsn_rest_id": 15,
    "prsn_airbag_id": 16,
    "prsn_helmet_id": 17,
    "prsn_sol_fl": 18,
    "prsn_alc_spec_type_id": 19,
    "prsn_alc_rslt_id": 20,
    "prsn_bac_test_rslt": 21,
    "prsn_drg_spec_type_id": 22,
    "prsn_drg_rslt_id": 23,
    "drvr_drg_cat_1_id": 24,
    "prsn_taken_to": 25,
    "prsn_taken_by": 26,
    "prsn_death_date": 27,
    "prsn_death_time": 28,
    "incap_injry_cnt": 29,
    "nonincap_injry_cnt": 30,
    "poss_injry_cnt": 31,
    "non_injry_cnt": 32,
    "unkn_injry_cnt": 33,
    "tot_injry_cnt": 34,
    "death_cnt": 35,
    "drvr_lic_type_id": 36,
    "drvr_lic_state_id": 37,
    "drvr_lic_number": 38,
    "drvr_lic_cls_id": 39,
    "drvr_dob": 40,
    "drvr_street_nbr": 41,
    "drvr_street_pfx": 42,
    "drvr_street_name": 43,
    "drvr_street_sfx": 44,
    "drvr_apt_nbr": 45,
    "drvr_city_name": 46,
    "drvr_state_id": 47,
    "drvr_zip": 48
}
















rt_template_unit = {
    "Crash_ID": "field_172",
    "Unit_Nbr": "field_173",
    "atd_custom_Unit_ID": {
        "field_id": "field_254",
        "type": "composite",
        "format": "{Crash_ID}_{Unit_Nbr}"
    },
    "Unit_Desc_ID": "field_174",
    "Veh_Parked_Fl": "field_175",
    "Veh_HNR_Fl": "field_176",
    "Veh_Lic_State_ID": "field_177",
    "VIN": "field_178",
    "Veh_Mod_Year": "field_179",
    "Veh_Color_ID": "field_180",
    "Veh_Make_ID": "field_181",
    "Veh_Mod_ID": "field_182",
    "Veh_Body_Styl_ID": "field_183",
    "Emer_Respndr_Fl": "field_184",
    "Ownr_Zip": "field_185",
    "Fin_Resp_Proof_ID": "field_186",
    "Fin_Resp_Type_ID": "field_187",
    "Veh_Dmag_Area_1_ID": "field_188",
    "Veh_Dmag_Scl_1_ID": "field_189",
    "Force_Dir_1_ID": "field_190",
    "Veh_Dmag_Area_2_ID": "field_191",
    "Veh_Dmag_Scl_2_ID": "field_192",
    "Force_Dir_2_ID": "field_193",
    "Veh_Inventoried_Fl": "field_194",
    "Veh_Transp_Name": "field_195",
    "Veh_Transp_Dest": "field_196",
    "Veh_Cmv_Fl": "field_197",
    "Cmv_Fiveton_Fl": "field_198",
    "Cmv_Hazmat_Fl": "field_199",
    "Cmv_Nine_Plus_Pass_Fl": "field_200",
    "Cmv_Veh_Oper_ID": "field_201",
    "Cmv_Carrier_ID_Type_ID": "field_202",
    "Cmv_Carrier_Zip": "field_203",
    "Cmv_Road_Acc_ID": "field_204",
    "Cmv_Veh_Type_ID": "field_205",
    "Cmv_GVWR": "field_206",
    "Cmv_RGVW": "field_207",
    "Cmv_Hazmat_Rel_Fl": "field_208",
    "Hazmat_Cls_1_ID": "field_209",
    "Hazmat_IDNbr_1_ID": "field_210",
    "Hazmat_Cls_2_ID": "field_211",
    "Hazmat_IDNbr_2_ID": "field_212",
    "Cmv_Cargo_Body_ID": "field_213",
    "Trlr1_GVWR": "field_214",
    "Trlr1_RGVW": "field_215",
    "Trlr1_Type_ID": "field_216",
    "Trlr2_GVWR": "field_217",
    "Trlr2_RGVW": "field_218",
    "Trlr2_Type_ID": "field_219",
    "Cmv_Evnt1_ID": "field_220",
    "Cmv_Evnt2_ID": "field_221",
    "Cmv_Evnt3_ID": "field_222",
    "Cmv_Evnt4_ID": "field_223",
    "Cmv_Tot_Axle": "field_224",
    "Cmv_Tot_Tire": "field_225",
    "Contrib_Factr_1_ID": "field_226",
    "Contrib_Factr_2_ID": "field_227",
    "Contrib_Factr_3_ID": "field_228",
    "Contrib_Factr_P1_ID": "field_229",
    "Contrib_Factr_P2_ID": "field_230",
    "Veh_Dfct_1_ID": "field_231",
    "Veh_Dfct_2_ID": "field_232",
    "Veh_Dfct_3_ID": "field_233",
    "Veh_Dfct_P1_ID": "field_234",
    "Veh_Dfct_P2_ID": "field_235",
    "Veh_Trvl_Dir_ID": "field_236",
    "First_Harm_Evt_Inv_ID": "field_237",
    "Incap_Injry_Cnt": "field_238",
    "Nonincap_Injry_Cnt": "field_239",
    "Poss_Injry_Cnt": "field_240",
    "Non_Injry_Cnt": "field_241",
    "Unkn_Injry_Cnt": "field_242",
    "Tot_Injry_Cnt": "field_243",
    "Death_Cnt": "field_244",
    "Cmv_Disabling_Damage_Fl": "field_245",
    "Cmv_Trlr1_Disabling_Dmag_ID": "field_246",
    "Cmv_Trlr2_Disabling_Dmag_ID": "field_247",
    "Cmv_Bus_Type_ID": "field_248",
    "Trlr_GVWR": "field_249",
    "Trlr_RGVW": "field_250",
    "Trlr_Type_ID": "field_251",
    "crash": {
        "field_id": "field_253",
        "type": "connection",
        "value_from": "Crash_ID",
        "object_id": "object_1",
        "remote_field_id": "field_1"
    },
    "Trlr_Disabling_Dmag_ID": "field_252"
}

rt_template_unit_db = {
    "crash_id": 0,
    "unit_nbr": 1,
    "unit_desc_id": 2,
    "veh_parked_fl": 3,
    "veh_hnr_fl": 4,
    "veh_lic_state_id": 5,
    "veh_lic_plate_nbr": 6,
    "vin": 7,
    "veh_mod_year": 8,
    "veh_color_id": 9,
    "veh_make_id": 10,
    "veh_mod_id": 11,
    "veh_body_styl_id": 12,
    "emer_respndr_fl": 13,
    "owner_lessee": 14,
    "ownr_last_name": 15,
    "ownr_first_name": 16,
    "ownr_mid_name": 17,
    "ownr_name_sfx": 18,
    "ownr_name_honorific": 19,
    "ownr_street_nbr": 20,
    "ownr_street_pfx": 21,
    "ownr_street_name": 22,
    "ownr_street_sfx": 23,
    "ownr_apt_nbr": 24,
    "ownr_city_name": 25,
    "ownr_state_id": 26,
    "ownr_zip": 27,
    "fin_resp_proof_id": 28,
    "fin_resp_type_id": 29,
    "fin_resp_name": 30,
    "fin_resp_policy_nbr": 31,
    "fin_resp_phone_nbr": 32,
    "veh_dmag_area_1_id": 33,
    "veh_dmag_scl_1_id": 34,
    "force_dir_1_id": 35,
    "veh_dmag_area_2_id": 36,
    "veh_dmag_scl_2_id": 37,
    "force_dir_2_id": 38,
    "veh_inventoried_fl": 39,
    "veh_transp_name": 40,
    "veh_transp_dest": 41,
    "veh_cmv_fl": 42,
    "cmv_fiveton_fl": 43,
    "cmv_hazmat_fl": 44,
    "cmv_nine_plus_pass_fl": 45,
    "cmv_veh_oper_id": 46,
    "cmv_carrier_id_type_id": 47,
    "cmv_carrier_id_nbr": 48,
    "cmv_carrier_corp_name": 49,
    "cmv_carrier_street_pfx": 50,
    "cmv_carrier_street_nbr": 51,
    "cmv_carrier_street_name": 52,
    "cmv_carrier_street_sfx": 53,
    "cmv_carrier_po_box": 54,
    "cmv_carrier_city_name": 55,
    "cmv_carrier_state_id": 56,
    "cmv_carrier_zip": 57,
    "cmv_road_acc_id": 58,
    "cmv_veh_type_id": 59,
    "cmv_gvwr": 60,
    "cmv_rgvw": 61,
    "cmv_hazmat_rel_fl": 62,
    "hazmat_cls_1_id": 63,
    "hazmat_idnbr_1_id": 64,
    "hazmat_cls_2_id": 65,
    "hazmat_idnbr_2_id": 66,
    "cmv_cargo_body_id": 67,
    "trlr1_gvwr": 68,
    "trlr1_rgvw": 69,
    "trlr1_type_id": 70,
    "trlr2_gvwr": 71,
    "trlr2_rgvw": 72,
    "trlr2_type_id": 73,
    "cmv_evnt1_id": 74,
    "cmv_evnt2_id": 75,
    "cmv_evnt3_id": 76,
    "cmv_evnt4_id": 77,
    "cmv_tot_axle": 78,
    "cmv_tot_tire": 79,
    "contrib_factr_1_id": 80,
    "contrib_factr_2_id": 81,
    "contrib_factr_3_id": 82,
    "contrib_factr_p1_id": 83,
    "contrib_factr_p2_id": 84,
    "veh_dfct_1_id": 85,
    "veh_dfct_2_id": 86,
    "veh_dfct_3_id": 87,
    "veh_dfct_p1_id": 88,
    "veh_dfct_p2_id": 89,
    "veh_trvl_dir_id": 90,
    "first_harm_evt_inv_id": 91,
    "incap_injry_cnt": 92,
    "nonincap_injry_cnt": 93,
    "poss_injry_cnt": 94,
    "non_injry_cnt": 95,
    "unkn_injry_cnt": 96,
    "tot_injry_cnt": 97,
    "death_cnt": 98,
    "cmv_disabling_damage_fl": 99,
    "cmv_trlr1_disabling_dmag_id": 100,
    "cmv_trlr2_disabling_dmag_id": 101,
    "cmv_bus_type_id": 102,
    "trlr_gvwr": 68,
    "trlr_rgvw": 69,
    "trlr_type_id": 70,
    "trlr_disabling_dmag_id": 70
}

















rt_template_charges = {
    "1": 1
}

rt_template_charges_db = {
    "1": 1
}