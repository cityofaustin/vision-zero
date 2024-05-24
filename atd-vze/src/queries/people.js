import { gql } from "apollo-boost";

export const GET_PEOPLE = gql`
  query FindPeople($crashId: Int!) {
    people_list_view(where: { crash_id: { _eq: $crashId } }) {
      crash_id
      id
      unit_nbr
      is_primary_person
      prsn_age
      drvr_city_name
      drvr_zip
      prsn_exp_homelessness
      prsn_first_name
      prsn_mid_name
      prsn_last_name
      injry_sev_lkp {
        id
        label
      }
      prsn_type_lkp {
        id
        label
      }
      gndr_lkp {
        id
        label
      }
      drvr_ethncty_lkp {
        id
        label
      }
    }
  }
`;

export const UPDATE_PERSON = gql`
  mutation UpdatePerson($personId: Int!, $changes: people_edits_set_input) {
    update_people_edits_by_pk(pk_columns: { id: $personId }, _set: $changes) {
      id
    }
  }
`;
