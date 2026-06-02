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
    when (NEW.flag_patient_deceased = 1) then
        NEW.patient_injry_sev_id = 4;
        NEW.patient_injry_sev_reason = 'The patient was flagged as deceased ';
    --
    -- serious injuries
    --
    when (new.trauma_form_criteria_injury_patterns is not null) then
        NEW.patient_injry_sev_id = 1;
        NEW.patient_injry_sev_reason = 'The trauma activation form listed injury patterns consistent with serious injuries';
    when (lower(NEW.pcr_patient_acuity_final) = 'critical (red)') then
        NEW.patient_injry_sev_id = 1;
        NEW.patient_injry_sev_reason = 'The patient acuity level was critical (red)';
    when (lower(NEW.pcr_patient_acuity_initial) = 'critical (red)' and NEW.pcr_patient_acuity_final is NULL) then
        NEW.patient_injry_sev_id = 1;
        NEW.patient_injry_sev_reason = 'The patient acuity level was critical (red)';
    when (lower(NEW.pcr_provider_impression_primary) like 'fracture%') then
        NEW.patient_injry_sev_id = 1;
        NEW.patient_injry_sev_reason = 'The provider listed the impression: "' || NEW.pcr_provider_impression_primary || '"';
    when (lower(NEW.pcr_provider_impression_secondary) like 'fracture%') then
        NEW.patient_injry_sev_id = 1;
        NEW.patient_injry_sev_reason = 'The provider listed the impression: "' || NEW.pcr_provider_impression_secondary || '"';
    when (lower(NEW.pcr_patient_acuity_level_reason) = 'evidence of major trauma/hemorrhage') then
        NEW.patient_injry_sev_id = 1;
        NEW.patient_injry_sev_reason = 'The acuity level reason is "evidence of major trauma/hemorrhage"';
    when (lower(NEW.pcr_provider_impression_primary) in ('burn', 'cardiac - cardiac arrest', 'cardiac - cardiac arrest - traumatic', 'unconsciousness')) then
        NEW.patient_injry_sev_id = 1;
        NEW.patient_injry_sev_reason = 'The provider listed the impression: "' || NEW.pcr_provider_impression_primary || '"';
    when (lower(NEW.pcr_provider_impression_secondary) in ('burn', 'cardiac - cardiac arrest', 'cardiac - cardiac arrest - traumatic', 'unconsciousness')) then
        NEW.patient_injry_sev_id = 1;
        NEW.patient_injry_sev_reason = 'The provider listed the impression: "' || NEW.pcr_provider_impression_secondary || '"';
    when (NEW.flag_patient_gcs_lte_13 = 1 and NEW.trauma_form_trauma_level IN ('Red', 'Level 1', 'Yellow', 'Level 2')) then
        NEW.patient_injry_sev_id = 1;
        NEW.patient_injry_sev_reason = 'The patient''s GCS was less than or equal to 13 at any time during the patient encounter and the trauma level was listed as "' || NEW.trauma_form_trauma_level || '"';
    when (NEW.pcr_transport_priority = 'Code 3' and NEW.trauma_form_trauma_level IN ('Red', 'Level 1', 'Yellow', 'Level 2')) then
        NEW.patient_injry_sev_id = 1;
        NEW.patient_injry_sev_reason = 'The transport priority was listed as "Code 3" and the trauma level was listed as "' || NEW.trauma_form_trauma_level || '"';
    when (
        NEW.pcr_transport_priority = 'Code 3'
        and NEW.trauma_form_criteria_injury_mechanisms IS NOT NULL
    ) then
        NEW.patient_injry_sev_id = 1;
        NEW.patient_injry_sev_reason = 'The transport priority was listed as "Code 3" and the trauma injury mechanisms included "' || NEW.trauma_form_criteria_injury_mechanisms || '"';
    when (lower(NEW.pcr_transport_priority) like 'delta%') then
        NEW.patient_injry_sev_id = 1;
        NEW.patient_injry_sev_reason = 'The transport priority was listed as "' || NEW.pcr_transport_priority || '"';
    when (lower(NEW.pcr_transport_priority) like 'echo%') then
        NEW.patient_injry_sev_id = 1;
        NEW.patient_injry_sev_reason = 'The transport priority was listed as "' || NEW.pcr_transport_priority || '"';
    --
    -- minor injuries
    --
    when (NEW.mvc_form_patient_injured_flag = 1 or NEW.pcr_patient_injured = 'Yes') then
        NEW.patient_injry_sev_id = 2;
        NEW.patient_injry_sev_reason = 'The patient was flagged as injured';
    when (lower(NEW.pcr_provider_impression_primary) like 'injury%') then
        NEW.patient_injry_sev_id = 2;
        NEW.patient_injry_sev_reason = 'The provider listed the impression: "' || NEW.pcr_provider_impression_primary || '"';
    when (lower(NEW.pcr_provider_impression_secondary) like 'injury%') then
        NEW.patient_injry_sev_id = 2;
        NEW.patient_injry_sev_reason = 'The provider listed the impression: "' || NEW.pcr_provider_impression_secondary || '"';
    when (lower(NEW.pcr_outcome) in ('transported', 'care transferred')) then
        NEW.patient_injry_sev_id = 2;
        NEW.patient_injry_sev_reason = 'The patient was transported to a hospital or their care was transferred to another entity';
    when (lower(NEW.pcr_patient_acuity_final) = 'emergent (yellow)' and lower(NEW.pcr_outcome) in ('transported', 'care transferred')) then
        NEW.patient_injry_sev_id = 2;
        NEW.patient_injry_sev_reason = 'The patient acuity level was yellow and the patient was transported or had care transferred to another entity';
    when (lower(NEW.pcr_patient_acuity_initial) = 'emergent (yellow)' and lower(NEW.pcr_patient_acuity_final) is NULL and lower(NEW.pcr_outcome) in ('transported', 'care transferred')) then
        NEW.patient_injry_sev_id = 2;
        NEW.patient_injry_sev_reason = 'The patient acuity level was yellow and the patient was transported or had care transferred to another entity';
    --
    -- possible injuries
    --
    when (NEW.pcr_provider_impression_primary is not NULL and lower(NEW.pcr_provider_impression_primary) not in ('exam - adult - no finding', 'exam - child - no finding', 'exam - general', 'no complaints')) then
        NEW.patient_injry_sev_id = 3;
        NEW.patient_injry_sev_reason = 'The provider listed the impression: "' || NEW.pcr_provider_impression_primary || '"';
    when (NEW.pcr_provider_impression_secondary is not NULL and lower(NEW.pcr_provider_impression_secondary) not in ('exam - adult - no finding', 'exam - child - no finding', 'exam - general', 'no complaints')) then
        NEW.patient_injry_sev_id = 3;
        NEW.patient_injry_sev_reason = 'The provider listed the impression: "' || NEW.pcr_provider_impression_secondary || '"';
    --
    -- not injured
    --
    else 
        NEW.patient_injry_sev_id = 5;
        NEW.patient_injry_sev_reason = NULL;
    end case;
    RETURN NEW;
END;
$function$;
