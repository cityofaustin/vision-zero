const fs = require("fs");

const AGOL_USERNAME = process.env.AGOL_USERNAME;
const AGOL_PASSWORD = process.env.AGOL_PASSWORD;
const AGOL_ORG_BASE_URL = "https://austin.maps.arcgis.com";

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

module.exports = {
  getEsriLayerUrl,
  getEsriToken,
  saveJsonFile,
  getEsriJson,
  makeUniformMultiPoly,
  handleFields,
};
