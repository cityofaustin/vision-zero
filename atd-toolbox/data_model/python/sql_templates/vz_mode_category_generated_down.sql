alter table units drop column vz_mode_category;

alter table units add column vz_mode_category integer
references lookups.mode_category_lkp (id)
on update restrict on delete restrict;
