/**
 * Hasura aggregate data object
 *
 * This is loosely typed and does not exhaustively cover all supported aggregation fields
 * See: https://hasura.io/docs/2.0/api-reference/graphql-api/query/#aggregateobject
 */
export interface HasuraAggregateData {
  aggregate: {
    count?: number;
    sum: Record<string, number>;
    avg: Record<string, number>;
    max: Record<string, number>;
    min: Record<string, number>;
  };
}

/**
 * Hasura graphql response object for querying a single table
 * and optionally including aggregates.
 *
 * `T` is the type of object being returned
 * `TTypeName` is the literal name of the query root
 */
export type HasuraGraphQLResponse<T, TTypeName extends string> = {
  [K in TTypeName]: T[];
} & {
  [K in `${TTypeName}_aggregate`]?: HasuraAggregateData;
};
