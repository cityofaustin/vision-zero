const {
  combineDistrictTenFeatures,
  ESRI_MAX_RECORD_COUNT,
  csvToArray,
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
 * Field mapping configuration object
 * @typedef {Object} FieldMapping
 * @property {string} inputName - The name of the field in the input (AGOL) data source (e.g., "ID")
 * @property {string} outputName - The name of the field in the output/transformed data (e.g., "id")
 * @property {boolean} isPrimaryKey - indicates this field serves as the primary key and is required
 *  in order to ensure proper query pagination. When upserting, this field will be excluded from the
 * update columns in the "on_conflict" directive
 * @property {Function} [valueHandler] - optional function that processes/transforms the input
 * field value
 */

/**
 * @typedef {Object} Layer
 * @property {string} service_name - The unique name of the service in the City of Austin AGOL
 * org. This can be found by inspecting the layer's service definition on AGOL.
 * @property {number} layer_id - The AGOL ID of the layer in the service. This can be found by
 *  inspecting the layer's service definition on AGOL.
 * @property {Object} query_params - ArcGIS REST API query parameters to include when querying
 *   the layer data from AGOL. See DEFAULT_ESRI_QUERY_PARAMS.
 * @property {FieldMapping[]} fields - List of FieldMapping config objects
 * properties to database column values. All fieldnames will be converted to lowercase.
 * @property {Function} customTransformer - An optional function which can provide custom transformations
 * against the entire output geojson. Must accept a geosjon feature collection as the sole input param
 * and modify the geojson in-place.
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
      {
        inputName: "PRIMARY_KEY",
        outputName: "primary_key",
        isPrimaryKey: true,
      },
      { inputName: "DISTRICT_NAME", outputName: "district_name" },
      { inputName: "BATTALION_CODE", outputName: "battalion_code" },
      { inputName: "SECTOR_NAME", outputName: "sector_name" },
      { inputName: "BUREAU_NAME", outputName: "bureau_name" },
      { inputName: "PATROL_AREA", outputName: "patrol_area" },
    ],
    tableName: "apd_sectors",
    tableSchema: "geo",
  },
  council_districts: {
    service_name: "BOUNDARIES_single_member_districts",
    layer_id: 0,
    query_params: { ...DEFAULT_ESRI_QUERY_PARAMS },
    fields: [
      {
        inputName: "COUNCIL_DISTRICT",
        outputName: "council_district",
        isPrimaryKey: true,
      },
    ],
    customTransformer: combineDistrictTenFeatures,
    tableName: "council_districts",
    tableSchema: "geo",
  },
  engineering_areas: {
    service_name: "TRANSPORTATION_engineering_service_areas",
    layer_id: 0,
    query_params: { ...DEFAULT_ESRI_QUERY_PARAMS },
    fields: [
      {
        inputName: "ENGINEERING_AREA_ID",
        outputName: "engineering_area_id",
        isPrimaryKey: true,
      },
      { inputName: "ATD_ENGINEER_AREAS", outputName: "atd_engineer_areas" },
    ],
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
    fields: [
      {
        inputName: "JURISDICTIONS_ID",
        outputName: "jurisdictions_id",
        isPrimaryKey: true,
      },
      { inputName: "CITY_NAME", outputName: "city_name" },
      { inputName: "JURISDICTION_LABEL", outputName: "jurisdiction_label" },
    ],
    tableName: "jurisdictions",
    tableSchema: "geo",
  },
  non_coa_roadways: {
    service_name: "On_System_Polygon_Feature",
    layer_id: 0,
    query_params: { ...DEFAULT_ESRI_QUERY_PARAMS },
    fields: [{ inputName: "OBJECTID", outputName: "objectid", isPrimaryKey: true}],
    tableName: "non_coa_roadways",
    tableSchema: "geo",
  },
  signal_engineer_areas: {
    service_name: "TRANSPORTATION_signal_engineer_areas",
    layer_id: 0,
    query_params: { ...DEFAULT_ESRI_QUERY_PARAMS },
    fields: [
      { inputName: "SIGNAL_ENG_AREA", outputName: "signal_eng_area" },
      {
        inputName: "SIGNAL_ENGINEER_AREA_ID",
        outputName: "signal_engineer_area_id",
        isPrimaryKey: true,
      },
    ],
    tableName: "signal_engineer_areas",
    tableSchema: "geo",
  },
  zip_codes: {
    service_name: "TPW_ZIPCodes_VZ",
    layer_id: 0,
    query_params: { ...DEFAULT_ESRI_QUERY_PARAMS },
    fields: [
      { inputName: "ZIPCODE", outputName: "zipcode", isPrimaryKey: true },
    ],
    tableName: "zip_codes",
    tableSchema: "geo",
  },
  equity_action_zones: {
    service_name: "Equity_Analysis_Zones_2021",
    layer_id: 0,
    query_params: { ...DEFAULT_ESRI_QUERY_PARAMS },
    fields: [
      { inputName: "GEOID", outputName: "geoid", isPrimaryKey: true },
      { inputName: "indxd_v", outputName: "indxd_v" },
      { inputName: "EAZ_Type", outputName: "eaz_type" },
    ],
    tableName: "equity_action_zones",
    tableSchema: "geo",
  },
  location_polygons: {
    service_name: "New_Vision_Zero_Polygons",
    layer_id: 0,
    query_params: { ...DEFAULT_ESRI_QUERY_PARAMS },
    fields: [
      {
        inputName: "location_id",
        outputName: "location_id",
        isPrimaryKey: true,
      },
      { inputName: "location_name", outputName: "location_name" },
      { inputName: "location_group", outputName: "location_group" },
      {
        inputName: "is_intersection",
        outputName: "is_intersection",
        valueHandler: Boolean,
      },
      {
        inputName: "is_signalized",
        outputName: "is_signalized",
        valueHandler: Boolean,
      },
      { inputName: "is_hin", outputName: "is_hin", valueHandler: Boolean },
      {
        inputName: "is_service_road",
        outputName: "is_service_road",
        valueHandler: Boolean,
      },
      {
        inputName: "council_districts",
        outputName: "council_districts",
        valueHandler: (value) => csvToArray(value, true),
      },
      {
        inputName: "signal_eng_areas",
        outputName: "signal_eng_areas",
        valueHandler: csvToArray,
      },
      {
        inputName: "area_eng_areas",
        outputName: "area_eng_areas",
        valueHandler: csvToArray,
      },
      {
        inputName: "zip_codes",
        outputName: "zip_codes",
        valueHandler: csvToArray,
      },
      {
        inputName: "apd_sectors",
        outputName: "apd_sectors",
        valueHandler: csvToArray,
      },
      {
        inputName: "street_levels",
        outputName: "street_levels",
        valueHandler: (value) => csvToArray(value, true),
      },
      { inputName: "signal_id", outputName: "signal_id" },
      { inputName: "signal_type", outputName: "signal_type" },
      { inputName: "signal_status", outputName: "signal_status" },
      {
        inputName: "is_deleted",
        outputName: "is_deleted",
        valueHandler: Boolean,
      },
    ],
    tableName: "atd_txdot_locations",
    tableSchema: "public",
    upsert: true,
    onConflictConstraintName: "atd_txdot_locations_pk",
  },
};

module.exports = {
  DEFAULT_ESRI_QUERY_PARAMS,
  ESRI_MAX_RECORD_COUNT,
  LAYERS,
};
