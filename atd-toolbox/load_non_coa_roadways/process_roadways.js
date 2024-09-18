/**
 * Download non-COA roadways from ArcGIS REST endpoint
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
 * ROADWAYS_URL: will need to generate a new AGOL token and replace the one that is hardcoded in this URL. Instructions
 * in the README
 */
ROADWAYS_URL =
  "https://services.arcgis.com/0L95CJ0VTaxqcmED/arcgis/rest/services/On_System_Polygon_Feature/FeatureServer/0/query?where=1%3D1&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&relationParam=&returnGeodetic=false&outFields=*&returnGeometry=true&returnCentroid=false&featureEncoding=esriDefault&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=8&outSR=4326&defaultSR=&datumTransformation=&applyVCSProjection=false&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnQueryGeometry=false&returnDistinctValues=false&cacheHint=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=json&token=mzFcMRqhxzPAoRJavp2MJuy0cy15OgDKmz0kGFg-RWuRSf4GPBUsUmcXjW-WhTKcSm7q-4wzFduKrswLEQJX_FSxWH_mZgctl5pmsTBsTO5YMVEd4xN8r74zRsfZHHaJrA1wSQqkw5f-bf57sp1cM8CCtugOEK_s1XmwJ5wog062eHM49TkBWgQDkNa07kVE";
GEOJSON_FILENAME = "data/non_coa_roadways.geojson";

const saveJsonFile = (name, data) => {
  fs.writeFileSync(name, JSON.stringify(data));
};

const getRoadwaysJson = async () => {
  const esriJson = await fetch(ROADWAYS_URL)
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
        `Converted non coa roadway ${feature.properties.OBJECTID} to MultiPolygon`
      );
    }
  });
  return features;
};

const main = async () => {
  const esriJson = await getRoadwaysJson();
  const areaGeojson = arcgisToGeoJSON(esriJson);
  const features = makeMultiPoly(areaGeojson.features);

  saveJsonFile(GEOJSON_FILENAME, {
    type: "FeatureCollection",
    features: features,
  });
};

main();
