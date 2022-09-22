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
    atd_txdot_person_aggregate(
      where: {
        crash: { private_dr_fl: { _eq: "N" } }
        _or: [
          { prsn_injry_sev_id: { _eq: 1 } }
          { prsn_injry_sev_id: { _eq: 4 } }
        ]
        _and: {
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
    atd_txdot_primaryperson_aggregate(
      where: {
        injury_severity: { injry_sev_desc: { _eq: "KILLED" } }
        crash: {
          city_id: { _eq: 22 }
          crash_date: { _gte: $yearStart, _lte: $yearEnd }
          apd_confirmed_fatality: { _neq: "N" }
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

// Notes
// atd_txdot_person_aggregate(
//   where: {
//       crash: { private_dr_fl: { _eq: "N" }},
//       _or: [
//           {prsn_injry_sev_id: {_eq: 1}},
//           {prsn_injry_sev_id: {_eq: 4}}
//       ],
//       _and: {
//           crash: {crash_date: {_lt: $yearEnd, _gte: $yearStart }}
//           _or: [
//               {crash: {austin_full_purpose: {_eq: "Y"}}},
//               {
//                   _and: [
//                       {crash: {city_id: {_eq: 22}}},
//                       {crash: {position: {_is_null: true}}}
//                   ]
//               }
//           ]
//       }
//   }
// ) {
// aggregate {
// sum {
// prsn_age
// }
// }
// }
