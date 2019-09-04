import axios from "axios";
import { gql } from "apollo-boost";


const getHeaders = () => {
    return {
        headers: {
            "content-type": "application/json",
            "Authorization": "Bearer " + localStorage.getItem("id_token"),
            "x-hasura-role": localStorage.getItem("hasura_user_role"),
        }
    };
};

const config = {
    apiEndpoint: "https://vzd.austintexas.io/v1/graphql",
};

const api = {
    getLocationsTest() {
        const QUERY_LOCATIONS = gql`
            query getAllLocations {
                atd_txdot_locations(limit: 100) {
                    unique_id
                    description
                    is_studylocation
                }
            }
        `;

        return axios.post(config.apiEndpoint, {
            query: print(QUERY_LOCATIONS),
            headers: getHeaders()
        })
        .then(res => console.log(res))
        .catch(err => console.log(err));
    },
    updateLocationMarkStudyLoc(id) {
        const ADD_SKILL = gql`
            mutation addSkill($id:String!, $name:String!, $level:Float!, $type:String!) {
                addSkill(id:$id, name:$name, level:$level, type:$type) {
                    status
                    id
                    name
                    level
                    type
                }
            }
        `

        axios.post(config.apiEndpoint, {
            query: print(ADD_SKILL),
            variables: {
                id: 1,
                name: "Hello",
                level: 123,
                type: "TheType",
            },
        })
        .then(res => console.log(res))
        .catch(err => console.log(err))
    }
};

export default api;
