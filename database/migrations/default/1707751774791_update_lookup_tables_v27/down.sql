-- Changes to table atd_txdot__agency_lkp
update public.atd_txdot__agency_lkp set agency_desc = 'HOUSTON BAPTIST UNIVERSITY POLICE DEPARTMENT' where agency_id = 1478;
delete from public.atd_txdot__agency_lkp where agency_id = 3339;
delete from public.atd_txdot__agency_lkp where agency_id = 3340;
delete from public.atd_txdot__agency_lkp where agency_id = 3341;
delete from public.atd_txdot__agency_lkp where agency_id = 3342;
delete from public.atd_txdot__agency_lkp where agency_id = 3343;
delete from public.atd_txdot__agency_lkp where agency_id = 3344;
delete from public.atd_txdot__agency_lkp where agency_id = 3345;
delete from public.atd_txdot__agency_lkp where agency_id = 3346;
delete from public.atd_txdot__agency_lkp where agency_id = 3347;
delete from public.atd_txdot__agency_lkp where agency_id = 3348;
delete from public.atd_txdot__agency_lkp where agency_id = 3349;
delete from public.atd_txdot__agency_lkp where agency_id = 3350;
delete from public.atd_txdot__agency_lkp where agency_id = 3351;
delete from public.atd_txdot__agency_lkp where agency_id = 3352;
delete from public.atd_txdot__agency_lkp where agency_id = 10221;
delete from public.atd_txdot__agency_lkp where agency_id = 10222;
delete from public.atd_txdot__agency_lkp where agency_id = 10223;
delete from public.atd_txdot__agency_lkp where agency_id = 10224;

-- Changes to table atd_txdot__autonomous_level_engaged_lkp
delete from public.atd_txdot__autonomous_level_engaged_lkp where autonomous_level_engaged_id = 3;
delete from public.atd_txdot__autonomous_level_engaged_lkp where autonomous_level_engaged_id = 4;
delete from public.atd_txdot__autonomous_level_engaged_lkp where autonomous_level_engaged_id = 5;
update public.atd_txdot__autonomous_level_engaged_lkp set autonomous_level_engaged_desc = 'AUTOMATION LEVEL ENGAGED UNKNOWN' where autonomous_level_engaged_id = 6;

-- Changes to table atd_txdot__drvr_lic_cls_lkp
update public.atd_txdot__drvr_lic_cls_lkp set drvr_lic_cls_desc = 'NOT REPORTED' where drvr_lic_cls_id = 95;

-- Changes to table atd_txdot__drvr_lic_endors_lkp
update public.atd_txdot__drvr_lic_endors_lkp set drvr_lic_endors_desc = 'NOT REPORTED' where drvr_lic_endors_id = 95;

-- Changes to table atd_txdot__drvr_lic_restric_lkp
update public.atd_txdot__drvr_lic_restric_lkp set drvr_lic_restric_desc = 'NOT REPORTED' where drvr_lic_restric_id = 95;

-- Changes to table atd_txdot__drvr_lic_type_lkp
update public.atd_txdot__drvr_lic_type_lkp set drvr_lic_type_desc = 'NOT REPORTED' where drvr_lic_type_id = 95;

-- Changes to table atd_txdot__ethnicity_lkp
update public.atd_txdot__ethnicity_lkp set ethnicity_desc = 'NOT REPORTED' where ethnicity_id = 95;

-- Changes to table atd_txdot__gndr_lkp
update public.atd_txdot__gndr_lkp set gndr_desc = 'NOT REPORTED' where gndr_id = 95;

-- Changes to table atd_txdot__injry_sev_lkp
update public.atd_txdot__injry_sev_lkp set injry_sev_desc = 'NOT REPORTED' where injry_sev_id = 95;

-- Changes to table atd_txdot__inv_da_lkp
delete from public.atd_txdot__inv_da_lkp where inv_da_id = 1662;
delete from public.atd_txdot__inv_da_lkp where inv_da_id = 1663;
delete from public.atd_txdot__inv_da_lkp where inv_da_id = 1682;
delete from public.atd_txdot__inv_da_lkp where inv_da_id = 1702;
delete from public.atd_txdot__inv_da_lkp where inv_da_id = 1703;

-- Changes to table atd_txdot__occpnt_pos_lkp
update public.atd_txdot__occpnt_pos_lkp set occpnt_pos_desc = 'NOT REPORTED' where occpnt_pos_id = 95;

-- Changes to table atd_txdot__prsn_type_lkp
update public.atd_txdot__prsn_type_lkp set prsn_type_desc = 'NOT REPORTED' where prsn_type_id = 95;

