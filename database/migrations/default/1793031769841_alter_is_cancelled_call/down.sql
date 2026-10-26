ALTER TABLE cad_incidents DROP COLUMN is_canceled_call;

ALTER TABLE cad_incidents
ADD COLUMN is_canceled_call BOOLEAN
GENERATED ALWAYS AS (
    COALESCE(
        (lower(call_disposition) ~~ '%cancelled%'::text)
        OR (lower(call_disposition) ~~ '%canceled%'::text)
        OR (lower(call_disposition) ~~ '%false alarm%'::text)
        OR (lower(call_disposition) ~~ '%duplicate%'::text)
        OR (lower(call_disposition) ~~ '%reassigned call%'::text)
        OR (lower(call_disposition) ~~ '%test call%'::text)
        OR (lower(call_disposition) ~~ '%training%'::text)
    , FALSE)
) STORED;