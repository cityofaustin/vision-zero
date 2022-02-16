```
docker run -it -v `pwd`:/root/ vz-ocr-lighting bash
docker build -t vz-ocr-lighting .; docker run -it -v `pwd`:/root --env-file=.env vz-ocr-lighting bash


select crash_id, light_cond_id, ocr_light_cond_id
from atd_txdot_crashes;

select crash_id, crashes.light_cond_id, ocr_light_cond_id, atlcl_csv.light_cond_desc, atlcl_cr3.light_cond_desc
from atd_txdot_crashes crashes
join atd_txdot__light_cond_lkp atlcl_csv on crashes.light_cond_id = atlcl_csv.light_cond_id
join atd_txdot__light_cond_lkp atlcl_cr3 on crashes.ocr_light_cond_id = atlcl_cr3.light_cond_id
where ocr_light_cond_id is not null
and ocr_light_cond_id != crashes.light_cond_id;

select count(*), light_cond_id = ocr_light_cond_id as is_correct
from atd_txdot_crashes
where ocr_light_cond_id is not null
group by light_cond_id = ocr_light_cond_id;
```