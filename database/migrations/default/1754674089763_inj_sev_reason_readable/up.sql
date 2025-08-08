--
-- Adds human-friendly values to patient_injry_sev_reason
--
CREATE OR REPLACE FUNCTION public.update_ems_patient_injry_sev()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    case
    --
    -- fatal injuries
    --
    when (lower(NEW.pcr_provider_impression_primary) = 'death on scene') then
        NEW.patient_injry_sev_id = 4;
        NEW.patient_injry_sev_reason = 'Reported as "death on scene"';
    when (lower(NEW.pcr_provider_impression_secondary) = 'death on scene') then
        NEW.patient_injry_sev_id = 4;
        NEW.patient_injry_sev_reason = 'Reported as "death on scene"';
    when (lower(NEW.pcr_outcome) = 'deceased on scene') then
        NEW.patient_injry_sev_id = 4;
        NEW.patient_injry_sev_reason = 'Reported as "deceased on scene"';
    when (lower(NEW.pcr_patient_acuity_final) = 'dead without resuscitation efforts (black)') then
        NEW.patient_injry_sev_id = 4;
        NEW.patient_injry_sev_reason = 'Reported as "dead without resuscitation efforts"';
    when ((lower(NEW.pcr_patient_acuity_initial) = 'dead without resuscitation efforts (black)') and (NEW.pcr_patient_acuity_final is NULL)) then
        NEW.patient_injry_sev_id = 4;
        NEW.patient_injry_sev_reason = 'Reported as "dead without resuscitation efforts"';
    when (lower(NEW.mvc_form_collision_indicators) LIKE 'death%') then
        NEW.patient_injry_sev_id = 4;
        NEW.patient_injry_sev_reason = 'The collision indictors includes the word "death"';
    --
    -- serious injuries
    --
    when (lower(NEW.pcr_patient_acuity_final) = 'critical (red)') then
        NEW.patient_injry_sev_id = 1;
        NEW.patient_injry_sev_reason = 'The patient acuity level was critical (red)';
    when (lower(NEW.pcr_patient_acuity_initial) = 'critical (red)' and NEW.pcr_patient_acuity_final is NULL) then
        NEW.patient_injry_sev_id = 1;
        NEW.patient_injry_sev_reason = 'The patient acuity level was critical (red)';
    when (lower(NEW.pcr_patient_acuity_final) = 'emergent (yellow)' and lower(NEW.pcr_outcome) in ('transported', 'care transferred')) then
        NEW.patient_injry_sev_id = 1;
        NEW.patient_injry_sev_reason = 'The patient acuity level was yellow and the patient was transported or had care transferred to another entity';
    when (lower(NEW.pcr_patient_acuity_initial) = 'emergent (yellow)' and lower(NEW.pcr_patient_acuity_final) is NULL and lower(NEW.pcr_outcome) in ('transported', 'care transferred')) then
        NEW.patient_injry_sev_id = 1;
        NEW.patient_injry_sev_reason = 'The patient acuity level was yellow and the patient was transported or had care transferred to another entity';
    when (right(NEW.pcr_transport_priority, 1) = '3') then
        NEW.patient_injry_sev_id = 1;
        NEW.patient_injry_sev_reason = 'The transport priority was listed as ''%''', NEW.pcr_transport_priority;
    when (lower(NEW.pcr_transport_priority) like 'charlie%') then
        NEW.patient_injry_sev_id = 1;
        NEW.patient_injry_sev_reason = 'The transport priority was listed as ''%''', NEW.pcr_transport_priority;
    when (lower(NEW.pcr_transport_priority) like 'delta%') then
        NEW.patient_injry_sev_id = 1;
        NEW.patient_injry_sev_reason = 'The transport priority was listed as ''%''', NEW.pcr_transport_priority;
    when (lower(NEW.pcr_transport_priority) like 'echo%') then
        NEW.patient_injry_sev_id = 1;
        NEW.patient_injry_sev_reason = 'The transport priority was listed as ''%''', NEW.pcr_transport_priority;
    when (lower(NEW.pcr_provider_impression_primary) like 'fracture%') then
        NEW.patient_injry_sev_id = 1;
        NEW.patient_injry_sev_reason = 'The provider listed the impression: ''%''', NEW.pcr_provider_impression_primary;
    when (lower(NEW.pcr_provider_impression_secondary) like 'fracture%') then
        NEW.patient_injry_sev_id = 1;
        NEW.patient_injry_sev_reason = 'The provider listed the impression: ''%''', NEW.pcr_provider_impression_secondary;
    when (lower(NEW.pcr_patient_acuity_level_reason) = 'evidence of major trauma/hemorrhage') then
        NEW.patient_injry_sev_id = 1;
        NEW.patient_injry_sev_reason = 'lower(pcr_patient_acuity_level_reason) = ''evidence of major trauma/hemorrhage''';
    when (lower(NEW.pcr_provider_impression_primary) in ('burn', 'cardiac - cardiac arrest', 'cardiac - cardiac arrest - traumatic', 'syncope', 'unconsciousness')) then
        NEW.patient_injry_sev_id = 1;
        NEW.patient_injry_sev_reason = 'The provider listed the impression: ''%''', NEW.pcr_provider_impression_primary;
    when (lower(NEW.pcr_provider_impression_secondary) in ('burn', 'cardiac - cardiac arrest', 'cardiac - cardiac arrest - traumatic', 'syncope', 'unconsciousness')) then
        NEW.patient_injry_sev_id = 1;
        NEW.patient_injry_sev_reason = 'The provider listed the impression: ''%''', NEW.pcr_provider_impression_secondary;
    --
    -- minor injuries
    --
    when (NEW.mvc_form_patient_injured_flag = 1) then
        NEW.patient_injry_sev_id = 2;
        NEW.patient_injry_sev_reason = 'The patient was flagged as injured';
    when (lower(NEW.pcr_provider_impression_primary) like 'injury%') then
        NEW.patient_injry_sev_id = 2;
        NEW.patient_injry_sev_reason = 'The provider listed the impression: ''%''', NEW.pcr_provider_impression_primary;
    when (lower(NEW.pcr_provider_impression_secondary) like 'injury%') then
        NEW.patient_injry_sev_id = 2;
        NEW.patient_injry_sev_reason = 'The provider listed the impression: ''%''', NEW.pcr_provider_impression_secondary;
    when (lower(NEW.pcr_outcome) in ('transported', 'care transferred')) then
        NEW.patient_injry_sev_id = 2;
        NEW.patient_injry_sev_reason = 'The patient was transported to a hospital or their care was transferred to another entity';
    --
    -- possible injuries
    --
    when (NEW.pcr_provider_impression_primary is not NULL and lower(NEW.pcr_provider_impression_primary) not in ('exam - adult - no finding', 'exam - child - no finding', 'exam - general', 'no complaints')) then
        NEW.patient_injry_sev_id = 3;
        NEW.patient_injry_sev_reason = 'The provider listed the impression: ''%''', NEW.pcr_provider_impression_primary;
    when (NEW.pcr_provider_impression_secondary is not NULL and lower(NEW.pcr_provider_impression_secondary) not in ('exam - adult - no finding', 'exam - child - no finding', 'exam - general', 'no complaints')) then
        NEW.patient_injry_sev_id = 3;
        NEW.patient_injry_sev_reason = 'The provider listed the impression: ''%''', NEW.pcr_provider_impression_secondary;
    --
    -- not injured
    --
    else 
        NEW.patient_injry_sev_id = 5;
        NEW.patient_injry_sev_reason = NULL;
    end case;
    RETURN NEW;
END;
$function$
