import { gql } from "apollo-boost";

// These queries are derived from the ETL that populates our Socrata data sets
// so that the VZV and VZE widget totals match up
// See https://github.com/cityofaustin/atd-vz-data/blob/master/atd-etl/app/process/socrata_queries.py
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
