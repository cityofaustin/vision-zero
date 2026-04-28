SELECT
    c.id,
    GREATEST(c.updated_at, MAX(u.updated_at), MAX(p.updated_at)) AS last_modified
FROM
    crashes c
    LEFT JOIN units u ON u.crash_pk = c.id
    LEFT JOIN people p ON p.unit_id = u.id
GROUP BY
    c.id,
    c.updated_at;

select * from crash_injury_metrics_view;
select * from crashes_list_view;
select * from fatalities_view;
select * from locations_list_view;
select * from people_list_view;
select * from person_injury_metrics_view;
select * from socrata_export_crashes_view;
select * from socrata_export_people_view;
select * from unit_injury_metrics_view;
select * from unit_types_involved_view;
