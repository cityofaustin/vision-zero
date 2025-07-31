import { useState, useCallback, useMemo } from "react";
import useSWR, { SWRConfiguration } from "swr";
import {
  gql,
  GraphQLClient,
  request,
  RequestDocument,
  Variables,
} from "graphql-request";
import { getRolesArray, getHasuraRoleName, useGetToken } from "./auth";
import { MutationVariables } from "@/types/types";
import { HasuraAggregateData, HasuraGraphQLResponse } from "@/types/graphql";
import { Relationship } from "@/types/relationships";
import { useAuth0 } from "@auth0/auth0-react";

const ENDPOINT = process.env.NEXT_PUBLIC_HASURA_ENDPOINT!;

const DEFAULT_SWR_OPTIONS: SWRConfiguration = {
  /**
   * Don't refetch when the page/tab is refocused
   */
  revalidateOnFocus: false,
  /**
   * Don't refetch on network recon
   */
  revalidateOnReconnect: false,
  /**
   * keep the previous data while refetching
   */
  keepPreviousData: true,
};

/**
 * Fetcher which interacts with our GraphQL API
 */
const fetcher = <T>([query, variables, token, hasuraRoleName]: [
  RequestDocument,
  Variables,
  string,
  string,
]): Promise<T> =>
  request<T>({
    url: ENDPOINT,
    document: query,
    variables,
    requestHeaders: {
      Authorization: `Bearer ${token}`,
      "x-hasura-role": hasuraRoleName,
    },
  });

interface UseQueryProps {
  /**
   * The graphql query
   */
  query: RequestDocument | null;
  /**
   * Query variables
   */
  variables?: Variables;
  /**
   * SWR configuration options
   */
  options?: SWRConfiguration;
  /** The typename of the query root that will be used to access the
   * rows returned by the query
   */
  typename: string;
  /**
   * If the query includes aggregate fields. If true, the aggregates will
   * be accessed using the provided typename and will made available in the
   * `aggregateData` return value.
   *
   * See: https://hasura.io/docs/2.0/queries/postgres/aggregation-queries/
   */
  hasAggregates?: boolean;
}

interface UseQueryResponse<T> {
  data?: T[];
  aggregateData: HasuraAggregateData | undefined;
  error: unknown;
  isLoading: boolean;
  isError: boolean;
  refetch: () => Promise<unknown>;
  isValidating: boolean;
}

/**
 * Hook which wraps `useSWR` and provides auth
 *
 * This hook is limited to querying just one type per query as
 * will be defined by the typename
 */
export const useQuery = <T extends Record<string, unknown>>({
  query,
  variables,
  options,
  typename,
  hasAggregates,
}: UseQueryProps): UseQueryResponse<T> => {
  const { user } = useAuth0();
  const getToken = useGetToken();

  const fetchWithAuth = async ([query, variables]: [
    RequestDocument,
    Variables,
  ]): Promise<HasuraGraphQLResponse<T, typeof typename>> => {
    const hasuraRoleName = getHasuraRoleName(getRolesArray(user));
    const token = await getToken();
    return fetcher([query, variables, token || "", hasuraRoleName]);
  };

  const { data, error, isLoading, mutate, isValidating } = useSWR<
    HasuraGraphQLResponse<T, typeof typename>
  >(query ? [query, variables] : null, fetchWithAuth, {
    ...DEFAULT_SWR_OPTIONS,
    ...(options || {}),
  });

  return {
    data: data ? data[typename] : data,
    aggregateData:
      hasAggregates && data ? data[`${typename}_aggregate`] : undefined,
    error,
    isLoading,
    isError: !!error,
    refetch: mutate,
    isValidating,
  };
};

interface MutationOptions {
  skip_updated_by_setter?: boolean;
}
/**
 * Custom mutation hook that provides auth and manages `updated_by` column
 */
export const useMutation = (mutation: RequestDocument) => {
  const { user } = useAuth0();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const getToken = useGetToken();

  const mutate = useCallback(
    async <T>(variables?: MutationVariables, options?: MutationOptions) => {
      setLoading(true);
      setError(null);

      // set `updated_by` audit field
      if (
        variables &&
        user &&
        !options?.skip_updated_by_setter &&
        variables.updates
      ) {
        variables.updates.updated_by = user.email;
      }
      try {
        const hasuraRole = getHasuraRoleName(getRolesArray(user));
        const token = await getToken();
        const client = new GraphQLClient(ENDPOINT, {
          headers: {
            Authorization: `Bearer ${token}`,
            "x-hasura-role": hasuraRole,
          },
        });
        const data = await client.request<T>(mutation, variables);
        return data;
      } catch (err) {
        console.error("GraphQL Mutation Error:", err);
        setError(err as Error);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [mutation, user, getToken]
  );

  return { mutate, loading, error };
};

/**
 * Hook which constructs a graphql query string to fetch data from a lookup table.
 *
 * The query returned by this hook uses field name aliasing to ensure so that it
 * always returns an array of objects with an `id` and `label` property, which
 * makes the results of this query compatible with our lookup value editing
 * component.
 */
export const useLookupQuery = <T extends Record<string, unknown>>(
  relationship?: Relationship<T>
) =>
  useMemo(() => {
    if (!relationship) {
      return [];
    }
    // construct the Hasura typename, which is prefixed with the schema name
    // if schema is not public
    const prefix =
      relationship.tableSchema === "public"
        ? ""
        : relationship.tableSchema + "_";

    const typename = `${prefix}${relationship.tableName}`;

    return [
      gql`
        query LookupTableQuery {
          ${typename}(order_by: {${relationship.labelColumnName}: asc}) {
            id: ${relationship.idColumnName}
            label: ${relationship.labelColumnName}
          }
        }
      `,
      typename,
    ];
  }, [relationship]);
