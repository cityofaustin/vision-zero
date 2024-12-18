import { useState, useCallback, useEffect, useMemo } from "react";
import useSWR, { SWRConfiguration, KeyedMutator } from "swr";
import {
  gql,
  GraphQLClient,
  request,
  RequestDocument,
  Variables,
} from "graphql-request";
import { getRolesArray, getHasuraRoleName, useToken } from "./auth";
import { MutationVariables } from "@/types/types";
import { LookupTableDef } from "@/types/lookupTables";
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
  string
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

interface UseQueryResponse<T> {
  data?: T[];
  error: any;
  isLoading: boolean;
  isError: boolean;
  refetch: () => Promise<any>;
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
}: {
  query: RequestDocument | null;
  variables?: Variables;
  options?: SWRConfiguration;
  typename: string;
}): UseQueryResponse<T> => {
  const { user } = useAuth0();
  const token = useToken();

  const fetchWithAuth = async ([query, variables]: [
    RequestDocument,
    Variables
  ]): Promise<{ [K in typeof typename]: T[] }> => {
    const hasuraRoleName = getHasuraRoleName(getRolesArray(user));
    return fetcher([query, variables, token, hasuraRoleName]);
  };

  // todo: document falsey query handling
  const { data, error, isLoading, mutate, isValidating } = useSWR<{
    [K in typeof typename]: T[];
  }>(token && query ? [query, variables] : null, fetchWithAuth, {
    ...DEFAULT_SWR_OPTIONS,
    ...(options || {}),
  });

  return {
    data: data ? data[typename] : data,
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
  const token = useToken();
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
        const hasuraRole = getHasuraRoleName(getRolesArray(user));
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
    [token, mutation, user]
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

    const typename = `${prefix}${lookupTableDef.tableName}`;

    return [
      gql`
        query LookupTableQuery {
          ${typename}(order_by: {label: asc}) {
            id
            label
          }
        }
      `,
      typename,
    ];
  }, [lookupTableDef]);
