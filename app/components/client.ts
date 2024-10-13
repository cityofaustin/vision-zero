import useSWR, { Fetcher, SWRConfiguration } from "swr";
import { request, RequestDocument, Variables } from "graphql-request";
import { useAuth0 } from "@auth0/auth0-react";

const url = process.env.NEXT_PUBLIC_HASURA_ENDPOINT!;

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
  options?: SWRConfiguration;
}

export const useGraphQL = <T = any>({
  query,
  variables,
  options = {},
}: UseGraphQLProps<T>) => {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();

  const fetchWithAuth = async ([query, variables]: [
    RequestDocument,
    Variables
  ]) => {
    if (!isAuthenticated) throw new Error("User not authenticated");
    const token = await getAccessTokenSilently();
    return fetcher<T>([query, variables, token]);
  };

  const { data, error, isLoading } = useSWR<T>(
    [query, variables],
    fetchWithAuth,
    options
  );

  return {
    data,
    error,
    isLoading,
    isError: !!error,
  };
};
