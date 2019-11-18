import { gql } from "apollo-boost";

export const GET_CRASHES_YTD = gql`
query PersonPrimaryPersonWithCrashDate {
    atd_txdot_person(where: {_or: [{prsn_injry_sev_id: {_eq: 1}}, {prsn_injry_sev_id: {_eq: 4}}], _and: {crash: {city_id: {_eq: 22}}}}) {
      prsn_injry_sev_id
      prsn_age
      prsn_gndr_id
      crash {
        crash_date
      }
    }
    atd_txdot_primaryperson(where: {_or: [{prsn_injry_sev_id: {_eq: 1}}, {prsn_injry_sev_id: {_eq: 4}}], _and: {crash: {city_id: {_eq: 22}}}}) {
      prsn_injry_sev_id
      prsn_age
      prsn_gndr_id
      drvr_zip
      crash {
        crash_date
      }
    }
  }
`;
