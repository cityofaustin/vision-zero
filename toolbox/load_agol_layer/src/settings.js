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
    service_name: "f",
    layer_id: 0,
    query_params: { ...DEFAULT_QUERY_PARAMS },
    fields: [],
  },
  signal_engineer_areas: {
    service_name: "TRANSPORTATION_signal_engineer_areas",
    layer_id: 0,
    query_params: { ...DEFAULT_QUERY_PARAMS },
    fields: ["SIGNAL_ENG_AREA", "SIGNAL_ENGINEER_AREA_ID"],
  },
};

module.exports = {
  DEFAULT_QUERY_PARAMS,
  LAYERS,
};
