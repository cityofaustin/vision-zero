-- For upserts, hasura prefers constraints as opposed to indexes:

-- Units
DROP INDEX public.atd_txdot_units_unique_index;
ALTER TABLE public.atd_txdot_units
    ADD CONSTRAINT atd_txdot_units_unique UNIQUE (crash_id,unit_nbr);

-- Primary Person
DROP INDEX public.atd_txdot_primaryperson_unique_index;
ALTER TABLE public.atd_txdot_primaryperson
    ADD CONSTRAINT atd_txdot_primaryperson_unique UNIQUE (
        crash_id,unit_nbr,prsn_nbr,prsn_type_id,prsn_occpnt_pos_id
    );

-- Person
DROP INDEX public.atd_txdot_person_unique_index;
ALTER TABLE public.atd_txdot_person
    ADD CONSTRAINT atd_txdot_person_unique UNIQUE (
        crash_id,unit_nbr,prsn_nbr,prsn_type_id,prsn_occpnt_pos_id
    );

--