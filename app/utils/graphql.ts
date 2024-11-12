import { useState, useCallback, useEffect, useMemo } from "react";
import useSWR, { SWRConfiguration } from "swr";
import {
  gql,
  GraphQLClient,
  request,
  RequestDocument,
  Variables,
} from "graphql-request";
import { MutationVariables, LookupTableDef } from "@/types/types";
import { useAuth0 } from "@auth0/auth0-react";

const ENDPOINT = process.env.NEXT_PUBLIC_HASURA_ENDPOINT!;

const DEFAULT_SWR_OPTIONS: SWRConfiguration = {
  /**
   * Dont refetch when the page/tab is refocused
   */
  revalidateOnFocus: false,
  /**
   * Dont refetch on network recon
   */
  revalidateOnReconnect: false,
};

/**
 * Fetcher which interacts with our GraphQL API
 */
const fetcher = <T>([query, variables, token]: [
  RequestDocument,
  Variables,
  string
]): Promise<T> =>
  request({
    url: ENDPOINT,
    document: query,
    variables,
    requestHeaders: { Authorization: `Bearer ${token}` },
  });

/**
 * Hook which wraps `useSWR` and provides auth
 */
export const useQuery = <T>({
  query,
  variables,
  options,
}: {
  query: RequestDocument | null;
  variables?: Variables;
  options?: SWRConfiguration;
}) => {
  const { getAccessTokenSilently } = useAuth0();

  const fetchWithAuth = async ([query, variables]: [
    RequestDocument,
    Variables
  ]) => {
    const token = await getAccessTokenSilently();
    // todo: <T> passed here is assigned to query results without validation - we need to use a schema validator
    return fetcher<T>([query, variables, token]);
  };

  // todo: document falsey query handling
  const { data, error, isLoading, mutate, isValidating } = useSWR<T>(
    query ? [query, variables] : null,
    fetchWithAuth,
    { ...DEFAULT_SWR_OPTIONS, ...(options || {}) }
  );

  return {
    data,
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
  const { getAccessTokenSilently, user } = useAuth0();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

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
        const token = await getAccessTokenSilently();
        const client = new GraphQLClient(ENDPOINT, {
          headers: {
            Authorization: `Bearer ${token}`,
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
    [getAccessTokenSilently, mutation]
  );

  return { mutate, loading, error };
};

/**
 * Hook which constructs a graphql query string to fetch data from a lookup table
 */
export const useLookupQuery = (lookupTableDef: LookupTableDef | undefined) =>
  useMemo(() => {
    if (!lookupTableDef) {
      return [];
    }
    // construct the Hasura typename, which is prefixed with the schema name
    // if schema is not public
    const prefix =
      lookupTableDef.tableSchema === "public"
        ? ""
        : lookupTableDef.tableSchema + "_";

    const typeName = `${prefix}${lookupTableDef.tableName}`;

    return [
      gql`
        query LookupTableQuery {
          ${typeName}(order_by: {label: asc}) {
            id
            label
          }
        }
      `,
      typeName,
    ];
  }, [lookupTableDef]);

/**
 * Hook that persists queried data while new data is being fetched / revalidated.
 * this works as a complement to SWR by persisting data when fetch args
 * have changed
 **/
export const useDataCache = <T>(currentData: T | null) => {
  const [cachedData, setCachedData] = useState<T | null>(currentData);
  useEffect(() => {
    if (currentData) {
      setCachedData(currentData);
    }
  }, [currentData]);
  return cachedData;
};
