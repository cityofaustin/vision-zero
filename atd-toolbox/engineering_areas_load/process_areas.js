/**
 * Download COA engineering service areas from ArcGIS REST endpoint
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
ENG_AREAS_URL =
  "https://services.arcgis.com/0L95CJ0VTaxqcmED/ArcGIS/rest/services/TRANSPORTATION_engineering_service_areas/FeatureServer/0/query?where=1%3D1&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&relationParam=&returnGeodetic=false&outFields=*&returnGeometry=true&returnCentroid=false&featureEncoding=esriDefault&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=8&outSR=4326&defaultSR=&datumTransformation=&applyVCSProjection=false&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnQueryGeometry=false&returnDistinctValues=false&cacheHint=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=json&token=";
GEOJSON_FILENAME = "data/engineering_areas.geojson";

const saveJsonFile = (name, data) => {
  fs.writeFileSync(name, JSON.stringify(data));
};

const getAreasJson = async () => {
  const esriJson = await fetch(ENG_AREAS_URL)
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
        `Converted engineering area ${feature.properties.ATD_ENGINEER_AREAS} to MultiPolygon`
      );
    }
  });
  return features;
};

/**
 * strip out all feature properties except ATD_ENGINEER_AREAS
 */
const filterAndFormatProperties = (features) =>
  features.forEach((feature) => {
    feature.properties = {
      engineering_area: feature.properties.ATD_ENGINEER_AREAS,
      area_id: feature.properties.ENGINEERING_AREA_ID,
    };
  });

const main = async () => {
  const esriJson = await getAreasJson();
  const areaGeojson = arcgisToGeoJSON(esriJson);
  const features = makeMultiPoly(areaGeojson.features);
  filterAndFormatProperties(features);

  const engineeringAreas = features.map(
    (feature) => feature.properties.engineering_area
  );

  // Check that we are getting the right data
  if (
    engineeringAreas.sort().join(",") !==
    ["CENTRAL", "NORTH", "SOUTH"].sort().join(",")
  ) {
    throw `Unexpected engineering areas :/`;
  }

  saveJsonFile(GEOJSON_FILENAME, {
    type: "FeatureCollection",
    features: features,
  });
};

main();
