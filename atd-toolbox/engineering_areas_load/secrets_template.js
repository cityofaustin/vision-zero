const HASURA_AUTH = {
  hasura_graphql_endpoint: {
    local: "http://localhost:8080/v1/graphql",
  },
  hasura_graphql_admin_secret: {
    local: "hasurapassword",
  },
};

module.exports = {
  HASURA_AUTH,
};
