const fs = require("fs");
const { program, Option } = require("commander");
const { arcgisToGeoJSON } = require("@terraformer/arcgis");
const {
  getEsriToken,
  getEsriLayerUrl,
  getEsriJson,
  handleFields,
  makeUniformMultiPoly,
} = require("./utils");
const { LAYERS } = require("./settings");
// construct CLI
program.addOption(
  new Option("-l, --layer <name>", "layer name")
    .choices(Object.keys(LAYERS))
    .makeOptionMandatory()
);
program.parse();
const args = program.opts();

const main = async ({ layer: layerName }) => {
  console.log(`Processing ${layerName}`);
  const layerConfig = LAYERS[layerName];
  const { token } = await getEsriToken();
  layerConfig.query_params.token = token;
  const layerUrl = getEsriLayerUrl(layerConfig);
  const esriJson = await getEsriJson(layerUrl);
  let geojson = arcgisToGeoJSON(esriJson);

  if (esriJson.geometryType.toLowerCase().includes("polygon")) {
    makeUniformMultiPoly(geojson.features);
  }
  handleFields(geojson.features, layerConfig.fields);
  console.log(geojson.features);

  //   saveJsonFile(GEOJSON_FILENAME, {
  //     type: "FeatureCollection",
  //     features: features,
  //   });
};

main(args);
