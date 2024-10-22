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
