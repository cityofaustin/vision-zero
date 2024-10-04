const DEFAULT_QUERY_PARAMS = {
  where: "1=1", // return all features
  f: "json", // features as Esri json - we could request geojson but esri botches it
  outFields: "*", // return all fields
  returnGeometry: "true", // include geometry property
  geometryPrecision: "8", // num of lat/lon decimal places
  outSR: "4326", // out spatial reference as WGS1984
};

const LAYERS = {
  non_coa_roadways: {
    service_name: "On_System_Polygon_Feature",
    layer_id: 0,
    query_params: { ...DEFAULT_QUERY_PARAMS },
    fields: [],
    shouldTruncateFirst: true,
    truncateMutation: `
      mutation DeleteNonCoaRoadways {
        delete_non_coa_roadways(where: { geometry: { _is_null: false } }) {
          affected_rows
        }
      }
    `,
    upsertMutation: `
      mutation InsertNonCoaRoadways(
        $objects: [non_coa_roadways_insert_input!]!
      ) {
        insert_non_coa_roadways(objects: $objects) {
          affected_rows
        }
      }
    `,
  },
  signal_engineer_areas: {
    service_name: "TRANSPORTATION_signal_engineer_areas",
    layer_id: 0,
    query_params: { ...DEFAULT_QUERY_PARAMS },
    fields: ["SIGNAL_ENG_AREA", "SIGNAL_ENGINEER_AREA_ID"],
    shouldTruncateFirst: false,
    upsertMutation: `
      mutation UpsertSignalEngineerAreas(
        $objects: [signal_engineer_areas_insert_input!]!
      ) {
        insert_signal_engineer_areas(
          objects: $objects
          on_conflict: {
            constraint: signal_engineer_areas_signal_engineer_area_id_key
            update_columns: [signal_eng_area, geometry]
          }
        ) {
          affected_rows
        }
      }
    `,
  },
};

module.exports = {
  DEFAULT_QUERY_PARAMS,
  LAYERS,
};
