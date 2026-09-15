ALTER TABLE cad_incidents
ADD COLUMN upstream_record_update_timestamp timestamptz;

COMMENT ON COLUMN public.cad_incidents.upstream_record_update_timestamp is 
    'The timestamp at which this record was last updated in the upstream data warehouse'
    ' from which CAD incidents are sourced. This field is known as the `Record_Insert_Timestamp`'
    ' in the ATS public safety data warehouse and is used to distinguish between the presence'
    ' of multiple versions of the same record in daily extract files.'
    ' See https://github.com/cityofaustin/atd-data-tech/issues/29125.';
