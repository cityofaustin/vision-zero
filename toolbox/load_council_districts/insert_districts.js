/**
 * Loads council districts geojson into Vision Zero
 */
const { HASURA_AUTH } = require("./secrets");
const fs = require("fs");

INSERT_DISTRICTS_MUTATION = `
mutation InsertCouncilDistricts($payload: [council_districts_insert_input!]!) {
  insert_council_districts(objects: $payload) {
    returning {
      id
    }
  }
}`;

const loadDistrictsGeojson = () =>
  JSON.parse(fs.readFileSync("data/council_districts.geojson"));

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
    council_district: feature.properties.council_district,
    geometry: feature.geometry,
  }));

const main = async (env) => {
  const districts = loadDistrictsGeojson();
  const payload = getHasuraPayload(districts.features);
  responseData = await makeHasuraRequest({
    query: INSERT_DISTRICTS_MUTATION,
    variables: { payload },
    env,
  });
  console.log(responseData);
};

const env = getEnv();

main(env);
