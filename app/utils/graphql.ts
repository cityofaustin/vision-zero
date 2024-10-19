import { useState, useCallback } from "react";
import useSWR, { SWRConfiguration } from "swr";
import {
  GraphQLClient,
  request,
  RequestDocument,
  Variables,
} from "graphql-request";
import { MutationVariables } from "@/types/types";
import { useAuth0 } from "@auth0/auth0-react";

const ENDPOINT = process.env.NEXT_PUBLIC_HASURA_ENDPOINT!;

const DEFAULT_SWR_OPTIONS: SWRConfiguration = {
  revalidateOnFocus: false,
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
}: {
  query: RequestDocument;
  variables?: Variables;
}) => {
  // todo: we need to use an auth context?
  const { getAccessTokenSilently } = useAuth0();

  const fetchWithAuth = async ([query, variables]: [
    RequestDocument,
    Variables
  ]) => {
    // todo: what if token not returned?
    const token = await getAccessTokenSilently();
    return fetcher<T>([query, variables, token]);
  };

  const { data, error, isLoading, mutate, isValidating } = useSWR<T>(
    [query, variables],
    fetchWithAuth,
    DEFAULT_SWR_OPTIONS
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
