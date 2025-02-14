-- delet ems_incidents with the same pcr_key, keeping the first of any dupes
with numbered_rows as (
    select
        id,
        pcr_key,
        row_number() over (partition by pcr_key order by id) as row_num
    from ems__incidents
)
delete from ems__incidents
where id in (
    select id
    from numbered_rows
    where row_num > 1
);

-- add unique constraint
alter table ems__incidents add constraint unique_pcr_key unique (pcr_key);
