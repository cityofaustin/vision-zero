alter table ems__incidents drop column patient_injry_sev_id;

alter table ems__incidents
add column patient_injry_sev_id integer generated always as (
    case
        --
        -- fatal injuries
        --
        when
            (lower(pcr_provider_impression_primary) = 'death on scene')
            or
            (lower(pcr_provider_impression_secondary) = 'death on scene')
            or
            (lower(pcr_outcome) = 'deceased on scene')
            or
            (
                lower(pcr_patient_acuity_final)
                = 'dead without resuscitation efforts (black)'
            )
            or (
                (
                    lower(pcr_patient_acuity_initial)
                    = 'dead without resuscitation efforts (black)'
                )
                and (
                    pcr_patient_acuity_final is NULL
                )
            )
            then 4
        --
        -- serious injuries
        --
        when
            (lower(pcr_patient_acuity_final) = 'critical (red)')
            or
            (
                lower(pcr_patient_acuity_initial) = 'critical (red)'
                and pcr_patient_acuity_final is NULL
            )
            or
            (
                lower(pcr_patient_acuity_final) = 'emergent (yellow)'
                and lower(pcr_outcome) in ('transported', 'care transferred')
            )
            or
            (
                lower(pcr_patient_acuity_initial) = 'emergent (yellow)'
                and lower(pcr_patient_acuity_final) is NULL
                and lower(pcr_outcome) in ('transported', 'care transferred')
            )
            or
            (right(pcr_transport_priority, 1) = '3')
            or
            (lower(pcr_transport_priority) like 'charlie%')
            or
            (lower(pcr_transport_priority) like 'delta%')
            or
            (lower(pcr_transport_priority) like 'echo%')
            or
            lower(pcr_provider_impression_primary) like 'fracture%'
            or
            lower(pcr_provider_impression_secondary) like 'fracture%'
            or
            (
                lower(pcr_patient_acuity_level_reason)
                = 'evidence of major trauma/hemorrhage'
            )
            or
            (
                lower(pcr_provider_impression_primary) in
                (
                    'burn',
                    'cardiac - cardiac arrest',
                    'cardiac - cardiac arrest - traumatic',
                    'syncope',
                    'unconsciousness'
                )
            )
            or
            (
                lower(pcr_provider_impression_secondary) in
                (
                    'burn',
                    'cardiac - cardiac arrest',
                    'cardiac - cardiac arrest - traumatic',
                    'syncope',
                    'unconsciousness'
                )
            )
            then 1
        --
        -- minor injuries
        --
        when
            (lower(pcr_outcome) in ('transported', 'care transferred'))
            or
            (mvc_form_patient_injured_flag = 1)
            or
            (lower(pcr_provider_impression_primary) like 'injury%')
            or
            (lower(pcr_provider_impression_secondary) like 'injury%')
            or
            (
                lower(pcr_provider_impression_primary) in
                (
                    'Altered Mental Status',
                    'Assault - Physical',
                    'Burn - Chemical',
                    'Cardiac - Arrhythmia/Dysrythmia',
                    'Cardiac - Myocardial Infarction',
                    'Cardiac - Palpitations',
                    'Confusion',
                    'Diarrhea',
                    'Dizziness',
                    'Epistaxis',
                    'Fatigue',
                    'Fever',
                    'Foreign Body - Alimentary Tract',
                    'Foreign Body - Respiratory Tract',
                    'Generalized Weakness',
                    'Headache',
                    'Hemorrhage',
                    'Hemorrhage - Vaginal',
                    'Hypertension',
                    'Hypertensive Crisis',
                    'Hypotension',
                    'Malaise',
                    'Nausea',
                    'Neurological - Visual Disturbance',
                    'OB',
                    'OB - Pre Eclampsia',
                    'OB - Vomiting',
                    'Obstruction - Esophageal',
                    'Pain - Abdomen',
                    'Pain - Acute',
                    'Pain - Acute - Trauma',
                    'Pain - Back',
                    'Pain - Chest',
                    'Pain - Chest - Non Cardiac',
                    'Pain - Chest - With Breathing',
                    'Pain - Chronic',
                    'Pain - Extremity',
                    'Pain - Eye',
                    'Pain - Non Traumatic',
                    'Pain - Pelvis/Perineum',
                    'Pain - Tooth',
                    'Problem - Ear',
                    'Respiratory - Distress',
                    'Respiratory - Dyspnea',
                    'Respiratory - Hyperventilation',
                    'Seizure',
                    'Seizure - Postictal',
                    'Seizure - Status Epilepticus',
                    'Trauma - Minor',
                    'Vomiting'
                )
            )
            or
            (
                lower(pcr_provider_impression_secondary) in
                (
                    'Altered Mental Status',
                    'Assault - Physical',
                    'Burn - Chemical',
                    'Cardiac - Arrhythmia/Dysrythmia',
                    'Cardiac - Myocardial Infarction',
                    'Cardiac - Palpitations',
                    'Confusion',
                    'Diarrhea',
                    'Dizziness',
                    'Epistaxis',
                    'Fatigue',
                    'Fever',
                    'Foreign Body - Alimentary Tract',
                    'Foreign Body - Respiratory Tract',
                    'Generalized Weakness',
                    'Headache',
                    'Hemorrhage',
                    'Hemorrhage - Vaginal',
                    'Hypertension',
                    'Hypertensive Crisis',
                    'Hypotension',
                    'Malaise',
                    'Nausea',
                    'Neurological - Visual Disturbance',
                    'OB',
                    'OB - Pre Eclampsia',
                    'OB - Vomiting',
                    'Obstruction - Esophageal',
                    'Pain - Abdomen',
                    'Pain - Acute',
                    'Pain - Acute - Trauma',
                    'Pain - Back',
                    'Pain - Chest',
                    'Pain - Chest - Non Cardiac',
                    'Pain - Chest - With Breathing',
                    'Pain - Chronic',
                    'Pain - Extremity',
                    'Pain - Eye',
                    'Pain - Non Traumatic',
                    'Pain - Pelvis/Perineum',
                    'Pain - Tooth',
                    'Problem - Ear',
                    'Respiratory - Distress',
                    'Respiratory - Dyspnea',
                    'Respiratory - Hyperventilation',
                    'Seizure',
                    'Seizure - Postictal',
                    'Seizure - Status Epilepticus',
                    'Trauma - Minor',
                    'Vomiting'
                )
            )
            then 2
        --
        -- possible injuries
        --
        when
            (
                pcr_provider_impression_primary is not NULL
                and lower(pcr_provider_impression_primary) not in
                (
                    'Exam - Adult - No Finding',
                    'Exam - Child - No Finding',
                    'Exam - General',
                    'No Complaints'
                )
            )
            or
            (
                pcr_provider_impression_secondary is not NULL
                and lower(pcr_provider_impression_secondary) not in
                (
                    'Exam - Adult - No Finding',
                    'Exam - Child - No Finding',
                    'Exam - General',
                    'No Complaints'
                )
            )
            then 3
        else 5
    end
) stored;




alter table ems__incidents
add constraint ems__incidents_patient_injry_sev_id_fk foreign key (
    patient_injry_sev_id
)
references lookups.injry_sev on update restrict on delete restrict;

comment on column ems__incidents.patient_injry_sev_id is 'The patient injury severity as mapped to the CRIS injury severity lookup';

create index ems__incidents_patient_injry_sev_id_index on ems__incidents (
    patient_injry_sev_id
);
