import { useCallback } from "react";
import { useAuth0, User } from "@auth0/auth0-react";

/**
 * Add our claims to the Auth0 ID token—these are
 * added via Auth0 action
 */
interface CustomUser extends User {
  "https://hasura.io/jwt/claims"?: {
    "x-hasura-allowed-roles"?: string[];
  };
}

/**
 * Get the allowed roles array from a user object
 * */
export const getRolesArray = (user: CustomUser | undefined) =>
  user?.["https://hasura.io/jwt/claims"]?.["x-hasura-allowed-roles"];

/**
 * Get a user's hasura role name from their allowed roles
 */
export const getHasuraRoleName = (roles?: string[]): string => {
  if (!roles) {
    // this would be the result of a malformed/corrupted user account -
    // check this user's raw JSON in the Auth0 user database
    return "";
  } else {
    return roles[0] || "";
  }
};

/**
 * Check if a user has any of the provided role names
 * @param roles - an array of roles to check for
 * @param user - the user object
 * @returns True if the user has any of the provided roles
 */
export const hasRole = (roles: string[], user: CustomUser) =>
  roles.includes(getHasuraRoleName(getRolesArray(user)));

/**
 * Make the hasura role name human-friendly
 */
export const formatRoleName = (role: string): string => {
  switch (role) {
    case "readonly":
      return "Read-only";
    case "editor":
      return "Editor";
    case "vz-admin":
      return "Admin";
    default:
      return role;
  }
};

/**
 * Hook that returns a memoized function to get the Auth0 access token.
 * Returns undefined if user is not authenticated or if token retrieval fails.
 *
 * @example
 * const getToken = useGetToken();
 * const fetchWithToken = async () => {
 *  const token = await getToken();
 *  if (token) {
 *     fetch('/api/data', { headers: { Authorization: `Bearer ${token}` } });
 *   }
 * };
 */
export const useGetToken = (): (() => Promise<string | undefined>) => {
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();
  return useCallback(async (): Promise<string | undefined> => {
    if (!isAuthenticated) {
      return;
    }
    try {
      const accessToken = await getAccessTokenSilently();
      return accessToken;
    } catch (err) {
      console.error("Error getting access token:", err);
    }
    // we can ignore getAccessTokenSilently in our dep array - 
    // Auth0 didn't bother to memoize it for us and `isAuthenticated`
    // has us covered.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);
};
