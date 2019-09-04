import { gql } from "apollo-boost";

export const GET_LOCATIONS = `
    {
        atd_txdot_locations(limit: 25, offset: 0) {
            unique_id,
            description,
            last_update,
        },
        atd_txdot_locations_aggregate {
            aggregate {
                count
            }
        }
    }
`;

export const FILTER_LOCATIONS = `
    {
        atd_txdot_locations (
            OFFSET
            LIMIT
            ORDER_BY
            SEARCH
        ) {
            unique_id,
            description,
            last_update,
        },
        atd_txdot_locations_aggregate {
            aggregate {
                count
            }
        }
    }
`;


export const GET_LOCATION = gql`
    query GetLocation($id: String) {
        atd_txdot_locations(where: {unique_id: {_eq: $id}}) {
            unique_id,
            address,
            description,
            geometry,
            metadata,
            last_update,
            is_retired
        }   
    }

`;
