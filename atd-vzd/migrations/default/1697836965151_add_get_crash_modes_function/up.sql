CREATE OR REPLACE FUNCTION public.units_get_crash_modes (input_crash_id integer)
	RETURNS json
	LANGUAGE plpgsql
	AS $function$
DECLARE
	totals json;
BEGIN
	SELECT
		INTO totals json_agg(row_to_json(result))
	FROM (
		SELECT
			vmode.mode_id,
			mode.atd_mode_category_mode_name AS mode_desc,
			vmode.unit_id,
			vmode.death_cnt,
			vmode.sus_serious_injry_cnt,
			vmode.nonincap_injry_cnt,
			vmode.poss_injry_cnt,
			vmode.non_injry_cnt,
			vmode.unkn_injry_cnt,
			vmode.tot_injry_cnt
		FROM (
			SELECT
				unit_id,
				atd_mode_category AS mode_id,
				death_cnt,
				sus_serious_injry_cnt,
				nonincap_injry_cnt,
				poss_injry_cnt,
				non_injry_cnt,
				unkn_injry_cnt,
				tot_injry_cnt
			FROM
				public.atd_txdot_units AS atu
			LEFT JOIN public.veh_unit_desc AS vdesc ON vdesc.id = atu.unit_desc_id
			LEFT JOIN public.veh_body_styl AS vbody ON vbody.id = atu.veh_body_styl_id
		WHERE
			crash_id = input_crash_id) AS vmode
	LEFT JOIN public.atd__mode_category_lkp AS mode ON mode.id = vmode.mode_id) AS result;
	RETURN totals;
END;
$function$
