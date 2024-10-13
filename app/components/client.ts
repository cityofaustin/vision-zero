import useSWR, { SWRConfiguration } from "swr";
import { request, RequestDocument, Variables } from "graphql-request";
import { useAuth0 } from "@auth0/auth0-react";

const url = process.env.NEXT_PUBLIC_HASURA_ENDPOINT!;

const DEFAULT_OPTIONS: SWRConfiguration = {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
};

// SWR fetcher using graphql-request
const fetcher = <T>([query, variables, token]: [
  RequestDocument,
  Variables,
  string
]): Promise<T> =>
  request({
    url,
    document: query,
    variables,
    requestHeaders: { Authorization: `Bearer ${token}` },
  });

interface UseGraphQLProps<T> {
  query: RequestDocument;
  variables?: Variables;
}

export const useGraphQL = <T = any>({
  query,
  variables,
}: UseGraphQLProps<T>) => {
  // todo: we need to use an auth context
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();

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
    DEFAULT_OPTIONS
  );

  return {
    data,
    error,
    isLoading,
    isError: !!error,
  };
};
