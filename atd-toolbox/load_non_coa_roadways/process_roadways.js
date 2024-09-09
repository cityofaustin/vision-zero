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
 */
ROADWAYS_URL =
  "https://services.arcgis.com/0L95CJ0VTaxqcmED/arcgis/rest/services/On_System_Polygon_Feature/FeatureServer/0/query?where=1%3D1&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&relationParam=&returnGeodetic=false&outFields=*&returnGeometry=true&returnCentroid=false&featureEncoding=esriDefault&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=8&outSR=4326&defaultSR=&datumTransformation=&applyVCSProjection=false&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnQueryGeometry=false&returnDistinctValues=false&cacheHint=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=json&token=mzFcMRqhxzPAoRJavp2MJuy0cy15OgDKmz0kGFg-RWuRSf4GPBUsUmcXjW-WhTKcSm7q-4wzFduKrswLEQJX_M0ZbqHfchmqGvnH7uQrK2qge2joHUA-RAeM0_SXFA3QL2BhrnQSj4o_Ks4PhoW7EKFnfkJXzGwaTfVzJBhpAcd_3eDEUX0QPwTVu_HJ4w6Z";
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
    console.log(feature, "this is the feature");
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

/**
 * strip out all feature properties except ATD_ENGINEER_AREAS
 */
const filterAndFormatProperties = (features) =>
  features.forEach((feature) => {
    feature.properties = {
      object_id: feature.properties.OBJECTID,
    };
  });

const main = async () => {
  const esriJson = await getRoadwaysJson();
  const areaGeojson = arcgisToGeoJSON(esriJson);
  const features = makeMultiPoly(areaGeojson.features);
  filterAndFormatProperties(features);

  saveJsonFile(GEOJSON_FILENAME, {
    type: "FeatureCollection",
    features: features,
  });
};

main();
