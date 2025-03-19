-- remove not null constraints
alter table public.recommendations_partners
alter column recommendation_id drop not null,
alter column partner_id drop not null;