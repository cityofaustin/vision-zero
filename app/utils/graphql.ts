import useSWR, { SWRConfiguration } from "swr";
import { request, RequestDocument, Variables } from "graphql-request";
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
export const useGraphQL = <T>({
  query,
  variables,
}: {
  query: RequestDocument;
  variables?: Variables;
}) => {
  // todo: we need to use an auth context
  const { getAccessTokenSilently } = useAuth0();

  const fetchWithAuth = async ([query, variables]: [
    RequestDocument,
    Variables
  ]) => {
    // todo: what if token not returned?
    const token = await getAccessTokenSilently();
    return fetcher<T>([query, variables, token]);
  };

  const { data, error, isLoading } = useSWR<T>(
    [query, variables],
    fetchWithAuth,
    DEFAULT_SWR_OPTIONS
  );

  return {
    data,
    error,
    isLoading,
    isError: !!error,
  };
};
