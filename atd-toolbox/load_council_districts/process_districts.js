/**
 * Download COA council districts from ArcGIS REST endpoint
 */
const { arcgisToGeoJSON } = require("@terraformer/arcgis");
const fs = require("fs");

/**
 * Params of note
 * geometryPrecision=8: cap coordinates at 8 decimal places
 * outSR=4326: use WGS84 coordinates
 * f=json: return features as Esri json - although we could request geojson from the feature service, esri botches
 * the geojson by creating features where holes should be. we need to use a third-party tool to convert esri to
 * geojson
 */
DISTRICTS_URL =
  "https://services.arcgis.com/0L95CJ0VTaxqcmED/ArcGIS/rest/services/BOUNDARIES_single_member_districts/FeatureServer/0/query?where=1%3D1&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&relationParam=&returnGeodetic=false&outFields=*&returnGeometry=true&returnCentroid=false&featureEncoding=esriDefault&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=8&outSR=4326&defaultSR=&datumTransformation=&applyVCSProjection=false&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnQueryGeometry=false&returnDistinctValues=false&cacheHint=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=json&token=";

GEOJSON_FILENAME = "data/council_districts.geojson";

const saveJsonFile = (name, data) => {
  fs.writeFileSync(name, JSON.stringify(data));
};

const getDistrictsJson = async () => {
  const esriJson = await fetch(DISTRICTS_URL)
    .then((response) => response.json())
    .then((data) => {
      return data;
    })
    .catch((error) => {
      console.error(error);
    });
  return esriJson;
};

/**
 * PostGIS requires that our feature geographies are uniformly MultiPolygon
 */
const makeMultiPoly = (features) => {
  features.forEach((feature) => {
    if (feature.geometry.type === "Polygon") {
      feature.geometry.type = "MultiPolygon";
      feature.geometry.coordinates = [feature.geometry.coordinates];
      console.log(
        `Converted district ${feature.properties.COUNCIL_DISTRICT} to MuliPolygon`
      );
    }
  });
  return features;
};

/**
 * Strip out all feature properties except council_district
 */
const filterAndFormatProperties = (features) =>
  features.forEach((feature) => {
    feature.properties = {
      council_district: feature.properties.COUNCIL_DISTRICT,
    };
  });

const main = async () => {
  const esriJson = await getDistrictsJson();
  const districtGeojson = arcgisToGeoJSON(esriJson);
  const features = makeMultiPoly(districtGeojson.features);
  filterAndFormatProperties(features);

  const districtIds = features.map(
    (feature) => feature.properties.council_district
  );

  // Some tests to check we are processing the expected districts
  if (districtIds.length !== 10) {
    throw `Unexpected number of district features :/`;
  }

  if (
    districtIds.sort().join(",") !==
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].sort().join(",")
  ) {
    throw `Unexpected district IDs :/`;
  }

  saveJsonFile(GEOJSON_FILENAME, {
    type: "FeatureCollection",
    features: features,
  });
};

main();
