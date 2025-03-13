-- Updating table name to coordination_partners and moving to lookups schema
alter table if exists atd__coordination_partners_lkp rename to coordination_partners;
alter table if exists coordination_partners set schema lookups;
alter table if exists lookups.coordination_partners rename column coord_partner_desc to label;
alter table if exists lookups.coordination_partners add column source text default 'vz' not null;

alter index lookups.atd__coordination_partners_lkp_pkey rename to coordination_partners_pkey;
alter sequence lookups.atd__coordination_partners_lkp_id_seq rename to coordination_partners_id_seq;

-- Updating, inserting, and deleting labels of coordination partners
update lookups.coordination_partners set label = 'Active Transportation Division' where label = 'Active Transportation';
update lookups.coordination_partners set label = 'Arterial Management Division' where label = 'Arterial Management';
update lookups.coordination_partners set label = 'CapMetro' where label = 'Capital Metro';
update lookups.coordination_partners set label = 'Central Area Engineering' where label = 'Central Area Engineering Office';
update lookups.coordination_partners set label = 'Capital Delivery Services (Corridor Program)' where label = 'Corridor Program Office';
update lookups.coordination_partners set label = 'North Area Engineering' where label = 'North Area Engineering Office';
update lookups.coordination_partners set label = 'South Area Engineering' where label = 'South Area Engineering Office';

insert into lookups.coordination_partners (label)
values
('Homeless Strategy Office'),
('AUS (Airport)'),
('Project Delivery'),
('Sidewalks and Urban Trails Division'),
('Office of the City Engineer');

delete from lookups.coordination_partners where label = 'Public Works Department';
