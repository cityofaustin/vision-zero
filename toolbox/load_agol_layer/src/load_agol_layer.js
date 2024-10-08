const { program, Option } = require("commander");
const { arcgisToGeoJSON } = require("@terraformer/arcgis");
// const mapshaper = require("mapshaper");
const {
  getEsriJson,
  getEsriLayerUrl,
  getEsriToken,
  handleFields,
  loadJSONFile,
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
 * Main function to upsert an AGOL layer into the DB
 */
const main = async ({ layer: layerName, save }) => {
  console.log(`Processing ${layerName}`);
  const layerConfig = LAYERS[layerName];
  const { token } = await getEsriToken();
  layerConfig.query_params.token = token;
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

  if (layerConfig.shouldTruncateFirst) {
    await makeHasuraRequest({ query: layerConfig.truncateMutation });
  }
  
  if (save) {
    saveJSONFile(`./data/${layerName}.geojson`, geojson);

    // await mapshaper.runCommands([
    //   `./data/${layerName}.geojson`,
    //   "-simplify",
    //   "dp",
    //   "20%",
    //   "-o",
    //   "precision=0.00001",
    //   `./data/${layerName}_simp.geojson`,
    // ]);
    // geojson = loadJSONFile(`./data/${layerName}_simp.geojson`);
    // makeUniformMultiPoly(geojson.features);
  }

  let objects = geojson.features.map(({ properties, geometry }) => ({
    ...properties,
    geometry,
  }));

  //   console.dir(objects, { depth: null });

  const result = await makeHasuraRequest({
    query: layerConfig.upsertMutation,
    variables: { objects },
  });
  console.log(result);
};

main(args);
