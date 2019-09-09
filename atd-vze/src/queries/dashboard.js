import { gql } from "apollo-boost";

export const GET_CRASH = gql`
  query GetCrashesYTD($yearStart: date, $yearEnd: date) {
    atd_txdot_crashes_aggregate(
      where: { crash_date: { _gte: $yearStart, _lte: $yearEnd } }
    ) {
      aggregate {
        count
      }
    }
    atd_txdot_crashes(where: {death_cnt: {_gte: 1}, crash_date: {_gte: $yearStart, _lte: $yearEnd}}) {
      death_cnt
    }
  }
`;
