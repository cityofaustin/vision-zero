--
-- Reworks logic of patient_injry_sev_id, adds a new patient_injry_sev_reason column
-- and sets both columns via trigger instead of column generation
--

--
-- Create lookup table for injury severity
--
CREATE TABLE lookups.ems_patient_injry_sev (
    id integer primary key,
    label text NOT NULL,
    source text DEFAULT 'cris'::text NOT NULL,
    CONSTRAINT injry_sev_owner_check CHECK ((((id < 99) AND (source = 'cris'::text)) OR ((id >= 99) AND (source = 'vz'::text))))
);

comment on table lookups.ems_patient_injry_sev is 'Injury severity lookup values for EMS patient care records. The rows in this table should exactly mirror the lookups.injry_sev table';

INSERT INTO lookups.ems_patient_injry_sev select * from lookups.injry_sev;

--
-- Re-create patient_injry_sev_id column and add patient_injry_sev_reason
--
alter table ems__incidents drop column patient_injry_sev_id;

alter table ems__incidents
add column patient_injry_sev_id integer,
add column patient_injry_sev_reason text;

alter table ems__incidents
add constraint ems__incidents_patient_injry_sev_id_fk foreign key (
    patient_injry_sev_id
)
references lookups.ems_patient_injry_sev on update restrict on delete restrict;

comment on column ems__incidents.patient_injry_sev_id is 'The patient injury severity based on the CRIS injury classifications';

comment on column ems__incidents.patient_injry_sev_reason is 'The business logic used to assign the patient_injry_sev_id';

create index ems__incidents_patient_injry_sev_id_index on ems__incidents (
    patient_injry_sev_id
);

