alter table "public"."atd_txdot_person"
  add constraint "atd_txdot_person_ems_id_fkey"
  foreign key ("ems_id")
  references "public"."ems__incidents"
  ("id") on update restrict on delete set null;
