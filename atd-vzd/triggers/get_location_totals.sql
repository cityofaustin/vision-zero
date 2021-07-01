CREATE OR REPLACE FUNCTION public.get_location_totals(cr3_crash_date date, noncr3_crash_date date, cr3_location character varying, noncr3_location character varying, cost_per_crash numeric)
 RETURNS SETOF atd_location_crash_and_cost_totals
 LANGUAGE sql
 STABLE
AS $function$
with
  noncr3 as (
    select count(aab.case_id) as total_crashes,
    count(aab.case_id) * cost_per_crash as est_comp_cost
    from atd_apd_blueform aab
    where aab.location_id = noncr3_location
    and aab.date >= noncr3_crash_date
  ),
  cr3 as (
    select count(atc.crash_id) as total_crashes,
    sum(est_comp_cost) as est_comp_cost
    from atd_txdot_crashes atc
    where atc.location_id = cr3_location
    and atc.crash_date >= cr3_crash_date
  )
select cr3_location as location_id,
       cr3.total_crashes + noncr3.total_crashes as total_crashes,
       cr3.est_comp_cost + noncr3.est_comp_cost as total_est_comp_cost,
       cr3.total_crashes as cr3_total_crashes,
       cr3.est_comp_cost as cr3_est_comp_cost,
       noncr3.total_crashes as noncr3_total_crashes,
       noncr3.est_comp_cost as noncr3_est_comp_cost
from noncr3, cr3
  $function$
;