--
-- Create funciton to assign injury severity ID and reason
--
create or replace function update_ems_patient_injry_sev()
returns trigger as $$
BEGIN
    case
    --
    -- fatal injuries
    --
    when (lower(NEW.pcr_provider_impression_primary) = 'death on scene') then
        NEW.patient_injry_sev_id = 4;
        NEW.patient_injry_sev_reason = 'lower(pcr_provider_impression_primary) = ''death on scene''';
    when (lower(NEW.pcr_provider_impression_secondary) = 'death on scene') then
        NEW.patient_injry_sev_id = 4;
        NEW.patient_injry_sev_reason = 'lower(pcr_provider_impression_secondary) = ''death on scene''';
    when (lower(NEW.pcr_outcome) = 'deceased on scene') then
        NEW.patient_injry_sev_id = 4;
        NEW.patient_injry_sev_reason = 'lower(pcr_outcome) = ''deceased on scene''';
    when (lower(NEW.pcr_patient_acuity_final) = 'dead without resuscitation efforts (black)') then
        NEW.patient_injry_sev_id = 4;
        NEW.patient_injry_sev_reason = 'lower(pcr_patient_acuity_final) = ''dead without resuscitation efforts (black)''';
    when ((lower(NEW.pcr_patient_acuity_initial) = 'dead without resuscitation efforts (black)') and (NEW.pcr_patient_acuity_final is NULL)) then
        NEW.patient_injry_sev_id = 4;
        NEW.patient_injry_sev_reason = 'lower(pcr_patient_acuity_initial) = ''dead without resuscitation efforts (black)'') and (pcr_patient_acuity_final is NULL)';
    when (lower(NEW.mvc_form_collision_indicators) LIKE 'death%') then
        NEW.patient_injry_sev_id = 4;
        NEW.patient_injry_sev_reason = 'lower(mvc_form_collision_indicators) LIKE ''death%''';
    --
    -- serious injuries
    --
    when (lower(NEW.pcr_patient_acuity_final) = 'critical (red)') then
        NEW.patient_injry_sev_id = 1;
        NEW.patient_injry_sev_reason = 'lower(pcr_patient_acuity_final) = ''critical (red)''';
    when (lower(NEW.pcr_patient_acuity_initial) = 'critical (red)' and NEW.pcr_patient_acuity_final is NULL) then
        NEW.patient_injry_sev_id = 1;
        NEW.patient_injry_sev_reason = 'lower(pcr_patient_acuity_initial) = ''critical (red)'' and pcr_patient_acuity_final is NULL';
    when (lower(NEW.pcr_patient_acuity_final) = 'emergent (yellow)' and lower(NEW.pcr_outcome) in ('transported', 'care transferred')) then
        NEW.patient_injry_sev_id = 1;
        NEW.patient_injry_sev_reason = 'lower(pcr_patient_acuity_final) = ''emergent (yellow)'' and lower(pcr_outcome) in (''transported'', ''care transferred'')';
    when (lower(NEW.pcr_patient_acuity_initial) = 'emergent (yellow)' and lower(NEW.pcr_patient_acuity_final) is NULL and lower(NEW.pcr_outcome) in ('transported', 'care transferred')) then
        NEW.patient_injry_sev_id = 1;
        NEW.patient_injry_sev_reason = 'lower(pcr_patient_acuity_initial) = ''emergent (yellow)'' and lower(pcr_patient_acuity_final) is NULL and lower(pcr_outcome) in (''transported'', ''care transferred'')';
    when (right(NEW.pcr_transport_priority, 1) = '3') then
        NEW.patient_injry_sev_id = 1;
        NEW.patient_injry_sev_reason = 'right(pcr_transport_priority, 1) = ''3''';
    when (lower(NEW.pcr_transport_priority) like 'charlie%') then
        NEW.patient_injry_sev_id = 1;
        NEW.patient_injry_sev_reason = 'lower(pcr_transport_priority) like ''charlie%''';
    when (lower(NEW.pcr_transport_priority) like 'delta%') then
        NEW.patient_injry_sev_id = 1;
        NEW.patient_injry_sev_reason = 'lower(pcr_transport_priority) like ''delta%''';
    when (lower(NEW.pcr_transport_priority) like 'echo%') then
        NEW.patient_injry_sev_id = 1;
        NEW.patient_injry_sev_reason = 'lower(pcr_transport_priority) like ''echo%''';
    when (lower(NEW.pcr_provider_impression_primary) like 'fracture%') then
        NEW.patient_injry_sev_id = 1;
        NEW.patient_injry_sev_reason = 'lower(pcr_provider_impression_primary) like ''fracture%''';
    when (lower(NEW.pcr_provider_impression_secondary) like 'fracture%') then
        NEW.patient_injry_sev_id = 1;
        NEW.patient_injry_sev_reason = 'lower(pcr_provider_impression_secondary) like ''fracture%''';
    when (lower(NEW.pcr_patient_acuity_level_reason) = 'evidence of major trauma/hemorrhage') then
        NEW.patient_injry_sev_id = 1;
        NEW.patient_injry_sev_reason = 'lower(pcr_patient_acuity_level_reason) = ''evidence of major trauma/hemorrhage''';
    when (lower(NEW.pcr_provider_impression_primary) in ('burn', 'cardiac - cardiac arrest', 'cardiac - cardiac arrest - traumatic', 'syncope', 'unconsciousness')) then
        NEW.patient_injry_sev_id = 1;
        NEW.patient_injry_sev_reason = 'lower(pcr_provider_impression_primary) in (''burn'', ''cardiac - cardiac arrest'', ''cardiac - cardiac arrest - traumatic'', ''syncope'', ''unconsciousness'')';
    when (lower(NEW.pcr_provider_impression_secondary) in ('burn', 'cardiac - cardiac arrest', 'cardiac - cardiac arrest - traumatic', 'syncope', 'unconsciousness')) then
        NEW.patient_injry_sev_id = 1;
        NEW.patient_injry_sev_reason = 'lower(pcr_provider_impression_secondary) in (''burn'', ''cardiac - cardiac arrest'', ''cardiac - cardiac arrest - traumatic'', ''syncope'', ''unconsciousness'')';
    --
    -- minor injuries
    --
    when (NEW.mvc_form_patient_injured_flag = 1) then
        NEW.patient_injry_sev_id = 2;
        NEW.patient_injry_sev_reason = 'mvc_form_patient_injured_flag = 1';
    when (lower(NEW.pcr_provider_impression_primary) like 'injury%') then
        NEW.patient_injry_sev_id = 2;
        NEW.patient_injry_sev_reason = 'lower(pcr_provider_impression_primary) like ''injury%''';
    when (lower(NEW.pcr_provider_impression_secondary) like 'injury%') then
        NEW.patient_injry_sev_id = 2;
        NEW.patient_injry_sev_reason = 'lower(pcr_provider_impression_secondary) like ''injury%''';
    when (lower(NEW.pcr_outcome) in ('transported', 'care transferred')) then
        NEW.patient_injry_sev_id = 2;
        NEW.patient_injry_sev_reason = 'lower(pcr_outcome) in (''transported'', ''care transferred'')';
    --
    -- possible injuries
    --
    when (NEW.pcr_provider_impression_primary is not NULL and lower(NEW.pcr_provider_impression_primary) not in ('exam - adult - no finding', 'exam - child - no finding', 'exam - general', 'no complaints')) then
        NEW.patient_injry_sev_id = 3;
        NEW.patient_injry_sev_reason = 'pcr_provider_impression_primary is not NULL and lower(pcr_provider_impression_primary) not in (''exam - adult - no finding'', ''exam - child - no finding'', ''exam - general'', ''no complaints'')';
    when (NEW.pcr_provider_impression_secondary is not NULL and lower(NEW.pcr_provider_impression_secondary) not in ('exam - adult - no finding', 'exam - child - no finding', 'exam - general', 'no complaints')) then
        NEW.patient_injry_sev_id = 3;
        NEW.patient_injry_sev_reason = 'pcr_provider_impression_secondary is not NULL and lower(pcr_provider_impression_secondary) not in (''exam - adult - no finding'', ''exam - child - no finding'', ''exam - general'', ''no complaints'')';
    --
    -- not injured
    --
    else 
        NEW.patient_injry_sev_id = 5;
        NEW.patient_injry_sev_reason = NULL;
    end case;
    RETURN NEW;