-- Changes to table atd_txdot__rpt_autonomous_level_engaged_lkp
delete from public.atd_txdot__rpt_autonomous_level_engaged_lkp where rpt_autonomous_level_engaged_id = 3;
delete from public.atd_txdot__rpt_autonomous_level_engaged_lkp where rpt_autonomous_level_engaged_id = 4;
delete from public.atd_txdot__rpt_autonomous_level_engaged_lkp where rpt_autonomous_level_engaged_id = 5;
update public.atd_txdot__rpt_autonomous_level_engaged_lkp set rpt_autonomous_level_engaged_desc = 'AUTOMATION LEVEL ENGAGED UNKNOWN' where rpt_autonomous_level_engaged_id = 6;

-- Dropping table atd_txdot__rpt_road_type_lkp
drop table if exists public.atd_txdot__rpt_road_type_lkp;

-- Dropping table atd_txdot__trauma_centers_lkp
drop table if exists public.atd_txdot__trauma_centers_lkp;

-- Changes to table atd_txdot__unit_dfct_lkp
delete from public.atd_txdot__unit_dfct_lkp where unit_dfct_id = 10;

-- Changes to table atd_txdot__veh_body_styl_lkp
delete from public.atd_txdot__veh_body_styl_lkp where veh_body_styl_id = 109;

-- Changes to table atd_txdot__veh_make_lkp
delete from public.atd_txdot__veh_make_lkp where veh_make_id = 794;
delete from public.atd_txdot__veh_make_lkp where veh_make_id = 795;
delete from public.atd_txdot__veh_make_lkp where veh_make_id = 796;
delete from public.atd_txdot__veh_make_lkp where veh_make_id = 797;
delete from public.atd_txdot__veh_make_lkp where veh_make_id = 799;
delete from public.atd_txdot__veh_make_lkp where veh_make_id = 800;
delete from public.atd_txdot__veh_make_lkp where veh_make_id = 801;
delete from public.atd_txdot__veh_make_lkp where veh_make_id = 802;
delete from public.atd_txdot__veh_make_lkp where veh_make_id = 803;
delete from public.atd_txdot__veh_make_lkp where veh_make_id = 805;
delete from public.atd_txdot__veh_make_lkp where veh_make_id = 808;
delete from public.atd_txdot__veh_make_lkp where veh_make_id = 809;
delete from public.atd_txdot__veh_make_lkp where veh_make_id = 811;
delete from public.atd_txdot__veh_make_lkp where veh_make_id = 812;
delete from public.atd_txdot__veh_make_lkp where veh_make_id = 813;
delete from public.atd_txdot__veh_make_lkp where veh_make_id = 815;
delete from public.atd_txdot__veh_make_lkp where veh_make_id = 817;
delete from public.atd_txdot__veh_make_lkp where veh_make_id = 818;
delete from public.atd_txdot__veh_make_lkp where veh_make_id = 819;

-- Changes to table atd_txdot__veh_mod_lkp
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5795;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5796;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5797;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5798;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5799;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5800;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5801;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5802;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5803;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5804;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5805;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5806;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5807;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5808;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5809;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5810;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5811;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5812;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5813;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5814;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5815;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5816;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5817;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5818;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5819;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5820;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5821;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5822;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5823;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5824;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5825;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5826;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5827;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5828;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5829;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5830;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5831;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5832;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5833;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5836;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5837;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5838;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5839;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5840;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5841;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5842;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5843;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5844;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5845;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5846;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5847;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5849;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5850;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5851;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5852;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5853;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5854;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5855;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5857;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5859;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5860;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5861;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5862;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5863;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5864;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5865;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5866;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5867;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5868;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5869;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5870;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5871;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5872;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5873;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5878;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5879;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5880;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5881;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5882;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5883;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5884;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5885;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5886;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5887;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5888;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5889;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5890;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5891;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5892;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5894;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5895;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5896;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5897;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5898;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5900;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5901;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5903;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5905;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5906;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5907;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5908;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5909;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5910;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5911;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5912;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5913;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5914;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5915;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5916;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5917;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5918;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5919;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5920;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5921;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5922;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5923;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5924;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5925;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5926;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5927;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5929;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5930;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5931;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5932;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5933;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5934;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5935;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5936;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5939;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5940;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5941;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5942;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5943;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5944;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5945;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5946;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5947;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5948;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5949;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5950;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5952;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5954;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5955;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5956;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5957;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5958;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5959;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5960;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5961;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5962;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5963;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5964;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5965;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5966;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5967;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5968;
delete from public.atd_txdot__veh_mod_lkp where veh_mod_id = 5969;
