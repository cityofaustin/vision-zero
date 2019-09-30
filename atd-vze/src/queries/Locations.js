import { gql } from "apollo-boost";

export const GET_LOCATION = gql`
  query GetLocation($id: String) {
    atd_txdot_locations(where: { unique_id: { _eq: $id } }) {
      unique_id
      address
      description
      shape
      latitude
      longitude
      metadata
      last_update
      is_retired
    }
    atd_txdot_crashes_aggregate(
      where: { city_id: { _eq: 22 }, location: { location_id: { _eq: $id } } }
    ) {
      aggregate {
        count
      }
    }
    atd_txdot_primaryperson_aggregate(
      where: {
        crash: { city_id: { _eq: 22 }, location: { location_id: { _eq: $id } } }
      }
    ) {
      aggregate {
        count
        sum {
          death_cnt
          sus_serious_injry_cnt
          years_of_life_lost
        }
      }
    }
    atd_txdot_person_aggregate(
      where: {
        crash: { city_id: { _eq: 22 }, location: { location_id: { _eq: $id } } }
      }
    ) {
      aggregate {
        count
        sum {
          death_cnt
          sus_serious_injry_cnt
          years_of_life_lost
        }
      }
    }
    atd_txdot_units_aggregate(
      where: {
        crash: { city_id: { _eq: 22 }, location: { location_id: { _eq: $id } } }
      }
    ) {
      aggregate {
        count
      }
    }
    atd_txdot_locations(where: { unique_id: { _eq: $id } }) {
      crashes_by_veh_body_style {
        veh_body_styl_desc
        count
      }
    }
  }
`;

export const UPDATE_LOCATION = gql`
  mutation {
    update_atd_txdot_locations(
      where: { unique_id: { _eq: "1" } }
      _set: {
        shape: {
          type: "Polygon"
          coordinates: [
            [
              [-97.742432176299, 30.268437624417]
              [-97.7425106013248, 30.2682367509195]
              [-97.7425124326413, 30.2682252208329]
              [-97.7425121056288, 30.2682246619878]
              [-97.7424953455661, 30.2682165476232]
              [-97.7424035917257, 30.2681676487498]
              [-97.742096409305, 30.2680840918094]
              [-97.7420818296157, 30.2680758852301]
              [-97.7421161445704, 30.2678727167686]
              [-97.7422256736418, 30.2676907123971]
              [-97.7422430276021, 30.2676914901396]
              [-97.742548262404, 30.2677802553866]
              [-97.7426622866524, 30.2677754765905]
              [-97.7426812812039, 30.267777254754]
              [-97.7426819218774, 30.2677769717396]
              [-97.742688626238, 30.267766304461]
              [-97.7427665723107, 30.2675534876888]
              [-97.7427740837375, 30.2675427663411]
              [-97.7430079647957, 30.2675751172078]
              [-97.7432184457574, 30.2676693572388]
              [-97.743217177914, 30.2676818579123]
              [-97.7431346821331, 30.2678933774416]
              [-97.7431328007894, 30.2679054190538]
              [-97.7431331280948, 30.2679059670751]
              [-97.7431490120785, 30.2679135294601]
              [-97.7432232071975, 30.2679653718184]
              [-97.7435201761081, 30.2680419349051]
              [-97.7435345140433, 30.2680496248046]
              [-97.7435033431968, 30.2682532316101]
              [-97.7433972926381, 30.2684368458478]
              [-97.7433804544691, 30.2684362113344]
              [-97.7430852514011, 30.2683546603069]
              [-97.7429820083723, 30.2683550717496]
              [-97.7429637114551, 30.2683534791814]
              [-97.742963062249, 30.2683537701459]
              [-97.7429566556244, 30.2683639949949]
              [-97.7428825117332, 30.2685660895454]
              [-97.7428753839072, 30.2685763819236]
              [-97.7428120457324, 30.2685674955644]
              [-97.7426584403044, 30.2684989620775]
              [-97.7424879448969, 30.2684750397369]
              [-97.7424308813649, 30.2684495804261]
              [-97.742432176299, 30.268437624417]
            ]
          ]
        }
      }
    ) {
      returning {
        shape
      }
    }
  }
`;
