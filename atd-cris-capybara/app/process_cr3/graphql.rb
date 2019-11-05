require 'json'
require 'net/http'
require 'uri'

def graphql_query(gqlQuery)
  uri = URI.parse(HASURA_ENDPOINT)

  header = {
      "content-type": "application/json",
      "x-hasura-admin-secret": HASURA_ADMIN_KEY
  }

  graphql_query_envelope = { query: gqlQuery }

  # Create the HTTP objects
  https = Net::HTTP.new(uri.host, uri.port)
  https.use_ssl = true
  request = Net::HTTP::Post.new(uri.request_uri, header)
  request.body = graphql_query_envelope.to_json

  # Send the request
  return https.request(request)
end