#
# Altered Lookup tables
#
alter table atd_txdot__bridge_srvc_type_on_lkp rename column bridge_svc_type_on_id to bridge_srvc_type_on_id;

alter table atd_txdot__bridge_srvc_type_on_lkp rename column bridge_svc_type_on_desc to bridge_srvc_type_on_desc;

alter table atd_txdot__cnty_lkp rename column cris_cnty_id to cnty_id;

alter table atd_txdot__cnty_lkp rename column cris_cnty_desc to cnty_desc;

alter table atd_txdot__cmv_evnt_lkp rename column cmv_evnt_id to cmv_event_id;

alter table atd_txdot__cmv_evnt_lkp rename column cmv_evnt_desc to cmv_event_desc;

alter table atd_txdot__cmv_evnt_lkp rename to atd_txdot__cmv_event_lkp;

alter table atd_txdot__cmv_trlr_type_lkp rename column trlr_type_id to cmv_trlr_type_id;

alter table atd_txdot__cmv_trlr_type_lkp rename column trlr_type_desc to cmv_trlr_type_desc;


