const { combineDistrictTenFeatures } = require("./utils");

const DEFAULT_ESRI_QUERY_PARAMS = {
  where: "1=1", // return all features
  f: "json", // features as Esri json - we could request geojson but esri botches it
  outFields: "*", // return all fields
  returnGeometry: "true", // include geometry property
  geometryPrecision: "8", // num of lat/lon decimal places
  outSR: "4326", // out spatial reference as WGS1984
};

/**
 * @typedef {Object} Layer
 * @property {string} service_name - The unique name of the service in the City of Austin AGOL org.
 *  This can be found by inspecting the layer's service definition on AGOL.
 * @property {number} layer_id - The AGOL ID of the layer in the service. This can be found by
 *  inspecting the layer's service definition on AGOL.
 * @property {Object} query_params - ArcGIS REST API query parameters to include when querying
 *   the layer data from AGOL. See DEFAULT_ESRI_QUERY_PARAMS.
 * @property {string[]} fields - List of field names which will be translated from feature properties
 *   to database column values. All fieldnames will be converted to lowercase.
 * @property {Function} transformer - An optional transform function which should accept a geosjon
 * feature collection as the sole input param and modify the geojson in-place.
 * @property {string} tableName - The name of the layer's table in the Vision Zero database
 */
const LAYERS = {
  apd_sectors: {
    service_name: "APD_Proposed_Sector_Districts_Jan_2025",
    layer_id: 0,
    query_params: { ...DEFAULT_ESRI_QUERY_PARAMS },
    fields: [
      "OBJECT_ID",
      "DISTRICT_NAME",
      "BATTALION_CODE",
      "SECTOR_NAME",
      "BUREAU_NAME",
      "PATROL_AREA",
    ],
    tableName: "apd_sectors",
  },
  council_districts: {
    service_name: "BOUNDARIES_single_member_districts",
    layer_id: 0,
    query_params: { ...DEFAULT_ESRI_QUERY_PARAMS },
    fields: ["COUNCIL_DISTRICT"],
    transformer: combineDistrictTenFeatures,
    tableName: "council_districts",
  },
  engineering_areas: {
    service_name: "TRANSPORTATION_engineering_service_areas",
    layer_id: 0,
    query_params: { ...DEFAULT_ESRI_QUERY_PARAMS },
    fields: ["ENGINEERING_AREA_ID", "ATD_ENGINEER_AREAS"],
    tableName: "engineering_areas",
  },
  jurisdictions: {
    service_name: "BOUNDARIES_jurisdictions_planning",
    layer_id: 0,
    query_params: {
      ...DEFAULT_ESRI_QUERY_PARAMS,
      where: "JURISDICTION_LABEL = 'AUSTIN FULL PURPOSE'",
    },
    fields: ["JURISDICTIONS_ID", "CITY_NAME", "JURISDICTION_LABEL"],
    tableName: "jurisdictions",
  },
  non_coa_roadways: {
    service_name: "On_System_Polygon_Feature",
    layer_id: 0,
    query_params: { ...DEFAULT_ESRI_QUERY_PARAMS },
    fields: [],
    tableName: "non_coa_roadways",
  },
  signal_engineer_areas: {
    service_name: "TRANSPORTATION_signal_engineer_areas",
    layer_id: 0,
    query_params: { ...DEFAULT_ESRI_QUERY_PARAMS },
    fields: ["SIGNAL_ENG_AREA", "SIGNAL_ENGINEER_AREA_ID"],
    tableName: "signal_engineer_areas",
  },
  zip_codes: {
    service_name: "TPW_ZIPCodes_VZ",
    layer_id: 0,
    query_params: { ...DEFAULT_ESRI_QUERY_PARAMS },
    fields: ["ZIPCODE"],
    tableName: "zip_codes",
  },
  equity_action_zones: {
    service_name: "Equity_Analysis_Zones_2021",
    layer_id: 0,
    query_params: { ...DEFAULT_ESRI_QUERY_PARAMS },
    fields: ["GEOID", "indxd_v", "EAZ_Type"],
    tableName: "equity_action_zones",
  },
};

module.exports = {
  DEFAULT_ESRI_QUERY_PARAMS,
  LAYERS,
};
