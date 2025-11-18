const {
  combineDistrictTenFeatures,
  ESRI_MAX_RECORD_COUNT,
  locationPolygonsTransformer,
} = require("./utils");

const DEFAULT_ESRI_QUERY_PARAMS = {
  where: "1=1", // return all features
  f: "json", // features as Esri json - we could request geojson but esri botches it
  outFields: "*", // return all fields
  returnGeometry: "true", // include geometry property
  geometryPrecision: "8", // num of lat/lon decimal places
  outSR: "4326", // out spatial reference as WGS1984
  resultRecordCount: ESRI_MAX_RECORD_COUNT,
};

/**
 * @typedef {Object} Layer
 * @property {string} service_name - The unique name of the service in the City of Austin AGOL
 * org. This can be found by inspecting the layer's service definition on AGOL.
 * @property {number} layer_id - The AGOL ID of the layer in the service. This can be found by
 *  inspecting the layer's service definition on AGOL.
 * @property {Object} query_params - ArcGIS REST API query parameters to include when querying
 *   the layer data from AGOL. See DEFAULT_ESRI_QUERY_PARAMS.
 * @property {string[]} fields - List of field names which will be translated from feature
 * properties to database column values. All fieldnames will be converted to lowercase.
 * @property {Function} transformer - An optional transform function which should accept a geosjon
 * feature collection as the sole input param and modify the geojson in-place.
 * @property {string} tableName - The name of the layer's table in the Vision Zero database
 * @property {string} tableSchema - The db schema in which the layer resides
 * @property {boolean} upsert - If the layer should be processed as an upsert rather than a
 * truncate and replace. This flag was added for `atd_txdot_location` polygons.
 * @property {string} [onConflictConstraintName] - required when upserting. the db constraint
 * name to be used in the upsert mutation's `on conflict` argument.
 */
const LAYERS = {
  apd_sectors: {
    service_name: "BOUNDARIES_apd_districts",
    layer_id: 0,
    query_params: { ...DEFAULT_ESRI_QUERY_PARAMS },
    fields: [
      "PRIMARY_KEY",
      "DISTRICT_NAME",
      "BATTALION_CODE",
      "SECTOR_NAME",
      "BUREAU_NAME",
      "PATROL_AREA",
    ],
    tableName: "apd_sectors",
    tableSchema: "geo",
  },
  council_districts: {
    service_name: "BOUNDARIES_single_member_districts",
    layer_id: 0,
    query_params: { ...DEFAULT_ESRI_QUERY_PARAMS },
    fields: ["COUNCIL_DISTRICT"],
    transformer: combineDistrictTenFeatures,
    tableName: "council_districts",
    tableSchema: "geo",
  },
  engineering_areas: {
    service_name: "TRANSPORTATION_engineering_service_areas",
    layer_id: 0,
    query_params: { ...DEFAULT_ESRI_QUERY_PARAMS },
    fields: ["ENGINEERING_AREA_ID", "ATD_ENGINEER_AREAS"],
    tableName: "engineering_areas",
    tableSchema: "geo",
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
    tableSchema: "geo",
  },
  non_coa_roadways: {
    service_name: "On_System_Polygon_Feature",
    layer_id: 0,
    query_params: { ...DEFAULT_ESRI_QUERY_PARAMS },
    fields: [],
    tableName: "non_coa_roadways",
    tableSchema: "geo",
  },
  signal_engineer_areas: {
    service_name: "TRANSPORTATION_signal_engineer_areas",
    layer_id: 0,
    query_params: { ...DEFAULT_ESRI_QUERY_PARAMS },
    fields: ["SIGNAL_ENG_AREA", "SIGNAL_ENGINEER_AREA_ID"],
    tableName: "signal_engineer_areas",
    tableSchema: "geo",
  },
  zip_codes: {
    service_name: "TPW_ZIPCodes_VZ",
    layer_id: 0,
    query_params: { ...DEFAULT_ESRI_QUERY_PARAMS },
    fields: ["ZIPCODE"],
    tableName: "zip_codes",
    tableSchema: "geo",
  },
  equity_action_zones: {
    service_name: "Equity_Analysis_Zones_2021",
    layer_id: 0,
    query_params: { ...DEFAULT_ESRI_QUERY_PARAMS },
    fields: ["GEOID", "indxd_v", "EAZ_Type"],
    tableName: "equity_action_zones",
    tableSchema: "geo",
  },
  location_polygons: {
    service_name: "New_Vision_Zero_Polygons",
    layer_id: 0,
    query_params: { ...DEFAULT_ESRI_QUERY_PARAMS },
    fields: [
      "location_id",
      "location_name",
      "location_group",
      "is_intersection",
      "is_signalized",
      "is_hin",
      "is_service_road",
      "council_districts",
      "signal_eng_areas",
      "area_eng_areas",
      "zip_codes",
      "apd_sectors",
      "street_levels",
      "signal_id",
      "signal_type",
      "signal_status",
      "is_deleted",

      //   "created_by",
      //   "created_at",
      //   "updated_by",
      //   "updated_at",
      //   "geometry",
      //   "ToBeAdded",
      //   "AFP",
      //   "IntersectsAPD",
      //   "created_user",
      //   "created_date",
      //   "last_edited_user",
      //   "last_edited_date",
    ],
    booleanFields: [
      "is_intersection",
      "is_signalized",
      "is_hin",
      "is_service_road",
      "is_deleted",
    ],
    tableName: "atd_txdot_locations",
    tableSchema: "public",
    transformer: locationPolygonsTransformer,
    upsert: true,
    onConflictConstraintName: "atd_txdot_locations_pk",
  },
};

module.exports = {
  DEFAULT_ESRI_QUERY_PARAMS,
  ESRI_MAX_RECORD_COUNT,
  LAYERS,
};
