alter table if exists lookups.coordination_partners rename to atd__coordination_partners_lkp;
alter table if exists lookups.atd__coordination_partners_lkp set schema public;
alter table if exists public.atd__coordination_partners_lkp rename column label to coord_partner_desc;
alter table if exists public.atd__coordination_partners_lkp drop column source;

alter index public.coordination_partners_pkey rename to atd__coordination_partners_lkp_pkey;
alter sequence public.coordination_partners_id_seq rename to atd__coordination_partners_lkp_id_seq;

update public.atd__coordination_partners_lkp set coord_partner_desc = 'Active Transportation' where coord_partner_desc = 'Active Transportation Division';
update public.atd__coordination_partners_lkp set coord_partner_desc = 'Arterial Management' where coord_partner_desc = 'Arterial Management Division';
update public.atd__coordination_partners_lkp set coord_partner_desc = 'Capital Metro' where coord_partner_desc = 'CapMetro';
update public.atd__coordination_partners_lkp set coord_partner_desc = 'Central Area Engineering Office' where coord_partner_desc = 'Central Area Engineering';
update public.atd__coordination_partners_lkp set coord_partner_desc = 'Corridor Program Office' where coord_partner_desc = 'Capital Delivery Services (Corridor Program)';
update public.atd__coordination_partners_lkp set coord_partner_desc = 'North Area Engineering Office' where coord_partner_desc = 'North Area Engineering';
update public.atd__coordination_partners_lkp set coord_partner_desc = 'South Area Engineering Office' where coord_partner_desc = 'South Area Engineering';

delete from public.atd__coordination_partners_lkp where coord_partner_desc in
('Homeless Strategy Office', 'AUS (Airport)', 'Project Delivery', 'Sidewalks and Urban Trails Division', 'Office of the City Engineer');

insert into public.atd__coordination_partners_lkp (coord_partner_desc) values ('Public Works Department');
