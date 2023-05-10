ALTER TABLE recommendations
RENAME COLUMN text TO rec_text;

ALTER TABLE recommendations
RENAME COLUMN update TO rec_update;

ALTER TABLE atd__recommendation_status_lkp
RENAME COLUMN description TO rec_status_desc;

ALTER TABLE atd__coordination_partners_lkp
RENAME COLUMN description TO coord_partner_desc;
