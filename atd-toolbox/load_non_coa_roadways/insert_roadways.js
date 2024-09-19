/**
 * Loads non coa roadways geojson into Vision Zero
 */
const { HASURA_AUTH } = require("./secrets");
const fs = require("fs");

INSERT_ROADWAYS_MUTATION = `
mutation InsertNonCoaRoadways($payload: [non_coa_roadways_insert_input!]!) {
  insert_non_coa_roadways(objects: $payload) {
    returning {
      id
    }
  }
}`;

const loadRoadwaysGeojson = () =>
  JSON.parse(fs.readFileSync("data/non_coa_roadways.geojson"));

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
    geometry: feature.geometry,
  }));

const main = async (env) => {
  const roadways = loadRoadwaysGeojson();
  const payload = getHasuraPayload(roadways.features);
  responseData = await makeHasuraRequest({
    query: INSERT_ROADWAYS_MUTATION,
    variables: { payload },
    env,
  });
  console.log(responseData);
};

const env = getEnv();

main(env);
