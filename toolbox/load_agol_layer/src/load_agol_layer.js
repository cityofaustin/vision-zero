const { program, Option } = require("commander");
const { arcgisToGeoJSON } = require("@terraformer/arcgis");
const {
  getEsriJson,
  getEsriLayerUrl,
  getEsriToken,
  getInsertMutation,
  getTruncateMutation,
  handleFields,
  makeHasuraRequest,
  makeUniformMultiPoly,
  reduceGeomPrecision,
  saveJSONFile,
} = require("./utils");
const { LAYERS } = require("./settings");

/**
 * CLI
 */
program.addOption(
  new Option("-l, --layer <name>", "layer name")
    .choices(Object.keys(LAYERS))
    .makeOptionMandatory()
);
program.addOption(
  new Option(
    "-s, --save",
    "save a copy of the geojson output to './data/<layer-name>.geojson'"
  )
);
program.parse();
const args = program.opts();

/**
 * Main function to load an AGOL layer into the DB
 */
const main = async ({ layer: layerName, save }) => {
  console.log(`Processing ${layerName}`);
  const layerConfig = LAYERS[layerName];

  console.log("Getting AGOL token...");
  const { token } = await getEsriToken();
  layerConfig.query_params.token = token;

  console.log("Downloading layer...");
  const layerUrl = getEsriLayerUrl(layerConfig);
  const esriJson = await getEsriJson(layerUrl);

  /**
   * Although the ArcGIS REST API can return geojson directly, the resulting geometries
   * are malformed. For this reason, we use terraformer package, which is an Esri
   * product.
   *
   * The issue is discussed in the Esri community, here:
   * https://community.esri.com/t5/arcgis-online-questions/agol-export-to-geojson-holes-not-represented-as/td-p/1008140
   */
  let geojson = arcgisToGeoJSON(esriJson);

  if (esriJson.geometryType.toLowerCase().includes("polygon")) {
    makeUniformMultiPoly(geojson.features);
  }

  handleFields(geojson.features, layerConfig.fields);

  reduceGeomPrecision(geojson.features);

  if (layerConfig.transformer) {
    layerConfig.transformer(geojson);
  }

  if (save) {
    saveJSONFile(`./data/${layerName}.geojson`, geojson);
  }

  objects = geojson.features.map(({ properties, geometry }) => ({
    ...properties,
    geometry,
  }));

  console.log(`Truncating ${layerConfig.tableName} table...`);
  const truncateMutation = getTruncateMutation(layerConfig.tableName);
  await makeHasuraRequest({ query: truncateMutation });

  console.log("Inserting new features...");
  const insertMutation = getInsertMutation(layerConfig.tableName);
  const result = await makeHasuraRequest({
    query: insertMutation,
    variables: { objects },
  });
  console.log(result);
};

main(args);
