alter table crashes
    add column signal_engineer_area_id integer,
    add constraint crashes_signal_engineer_area_id_fkey
        foreign key (signal_engineer_area_id)  
        references geo.signal_engineer_areas (signal_engineer_area_id)
        on update cascade on delete set null,
    add column zipcode text,
    add constraint crashes_zipcode_fkey
        foreign key (zipcode)  
        references geo.zip_codes (zipcode)
        on update cascade on delete set null,
    add column apd_sector_id integer,
    add constraint crashes_apd_sector_id_fkey
        foreign key (apd_sector_id)  
        references geo.apd_sectors (primary_key)
        on update cascade on delete set null,
    add column is_non_coa_roadway boolean not null default true;


COMMENT ON COLUMN public.crashes.signal_engineer_area_id IS 'The traffic signal engineer area which intersects with this crash. Set via trigger function.';
COMMENT ON COLUMN public.crashes.zipcode IS 'The postal ZIP coda which intersects with this crash. Set via trigger function.';
COMMENT ON COLUMN public.crashes.apd_sector_id IS 'The Austin Police Dept response area which intersects with this crash. Set via trigger function.';
COMMENT ON COLUMN public.crashes.is_non_coa_roadway IS 'If the crash has a occured on a roadway that is not maintained by the City of Austin. Defaults to true, and is false if the crash does not intersects with the non_coa_roadways layer and the crash occured in the Austin Full Purpose Jursidiction. Set via trigger function.';
