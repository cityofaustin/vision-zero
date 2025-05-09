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
                    'altered mental status',
                    'assault - physical',
                    'burn - chemical',
                    'cardiac - arrhythmia/dysrythmia',
                    'cardiac - myocardial infarction',
                    'cardiac - palpitations',
                    'confusion',
                    'diarrhea',
                    'dizziness',
                    'epistaxis',
                    'fatigue',
                    'fever',
                    'foreign body - alimentary tract',
                    'foreign body - respiratory tract',
                    'generalized weakness',
                    'headache',
                    'hemorrhage',
                    'hemorrhage - vaginal',
                    'hypertension',
                    'hypertensive crisis',
                    'hypotension',
                    'malaise',
                    'nausea',
                    'neurological - visual disturbance',
                    'ob',
                    'ob - pre eclampsia',
                    'ob - vomiting',
                    'obstruction - esophageal',
                    'pain - abdomen',
                    'pain - acute',
                    'pain - acute - trauma',
                    'pain - back',
                    'pain - chest',
                    'pain - chest - non cardiac',
                    'pain - chest - with breathing',
                    'pain - chronic',
                    'pain - extremity',
                    'pain - eye',
                    'pain - non traumatic',
                    'pain - pelvis/perineum',
                    'pain - tooth',
                    'problem - ear',
                    'respiratory - distress',
                    'respiratory - dyspnea',
                    'respiratory - hyperventilation',
                    'seizure',
                    'seizure - postictal',
                    'seizure - status epilepticus',
                    'trauma - minor',
                    'vomiting'
                )
            )
            or
            (
                lower(pcr_provider_impression_secondary) in
                (
                    'altered mental status',
                    'assault - physical',
                    'burn - chemical',
                    'cardiac - arrhythmia/dysrythmia',
                    'cardiac - myocardial infarction',
                    'cardiac - palpitations',
                    'confusion',
                    'diarrhea',
                    'dizziness',
                    'epistaxis',
                    'fatigue',
                    'fever',
                    'foreign body - alimentary tract',
                    'foreign body - respiratory tract',
                    'generalized weakness',
                    'headache',
                    'hemorrhage',
                    'hemorrhage - vaginal',
                    'hypertension',
                    'hypertensive crisis',
                    'hypotension',
                    'malaise',
                    'nausea',
                    'neurological - visual disturbance',
                    'ob',
                    'ob - pre eclampsia',
                    'ob - vomiting',
                    'obstruction - esophageal',
                    'pain - abdomen',
                    'pain - acute',
                    'pain - acute - trauma',
                    'pain - back',
                    'pain - chest',
                    'pain - chest - non cardiac',
                    'pain - chest - with breathing',
                    'pain - chronic',
                    'pain - extremity',
                    'pain - eye',
                    'pain - non traumatic',
                    'pain - pelvis/perineum',
                    'pain - tooth',
                    'problem - ear',
                    'respiratory - distress',
                    'respiratory - dyspnea',
                    'respiratory - hyperventilation',
                    'seizure',
                    'seizure - postictal',
                    'seizure - status epilepticus',
                    'trauma - minor',
                    'vomiting'
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
                    'exam - adult - no finding',
                    'exam - child - no finding',
                    'exam - general',
                    'no complaints'
                )
            )
            or
            (
                pcr_provider_impression_secondary is not NULL
                and lower(pcr_provider_impression_secondary) not in
                (
                    'exam - adult - no finding',
                    'exam - child - no finding',
                    'exam - general',
                    'no complaints'
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
