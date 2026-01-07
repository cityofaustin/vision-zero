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
  const pkField = layerConfig.fields.find((field) => field.isPrimaryKey);

  if (!pkField) {
    throw new Error(`No primary key field found in layer settings :(`);
  }

  console.log("Getting AGOL token...");
  const { token } = await getEsriToken();
  layerConfig.query_params.token = token;

  console.log("Downloading layer...");
  const esriJson = await getEsriJson(layerConfig, pkField.inputName);

  /**
   * Although the ArcGIS REST API can return geojson directly, the resulting geometries
   * are malformed. For this reason, we use terraformer package, which is an Esri
   * product.
   *
   * The issue is discussed in the Esri community, here:
   * https://community.esri.com/t5/arcgis-online-questions/agol-export-to-geojson-holes-not-represented-as/td-p/1008140
   */
  console.log("Converting Esri JSON to geojson...");
  let geojson = arcgisToGeoJSON(esriJson);

  if (esriJson.geometryType.toLowerCase().includes("polygon")) {
    console.log("Handling multipolygons...");
    makeUniformMultiPoly(geojson.features);
  }

  console.log("Doing field and geometry transforms...");
  handleFields(geojson.features, layerConfig.fields);

  reduceGeomPrecision(geojson.features);

  if (layerConfig.customTransformer) {
    layerConfig.customTransformer(geojson);
  }

  if (save) {
    const name = `./data/${layerName}.geojson`;
    console.log(`Saving geojson to: ${name}`);
    saveJSONFile(name, geojson);
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

  /**
   * Gather a list of fields to use as updateFields, although this is only needed if
   * an upsert mutation is performed. We simply take the entire field array excluding
   * the primary key
   */
  const isUpsert = layerConfig.upsert;

  const updateFields = layerConfig.fields
    .filter((field) => !field.isPrimaryKey)
    .map((field) => field.outputName);

  // add geometry to updated fields
  updateFields.push("geometry");

  const mutation = isUpsert
    ? getUpsertMutation(
        objectName,
        layerConfig.onConflictConstraintName,
        updateFields
      )
    : getInsertMutation(objectName);
  const results = [];

  const chunkSize = 2000;

  const totalChunks = Math.ceil(objects.length / chunkSize);

  for (let i = 0; i < objects.length; i += chunkSize) {
    const currentChunk = objects.slice(i, i + chunkSize);
    console.log(
      `(${i / chunkSize + 1}/${totalChunks}) ${
        isUpsert ? "Upserting" : "Inserting"
      } ${currentChunk.length} features...`
    );

    result = await makeHasuraRequest({
      query: mutation,
      variables: { objects: currentChunk },
    });
    results.push(result);
  }
};

main(args).catch((err) => console.log(err));
