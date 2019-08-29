import { gql } from "apollo-boost";

export const GET_LOCATIONS = gql`
    query GetLocations($recordLimit: Int, $recordOffset: Int) {
        atd_txdot_locations(limit: $recordLimit, offset: $recordOffset) {
            unique_id
            description
        }
    }
`;
