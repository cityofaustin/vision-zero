const fs = require("fs");

const AGOL_USERNAME = process.env.AGOL_USERNAME;
const AGOL_PASSWORD = process.env.AGOL_PASSWORD;
const AGOL_ORG_BASE_URL = "https://austin.maps.arcgis.com";
const COORDINATE_DECIMAL_PLACES = 6;
const coordPrecisionMultiplier = Math.pow(10, COORDINATE_DECIMAL_PLACES);
/**\
 * this limit is set by CTM ArcGIS Online admins
 * you can confirm this per feature layer by inspecting the feature service
 * metadata
 */
const ESRI_MAX_RECORD_COUNT = 2000;

/**
 * Save a JSON object to file
 */
const saveJSONFile = (name, data) => {
  fs.writeFileSync(name, JSON.stringify(data));
};

/**
 * Read a JSON file into memory
 */
const loadJSONFile = (name) => {
  return JSON.parse(fs.readFileSync(name));
};

/**
 * Construct a URL to an AGOL service
 */
const getEsriLayerUrl = ({ service_name, layer_id, query_params }) => {
  const queryString = new URLSearchParams(query_params).toString();
  return `https://services.arcgis.com/0L95CJ0VTaxqcmED/arcgis/rest/services/${service_name}/FeatureServer/${layer_id}/query?${queryString}`;
};

/**
 * Convert Polygon features to MultiPolygon. Non-polygon geometry types are ignored.
 *
 * Whereas AGOL may hold poly and multi poly geometries in the same layer, postGIS
 * does not support this. We can easily convert polygons to multipolygons by
 * wrapping their geometry in an outer array.
 *
 * Alternatively we could use a DB trigger that applies `ST_Multi` to the geometry
 * before inserting it.
 *
 * @param {Object[]} features - Array of GeoJSON features
 *
 * @returns {void} Updates the `geometry` of each feature in-place
 */
const makeUniformMultiPoly = (features) => {
  features.forEach((feature) => {
    /** Ignore geojson geometry types except Polygon  */
    if (feature.geometry.type === "Polygon") {
      feature.geometry.type = "MultiPolygon";
      feature.geometry.coordinates = [feature.geometry.coordinates];
      console.log(`Converted Polygon to MultiPolygon`);
    }
  });
};

/**
 * Processes GeoJSON features by reducing their properties to a specified set of fields
 * and also lowercasing each field name.
 *
 * @param {Object[]} features - Array of GeoJSON features. Each feature should have a `properties` object.
 * @param {string[]} fields - Array of fields names to retain from the feature's properties.
 * The field names are converted to lowercase in the resulting properties.
 *
 * @returns {void} Updates each feature's properties in-place.
 */
const handleFields = (features, fields) => {
  features.forEach((f) => {
    f.properties = fields.reduce((newProperties, field) => {
      newProperties[field.toLowerCase()] = f.properties[field];
      return newProperties;
    }, {});
  });
};

/**
 * Recursively handles GeoJSON coordinates by reducing precision of decimal places.
 *
 * @param {number[] | Array<number[]>} coords - A GeoJSON coordinate array or a number array.
 * If `coords` is an array of numbers, their precision is reduced.
 * If `coords` contains arrays, the function will recurse until it finds the numbers.
 *
 * @returns {void} Coordinates are updated in-place.
 */
function recursiveCoordinateHandler(coords) {
  if (coords.some((value) => typeof value === "number")) {
    // reduce precision of coordinates
    return coords.forEach((value, i) => {
      coords[i] =
        Math.round(value * coordPrecisionMultiplier) / coordPrecisionMultiplier;
    });
  } else if (coords.some((value) => Array.isArray(value))) {
    // keep searching for coordinates
    return coords.forEach((coords) => recursiveCoordinateHandler(coords));
  }
}

/**
 * Given an array of geojson features, reduce the decimal precision of each
 * coordinate to the number of places defined by COORDINATE_DECIMAL_PLACES.
 * @param {Object[]} features - Array of GeoJSON features
 *
 * @returns {void} Updates features in-places
 */
