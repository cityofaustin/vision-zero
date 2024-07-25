import { gql } from "apollo-boost";

// These queries are derived from the ETL that populates our Socrata data sets
// so that the VZV and VZE widget totals match up
// See https://github.com/cityofaustin/atd-vz-data/blob/master/atd-etl/app/process/socrata_queries.py
export const GET_CRASHES_YTD = gql`
  query GetCrashesYTD($yearStart: String, $yearEnd: String) {
    socrata_export_crashes_view_aggregate(
      where: { crash_timestamp: { _lt: $yearEnd, _gte: $yearStart } }
    ) {
      aggregate {
        sum {
          death_cnt
        }
      }
      aggregate {
        sum {
          sus_serious_injry_cnt
        }
      }
      aggregate {
        sum {
          years_of_life_lost
        }
      }
    }
  }
`;
