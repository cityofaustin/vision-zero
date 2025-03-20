-- delete records where partner_id is null
delete from public.recommendations_partners
where partner_id is null;

-- alter table to enforce not null constraints
alter table public.recommendations_partners
alter column recommendation_id set not null,
alter column partner_id set not null;
