drop trigger if exists ems_incidents_trigger_insert_set_patient_injry_sev on ems__incidents;
drop trigger if exists ems_incidents_trigger_update_set_patient_injry_sev on ems__incidents;

drop function if exists update_ems_patient_injry_sev;

alter table ems__incidents drop column patient_injry_sev_id, drop column patient_injry_sev_reason;

drop table lookups.ems_patient_injry_sev cascade;

alter table ems__incidents
add column patient_injry_sev_id integer generated always as (
    case
        when
            lower(pcr_provider_impression_primary) = 'death on scene'
            or lower(pcr_outcome) = 'deceased on scene'
            or lower(pcr_patient_acuity_final)
            = 'dead without resuscitation efforts (black)'
            then 4
        when
            right(pcr_transport_priority, 1) = '3'
            and lower(pcr_patient_acuity_final) = 'lower acuity (green)'
            then 2
        when
            right(pcr_transport_priority, 1) = '3'
            and lower(pcr_patient_acuity_final) = 'critical (red)'
            then 1
        when
            right(pcr_transport_priority, 1) = '3'
            and lower(pcr_patient_acuity_final) = 'emergent (yellow)'
            then 1
        when
            right(pcr_transport_priority, 1) = '3'
            and lower(pcr_patient_acuity_initial) = 'critical (red)'
            then 1
        when
            right(pcr_transport_priority, 1) = '3'
            and lower(pcr_patient_acuity_initial) = 'emergent (yellow)'
            then 1
        when
            right(pcr_transport_priority, 1) = '3'
            and lower(pcr_patient_acuity_level) = 'high acuity'
            then 1
        -- what is this pcr_transport_priority?
        when
            lower(left(pcr_transport_priority, 1)) = 'charlie'
            or lower(left(pcr_transport_priority, 1)) = 'd'
            then 1
        when
            right(pcr_transport_priority, 1) = '3'
            and lower(pcr_patient_acuity_initial) = 'lower acuity (green)'
            then 2
        when
            lower(left(pcr_transport_priority, 1)) = 'minor injury'
            or lower(left(pcr_transport_priority, 1)) = 'possible injury'
            then 2
        when
            right(pcr_transport_priority, 1) != '3'
            and lower(pcr_patient_acuity_initial) = 'lower acuity (green)'
            then 3
        when
            lower(right(pcr_outcome, 7)) = 'refused'
            and left(lower(pcr_patient_acuity_level), 10) = 'low acuity'
            then 3
        else 5
    end
) stored;

alter table ems__incidents
add constraint ems__incidents_patient_injry_sev_id_fk foreign key (
    patient_injry_sev_id
)
references lookups.injry_sev on update restrict on delete restrict;

comment on column ems__incidents.patient_injry_sev_id is 'The patient injury severity as mapped to the CRIS injury severity lookup. Based on methodology provided by Xavier A.';

create index ems__incidents_patient_injry_sev_id_index on ems__incidents (
    patient_injry_sev_id
);
