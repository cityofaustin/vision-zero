import { gql } from "apollo-boost";

export const GET_CRASHES_QA = gql`
    query GetCrashesQa ($recordLimit: Int, $recordOffset: Int) {
        atd_txdot_crashes(limit: $recordLimit, offset: $recordOffset,
            where: {
                _and:[
                    { latitude: {_is_null: true} },
                    { longitude: {_is_null: true} }
                ],
                _or: [
                    { death_cnt: {_gt: 0} },
                    { sus_serious_injry_cnt: {_gt: 0}}
                ]
            }, order_by: {crash_date: desc}
        ) {
            crash_id
            death_cnt
            tot_injry_cnt
            sus_serious_injry_cnt
            crash_fatal_fl
            rpt_street_pfx
            rpt_street_sfx
            rpt_street_name
            crash_date
        }
#        ,
#        atd_txdot_crashes_aggregate(where: {_and: [{latitude: {_is_null: true}}, {longitude: {_is_null: true}}], _or: [{death_cnt: {_gt: 0}}, {sus_serious_injry_cnt: {_gt: 0}}]}, order_by: {crash_date: desc}) {
#            aggregate {
#                count
#            }
#        }
    }
`;
