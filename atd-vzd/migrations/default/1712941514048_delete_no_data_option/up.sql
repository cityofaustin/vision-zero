-- Remove the custom "NO DATA" lookup option, instead we should just use null to mean null
DELETE FROM public.atd_txdot__veh_body_styl_lkp WHERE veh_body_styl_id = -1;

UPDATE public.atd_txdot_units SET veh_body_styl_id = null WHERE veh_body_styl_id = -1;
