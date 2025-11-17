/**
 * TODO!
 * add in all update columns correct
 * delete with deletes
 * deal with audit fields, which need cleanup in db
 * 
 * 
 */

const { program, Option } = require("commander");
const { arcgisToGeoJSON } = require("@terraformer/arcgis");
const {
  getEsriJson,
  getEsriToken,
  getInsertMutation,
  getTruncateMutation,
  getUpsertMutation,
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
  const esriJson = await getEsriJson(layerConfig);

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

  /**
   * Determine the hasura object name in the api schema
   */
  const objectName =
    layerConfig.tableSchema === "public"
      ? layerConfig.tableName
      : layerConfig.tableSchema + "_" + layerConfig.tableName;

  if (!layerConfig.upsert) {
    console.log(`Truncating ${objectName}...`);
    const truncateMutation = getTruncateMutation(objectName);
    await makeHasuraRequest({ query: truncateMutation });
  }

  console.log("Inserting new features...");

  const mutation = layerConfig.upsert
    ? getUpsertMutation(objectName, layerConfig.onConflictConstraintName, [
        "location_name",
      ])
    : getInsertMutation(objectName);
  const results = [];

  const chunkSize = 2000;

  for (let i = 0; i < objects.length; i += chunkSize) {
    // `  Inserting chunk ${i + 1}/${chunks.length} (${chunk.length} objects)...`;
    console.log("CHUNK", i);
    result = await makeHasuraRequest({
      query: mutation,
      variables: { objects: objects.slice(i, i + chunkSize) },
    });
    results.push(result);
  }
};

main(args).catch((err) => console.log(err));
