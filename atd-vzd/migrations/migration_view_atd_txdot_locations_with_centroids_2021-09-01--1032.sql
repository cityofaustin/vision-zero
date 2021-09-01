-- creating a view that we can track so that we have a table with a centroid column
-- that we can track. This will allow us to query the ST_CENTROID() of the shape column
-- in atd_txdot_locations via hasura. They do not expose ST_Centroid() in the GraphQL API.

CREATE OR REPLACE VIEW public.atd_txdot_locations_with_centroids AS (
  SELECT *, ST_Centroid(shape) AS centroid FROM atd_txdot_locations
  );