const reduceGeomPrecision = (features) => {
  features.forEach(({ geometry }) => {
    recursiveCoordinateHandler(geometry.coordinates);
  });
};

/**
 * Fetch wrapper that handles error handling and json parsing
 */
const genericJSONFetch = async ({ url, method, ...options }) => {
  const response = await fetch(url, {
    method,
    ...options,
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP error: ${response.status} - ${errorText}`);
  }
  const responseData = await response.json();

  if (responseData?.errors || responseData.error) {
    throw JSON.stringify(responseData);
  }
  return responseData;
};

/**
 * Get a token that can be used to authenticate with the ArcGIS REST API
 * @returns {{ token: string }} An object containing a `token` property with the token string
 */
async function getEsriToken() {
  const url = `${AGOL_ORG_BASE_URL}/sharing/rest/generateToken`;
  const data = {
    username: AGOL_USERNAME,
    password: AGOL_PASSWORD,
    referer: "http://www.arcgis.com",
    f: "pjson",
  };
  const body = new URLSearchParams(data);
  const headers = { "Content-Type": "application/x-www-form-urlencoded" };
  return genericJSONFetch({ url, method: "POST", body, headers });
}

// /**
//  * Just a wrapper which makes a GET request to any endpoint
//  * @param {string} url - The ArcGIS REST API endpoint
//  * @returns JSON object
//  */
// const getEsriJson = async (url) => {
//   return genericJSONFetch({ url, method: "GET" });
// };

/**
 * Fetch an ESRI layer with pagination using globalid sorting
 * @param {Object} params
 * @param {string} params.service_name - The service name
 * @param {number} params.layer_id - The layer ID
 * @param {Object} params.query_params - Base query parameters
 * @param {number} [params.page_size=1000] - Number of records per page
 * @returns {Promise<Object>} Combined ESRI JSON with all features
 */
const getEsriJson = async ({ service_name, layer_id, query_params }) => {
  let offset = 0;
  let hasMore = true;
  let combinedJson = null;
  const pageSize = ESRI_MAX_RECORD_COUNT;
  console.log(
    `Fetching paginated data (page size: ${ESRI_MAX_RECORD_COUNT})...`
  );

  while (hasMore) {
    // Create paginated query params
    const paginatedParams = {
      ...query_params,
      orderByFields: "globalid",
      resultOffset: offset,
      resultRecordCount: pageSize,
    };

    const url = getEsriLayerUrl({
      service_name,
      layer_id,
      query_params: paginatedParams,
    });

    console.log("URL", url);
    const response = await genericJSONFetch({ url, method: "GET" });

    // First response JSON will be used to hold all features
    if (combinedJson === null) {
      combinedJson = { ...response };
      combinedJson.features = [];
    }

    const features = response.features || [];
    combinedJson.features.push(...features);

    console.log(
      `Fetched ${features.length} features (total: ${combinedJson.features.length})`
    );

    // Check if we got fewer features than requested - means we're done
    if (combinedJson.features.length > 2000 || features.length < pageSize) {
      hasMore = false;
    } else {
      offset += pageSize;
    }
  }

  console.log(
    `Pagination complete. Total features: ${combinedJson.features.length}`
  );

  // Return combined response in same format as non-paginated
  return combinedJson;
};

// /**
//  * Fetch an ESRI layer - with automatic pagination for large layers
//  * @param {Object} layerConfig - Layer configuration object
//  * @param {number} [page_size=1000] - Records per page if paginating
//  * @returns {Promise<Object>} ESRI JSON response
//  */
// const fetchEsriLayer = async (layerConfig) => {
//   return getEsriJsonPaginated({
//     service_name: layerConfig.service_name,
//     layer_id: layerConfig.layer_id,
//     query_params: layerConfig.query_params,
//   });
// };

/**
 * Get a Hasura graphql mutation that will delete
 * all rows in the table
 */
const getTruncateMutation = (objectName) => `
  mutation Delete${objectName} {
    delete_${objectName}(where: {}) {
      affected_rows
    }
  }
`;

const getUpsertMutation = (
  objectName,
  onConflictConstraintName,
  updateColumns
) => `
   mutation Upsert${objectName}($objects: [${objectName}_insert_input!]!) {
    insert_${objectName}(objects: $objects,  on_conflict: {
      constraint: ${onConflictConstraintName},
      update_columns: [${updateColumns.join(",")}]
    }
) {
      affected_rows
    }
  }
`;

/**
 * Get a generic Hasura graphql mutation that will insert
 * an array of objects
 */
const getInsertMutation = (objectName) => `
  mutation Insert${objectName}($objects: [geo_${objectName}_insert_input!]!) {
    insert_geo_${objectName}(objects: $objects) {
      affected_rows
    }
  }
`;

/**
 * Sends a request to the Hasura GraphQL API.
 *
 * @param {Object} params - The request parameters.
 * @param {string} params.query - The GraphQL query string.
 * @param {Object} [params.variables] - The variables for the GraphQL query.
 * @returns {Object} The JSON response from the Hasura API.
 */
const makeHasuraRequest = async ({ query, variables }) => {
  const body = JSON.stringify({
    query,
    variables,
  });
  const url = process.env.HASURA_GRAPHQL_ENDPOINT;
  const headers = {
    "X-Hasura-Admin-Secret": process.env.HASURA_GRAPHQL_ADMIN_SECRET,
    "content-type": "application/json",
  };
  return genericJSONFetch({ url, method: "POST", body, headers });
};

/**
 * The COA council layer has two district 10 features.
 * This helper combines their geometries into a single feature. Alternatively
 * we could restructure the VZ database to use this layer's official primary
 * key column, which is called `single_member_districts_id`
 * @param {Object} geojson - the geojson feature collection to be processed
 *
 * @returns {void} Updates the geojson
 */
const combineDistrictTenFeatures = (geojson) => {
  let combinedDistrictTenFeature;
  geojson.features
    .filter((feature) => feature.properties.council_district === 10)
    .forEach((feature) => {
      if (!combinedDistrictTenFeature) {
        combinedDistrictTenFeature = feature;
        return;
      }
      combinedDistrictTenFeature.geometry.coordinates[0].concat(
        feature.geometry.coordinates[0]
      );
    });
  geojson.features = geojson.features.filter(
    (feature) => feature.properties.council_district !== 10
  );
  geojson.features.push(combinedDistrictTenFeature);
};

/**
 * Convert a comma-separated value to an array type. Falsey values
 * coerce to null
 * @param {string} csvString - the comma-separated string to parse
 * @param {function} valueHandler - an optional function to handle each value
 * extracted from the csv string. Must accept and returns anything.
 */
const csvToArray = (csvString, valueHandler) => {
  if (!csvString || !csvString.trim()) {
    return null;
  }
  const parsedValues = csvString.trim().split(",");
  return parsedValues.map((val) =>
    valueHandler ? valueHandler(val.trim()) : val.trim()
  );
};

const locationPolygonsTransformer = (geojson) => {
  const csvFieldsToHandle = [
    { name: "area_eng_areas", valueHandler: String },
    { name: "council_districts", valueHandler: Number },
    { name: "signal_eng_areas", valueHandler: String },
    { name: "street_levels", valueHandler: Number },
    { name: "zip_codes", valueHandler: String },
  ];

  geojson.features.forEach((feature) => {
    csvFieldsToHandle.forEach((field) => {
      feature.properties[field.name] = csvToArray(
        feature.properties[field.name],
        field.valueHandler
      );
    });
  });
};

module.exports = {
  combineDistrictTenFeatures,
  ESRI_MAX_RECORD_COUNT,
  getEsriJson,
  getEsriLayerUrl,
  getEsriToken,
  getInsertMutation,
  getTruncateMutation,
  getUpsertMutation,
  handleFields,
  loadJSONFile,
  locationPolygonsTransformer,
  makeHasuraRequest,
  makeUniformMultiPoly,
  reduceGeomPrecision,
  saveJSONFile,
};
