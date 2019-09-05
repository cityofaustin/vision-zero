import axios from "axios";
import { gql } from "apollo-boost";

const getHeaders = () => {
  return {
    headers: {
      "content-type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("id_token"),
      "x-hasura-role": localStorage.getItem("hasura_user_role"),
    },
  };
};

const config = {
  apiEndpoint: "https://vzd.austintexas.io/v1/graphql",
};

const api = {
  crash() {
    console.log(getHeaders());
    return {
      editCoordinates: data =>
        axios.post(
          config.apiEndpoint,
          {
            query: `
            mutation update_atd_txdot_crashes($crash_id: Int, $qa_status: Int, $geocode_provider: Int) {
                 update_atd_txdot_crashes(where: {crash_id: {_eq: $crash_id}}, _set: {qa_status: $qa_status, geocode_provider: $geocode_provider}){
                   returning {
                     crash_id
                   }
                 }
               }`,
            variables: data,
          },
          getHeaders()
        ),
    };
  },
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

    return axios
      .post(config.apiEndpoint, {
        query: QUERY_LOCATIONS,
        headers: getHeaders(),
      })
      .then(res => console.log(res))
      .catch(err => console.log(err));
  },
  updateLocationMarkStudyLoc(id) {
    const UPDATE_LOCATION_MARKSTUDYLOC = gql`
      mutation updateLocationMarkStudyLocation(
        $id: String
        $address: String
        $studyloc: Boolean
      ) {
        update_atd_txdot_locations(
          where: { unique_id: { _eq: $id } }
          _set: { address: $address, is_studylocation: $studyloc }
        ) {
          affected_rows
        }
      }
    `;

    axios
      .post(config.apiEndpoint, {
        query: UPDATE_LOCATION_MARKSTUDYLOC,
        variables: {
          id: "0",
          address: "Mutated from VZE",
          is_studylocation: true,
        },
        headers: getHeaders(),
      })
      .then(res => console.log(res))
      .catch(err => console.log(err));
  },
};

export default api;
