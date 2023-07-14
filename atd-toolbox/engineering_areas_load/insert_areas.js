/**
 * Loads engineering areas geojson into Vision Zero Database
 */
const { HASURA_AUTH } = require("./secrets");
const fs = require("fs");

INSERT_AREAS_MUTATION = `
mutation InsertEngineeringAreas($payload: [engineering_areas_insert_input!]!) {
  insert_engineering_areas(objects: $payload) {
    returning {
      area_id
    }
  }
}`;

const loadAreasGeojson = () =>
  JSON.parse(fs.readFileSync("data/engineering_areas.geojson"));

const makeHasuraRequest = async ({ query, variables, env }) => {
  const body = JSON.stringify({
    query,
    variables,
  });
  const url = HASURA_AUTH.hasura_graphql_endpoint[env];

  const response = await fetch(url, {
    body,
    method: "POST",
    headers: {
      "X-Hasura-Admin-Secret": HASURA_AUTH.hasura_graphql_admin_secret[env],
      "content-type": "application/json",
    },
  });

  const responseData = await response.json();
  return responseData;
};

const getEnv = () => {
  const env = process.argv[2];
  if (!["local", "staging", "prod"].includes(env)) {
    throw "Unknown environment. Choose 'local', 'staging', 'prod'";
  }
  return env;
};

const getHasuraPayload = (features) =>
  features.map((feature) => ({
    area_id: feature.properties.area_id,
    label: feature.properties.engineering_area,
    geometry: feature.geometry,
  }));

const main = async (env) => {
  const areas = loadAreasGeojson();
  const payload = getHasuraPayload(areas.features);
  responseData = await makeHasuraRequest({
    query: INSERT_AREAS_MUTATION,
    variables: { payload },
    env,
  });
  console.log(responseData);
};

const env = getEnv();

main(env);
