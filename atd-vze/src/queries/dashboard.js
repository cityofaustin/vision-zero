import { gql } from "apollo-boost";

export const GET_CRASHES_YTD = gql`
  query GetCrashesYTD($yearStart: date, $yearEnd: date) {
    fatalities: atd_txdot_crashes_aggregate(
      where: {
        crash_date: { _lt: $yearEnd, _gte: $yearStart }
        private_dr_fl: { _eq: "N" }
        _and: [
          { crash_date: { _is_null: false } }
          { crash_time: { _is_null: false } }
        ]
        _or: [
          { austin_full_purpose: { _eq: "Y" } }
          { _and: [{ city_id: { _eq: 22 } }, { position: { _is_null: true } }] }
        ]
      }
    ) {
      aggregate {
        sum {
          atd_fatality_count
        }
      }
    }
    seriousInjuriesAndTotal: atd_txdot_crashes_aggregate(
      where: {
        crash_date: { _lt: $yearEnd, _gte: $yearStart }
        private_dr_fl: { _eq: "N" }
        _and: [
          { crash_date: { _is_null: false } }
          { crash_time: { _is_null: false } }
        ]
        _or: [
          { austin_full_purpose: { _eq: "Y" } }
          { _and: [{ city_id: { _eq: 22 } }, { position: { _is_null: true } }] }
        ]
      }
    ) {
      aggregate {
        sum {
          sus_serious_injry_cnt
        }
      }
    }
    primaryPersonFatalities: atd_txdot_primaryperson_aggregate(
      where: {
        crash: { private_dr_fl: { _eq: "N" } }
        _and: {
          prsn_injry_sev_id: { _eq: 4 }
          crash: { crash_date: { _lt: $yearEnd, _gte: $yearStart } }
          _or: [
            { crash: { austin_full_purpose: { _eq: "Y" } } }
            {
              _and: [
                { crash: { city_id: { _eq: 22 } } }
                { crash: { position: { _is_null: true } } }
              ]
            }
          ]
        }
      }
    ) {
      aggregate {
        sum {
          years_of_life_lost
        }
      }
    }
    personFatalities: atd_txdot_person_aggregate(
      where: {
        crash: { private_dr_fl: { _eq: "N" } }
        _and: {
          prsn_injry_sev_id: { _eq: 4 }
          crash: { crash_date: { _lt: $yearEnd, _gte: $yearStart } }
          _or: [
            { crash: { austin_full_purpose: { _eq: "Y" } } }
            {
              _and: [
                { crash: { city_id: { _eq: 22 } } }
                { crash: { position: { _is_null: true } } }
              ]
            }
          ]
        }
      }
    ) {
      aggregate {
        sum {
          years_of_life_lost
        }
      }
    }
  }
`;

// TODO: Try old query!!!!!!!

// SELECT
//   75 - prsn_age as years_of_life_lost
// FROM
//   atd_txdot_primaryperson as pp
// WHERE
//   1 = 1
//   AND pp.prsn_injry_sev_id = 4
//   AND pp.prsn_age < 75
//   AND pp.prsn_age IS NOT NULL

// ALTER TABLE atd_txdot_person
// ADD COLUMN years_of_life_lost integer
// GENERATED ALWAYS AS (GREATEST(75 - prsn_age, 0)) STORED;
