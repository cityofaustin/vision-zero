const { error } = require("console");
const fs = require("fs");

const AGOL_USERNAME = process.env.AGOL_USERNAME;
const AGOL_PASSWORD = process.env.AGOL_PASSWORD;
const AGOL_ORG_BASE_URL = "https://austin.maps.arcgis.com";

const COORDINATE_DECIMAL_PLACES = 6;
const coordPrecisionMultiplier = Math.pow(10, COORDINATE_DECIMAL_PLACES);

const getEsriLayerUrl = ({ service_name, layer_id, query_params }) => {
  const queryString = new URLSearchParams(query_params).toString();
  return `https://services.arcgis.com/0L95CJ0VTaxqcmED/arcgis/rest/services/${service_name}/FeatureServer/${layer_id}/query?${queryString}`;
};

const saveJsonFile = (name, data) => {
  fs.writeFileSync(name, JSON.stringify(data));
};

const getEsriJson = async (layerUrl) => {
  try {
    const response = await fetch(layerUrl);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error: ${response.status} - ${errorText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch Esri JSON:", error);
    throw error;
  }
};

/**
 * PostGIS requires that our feature geographies are uniformly MultiPolygon
 */
const makeUniformMultiPoly = (features) => {
  features.forEach((feature) => {
    if (feature.geometry.type === "Polygon") {
      feature.geometry.type = "MultiPolygon";
      feature.geometry.coordinates = [feature.geometry.coordinates];
      console.log(
        `Converted non coa roadway ${feature.properties.OBJECTID} to MultiPolygon`
      );
    }
  });
};

async function getEsriToken() {
  const url = `${AGOL_ORG_BASE_URL}/sharing/rest/generateToken`;
  const data = {
    username: AGOL_USERNAME,
    password: AGOL_PASSWORD,
    referer: "http://www.arcgis.com",
    f: "pjson",
  };

  const body = new URLSearchParams(data);
  try {
    const response = await fetch(url, {
      method: "POST",
      body,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error: ${response.status} - ${errorText}`);
    }
    return await response.json();
  } catch (error) {
    throw new Error(
      `Unable to get token: ${
        error.response ? error.response.data : error.message
      }`
    );
  }
}

const handleFields = (features, fields) => {
  features.forEach((f) => {
    f.properties = fields.reduce((newProperties, field) => {
      newProperties[field.toLowerCase()] = f.properties[field];
      return newProperties;
    }, {});
  });
};

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

const reduceGeomPrecision = (features) => {
  features.forEach(({ geometry }) => {
    recursiveCoordinateHandler(geometry.coordinates);
  });
};

const makeHasuraRequest = async ({ query, variables }) => {
  const body = JSON.stringify({
    query,
    variables,
  });

  const url = process.env.HASURA_GRAPHQL_ENDPOINT;
  try {
    const response = await fetch(url, {
      body,
      method: "POST",
      headers: {
        "X-Hasura-Admin-Secret": process.env.HASURA_GRAPHQL_ADMIN_SECRET,
        "content-type": "application/json",
      },
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error: ${response.status} - ${errorText}`);
    }
    const responseData = await response.json();

    if (responseData?.errors) {
      throw JSON.stringify(responseData.errors);
    }
    return responseData;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getEsriLayerUrl,
  getEsriToken,
  saveJsonFile,
  getEsriJson,
  makeUniformMultiPoly,
  handleFields,
  makeHasuraRequest,
  reduceGeomPrecision,
};
