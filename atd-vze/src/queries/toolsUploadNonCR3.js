import { gql } from "apollo-boost";

export const mutationDummy = gql`
  mutation mutationInsertNonCR3 {
    __typename # Placeholder value
  }
`

export const mutationInsertNonCR3 = `
mutation mutationInsertNonCR3 {
  insert_atd_apd_blueform(objects: 
    [
      %NON_CR3_DATA%
    ]
    ,
    on_conflict: {
      constraint: atd_apd_blueform_pk,
      update_columns: [
        date
        case_id
        address
        longitude
        latitude
        hour
      ]
    }
  ) {
    affected_rows
  }
}
`

export const mutationNonCR3Data = {
  date: "",
  case_id: -1,
  address: "",
  longitude: "",
  latitude: "",
  hour: -1,
}
