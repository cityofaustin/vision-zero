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
