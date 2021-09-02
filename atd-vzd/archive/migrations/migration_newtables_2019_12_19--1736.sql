CREATE TABLE IF NOT EXISTS atd_txdot__bridge_ir_struct_func_lkp
(
    bridge_ir_struct_func_id    integer not null
        constraint atd_txdot__bridge_ir_struct_func_lkp_pk
            primary key,
    bridge_ir_struct_func_desc  varchar(128),
    eff_beg_date varchar(32),
    eff_end_date varchar(32)
);


CREATE TABLE IF NOT EXISTS atd_txdot__bus_type_lkp
(
    bus_type_id    integer not null
        constraint atd_txdot__bus_type_lkp_pk
            primary key,
    bus_type_desc  varchar(128),
    eff_beg_date varchar(32),
    eff_end_date varchar(32)
);



CREATE TABLE IF NOT EXISTS atd_txdot__carrier_type_lkp
(
    carrier_type_id    integer not null
        constraint atd_txdot__carrier_type_lkp_pk
            primary key,
    carrier_type_desc  varchar(128),
    eff_beg_date varchar(32),
    eff_end_date varchar(32)
);


CREATE TABLE IF NOT EXISTS atd_txdot__cmv_trlr_type_lkp
(
    cmv_trlr_type_id    integer not null
        constraint atd_txdot__cmv_trlr_type_lkp_pk
            primary key,
    cmv_trlr_type_desc  varchar(128),
    eff_beg_date varchar(32),
    eff_end_date varchar(32)
);



CREATE TABLE IF NOT EXISTS atd_txdot__drug_category_lkp
(
    drug_category_id    integer not null
        constraint atd_txdot__drug_category_lkp_pk
            primary key,
    drug_category_desc  varchar(128),
    eff_beg_date varchar(32),
    eff_end_date varchar(32)
);



CREATE TABLE IF NOT EXISTS atd_txdot__ethnicity_lkp
(
    ethnicity_id    integer not null
        constraint atd_txdot__ethnicity_lkp_pk
            primary key,
    ethnicity_desc  varchar(128),
    eff_beg_date varchar(32),
    eff_end_date varchar(32)
);



CREATE TABLE IF NOT EXISTS atd_txdot__func_sys_lkp
(
    func_sys_id    integer not null
        constraint atd_txdot__func_sys_lkp_pk
            primary key,
    func_sys_desc  varchar(128),
    eff_beg_date varchar(32),
    eff_end_date varchar(32)
);



CREATE TABLE IF NOT EXISTS atd_txdot__ins_proof_lkp
(
    ins_proof_id    integer not null
        constraint atd_txdot__ins_proof_lkp_pk
            primary key,
    ins_proof_desc  varchar(128),
    eff_beg_date varchar(32),
    eff_end_date varchar(32)
);


-- auto-generated definition
CREATE TABLE IF NOT EXISTS atd_txdot__ins_type_lkp
(
    ins_type_id    integer not null
        constraint atd_txdot__ins_type_lkp_pk
            primary key,
    ins_type_desc  varchar(128),
    eff_beg_date varchar(32),
    eff_end_date varchar(32)
);


-- auto-generated definition
CREATE TABLE IF NOT EXISTS atd_txdot__intrsct_relat_lkp
(
    intrsct_relat_id    integer not null
        constraint atd_txdot__intrsct_relat_lkp_pk
            primary key,
    intrsct_relat_desc  varchar(128),
    eff_beg_date varchar(32),
    eff_end_date varchar(32)
);


-- auto-generated definition
CREATE TABLE IF NOT EXISTS atd_txdot__inv_da_lkp
(
    inv_da_id    integer not null
        constraint atd_txdot__inv_da_lkp_pk
            primary key,
    inv_da_desc  varchar(128),
    eff_beg_date varchar(32),
    eff_end_date varchar(32)
);


-- auto-generated definition
CREATE TABLE IF NOT EXISTS atd_txdot__inv_region_lkp
(
    inv_region_id    integer not null
        constraint atd_txdot__inv_region_lkp_pk
            primary key,
    inv_region_desc  varchar(128),
    eff_beg_date varchar(32),
    eff_end_date varchar(32)
);


-- auto-generated definition
CREATE TABLE IF NOT EXISTS atd_txdot__inv_service_lkp
(
    inv_service_id    integer not null
        constraint atd_txdot__inv_service_lkp_pk
            primary key,
    inv_service_desc  varchar(128),
    eff_beg_date varchar(32),
    eff_end_date varchar(32)
);


-- auto-generated definition
CREATE TABLE IF NOT EXISTS atd_txdot__road_cls_lkp
(
    road_cls_id    integer not null
        constraint atd_txdot__road_cls_lkp_pk
            primary key,
    road_cls_desc  varchar(128),
    eff_beg_date varchar(32),
    eff_end_date varchar(32)
);


-- auto-generated definition
CREATE TABLE IF NOT EXISTS atd_txdot__rural_urban_lkp
(
    rural_urban_id    integer not null
        constraint atd_txdot__rural_urban_lkp_pk
            primary key,
    rural_urban_desc  varchar(128),
    eff_beg_date varchar(32),
    eff_end_date varchar(32)
);


-- auto-generated definition
CREATE TABLE IF NOT EXISTS atd_txdot__shldr_use_lkp
(
    shldr_use_id    integer not null
        constraint atd_txdot__shldr_use_lkp_pk
            primary key,
    shldr_use_desc  varchar(128),
    eff_beg_date varchar(32),
    eff_end_date varchar(32)
);


-- auto-generated definition
CREATE TABLE IF NOT EXISTS atd_txdot__surf_type_lkp
(
    surf_type_id    integer not null
        constraint atd_txdot__surf_type_lkp_pk
            primary key,
    surf_type_desc  varchar(128),
    eff_beg_date varchar(32),
    eff_end_date varchar(32)
);


-- auto-generated definition
CREATE TABLE IF NOT EXISTS atd_txdot__tst_result_lkp
(
    tst_result_id    integer not null
        constraint atd_txdot__tst_result_lkp_pk
            primary key,
    tst_result_desc  varchar(128),
    eff_beg_date varchar(32),
    eff_end_date varchar(32)
);


-- auto-generated definition
CREATE TABLE IF NOT EXISTS atd_txdot__unit_desc_lkp
(
    unit_desc_id    integer not null
        constraint atd_txdot__unit_desc_lkp_pk
            primary key,
    unit_desc_desc  varchar(128),
    eff_beg_date varchar(32),
    eff_end_date varchar(32)
);


-- auto-generated definition
CREATE TABLE IF NOT EXISTS atd_txdot__veh_trvl_dir_lkp
(
    veh_trvl_dir_id    integer not null
        constraint atd_txdot__veh_trvl_dir_lkp_pk
            primary key,
    veh_trvl_dir_desc  varchar(128),
    eff_beg_date varchar(32),
    eff_end_date varchar(32)
);