END;
$$ language plpgsql;

--
-- Trigger is only deployed on inserts, because we do not allow updates to the dependent columns
--
create or replace trigger ems_incidents_trigger_insert_set_patient_injry_sev
before insert on ems__incidents
for each row execute function update_ems_patient_injry_sev();

--
-- Backfill our new columns by temporarily creating an update trigger to call the new function
--
create or replace trigger ems_incidents_trigger_update_set_patient_injry_sev
before update on ems__incidents
for each row execute function update_ems_patient_injry_sev();

update ems__incidents set id = id, updated_by = 'dts_automation';

--
--  And now replace the update trigger so that fires on changes to our dependent fields only
--
create or replace trigger ems_incidents_trigger_update_set_patient_injry_sev
before update on ems__incidents
for each row 
when (
    OLD.pcr_provider_impression_primary is distinct from NEW.pcr_provider_impression_primary
    or
    OLD.pcr_provider_impression_secondary is distinct from NEW.pcr_provider_impression_secondary
    or
    OLD.pcr_outcome is distinct from NEW.pcr_outcome
    or
    OLD.pcr_patient_acuity_final is distinct from NEW.pcr_patient_acuity_final
    or
    OLD.pcr_patient_acuity_initial is distinct from NEW.pcr_patient_acuity_initial
    or
    OLD.mvc_form_collision_indicators is distinct from NEW.mvc_form_collision_indicators
    or
    OLD.pcr_transport_priority is distinct from NEW.pcr_transport_priority
    or
    OLD.mvc_form_patient_injured_flag is distinct from NEW.mvc_form_patient_injured_flag
)
execute function update_ems_patient_injry_sev();
