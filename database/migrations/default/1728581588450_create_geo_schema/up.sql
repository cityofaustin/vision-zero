create schema if not exists geo;
alter table public.engineering_areas set schema geo;
alter table public.signal_engineer_areas set schema geo;
alter table public.council_districts set schema geo;
alter table public.apd_sectors set schema geo;
alter table public.zip_codes set schema geo;
alter table public.non_coa_roadways set schema geo;
alter table public.atd_jurisdictions set schema geo;
