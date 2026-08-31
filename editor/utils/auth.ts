import { useCallback, useEffect } from "react";
import { useAuth0, User } from "@auth0/auth0-react";
import { usePathname, useRouter } from "next/navigation";

/**
 * The allowed role names we've defined in Hasura
 */
export type HasuraUserRoleName = "vz-admin" | "editor" | "readonly";

/**
 * Add our claims to the Auth0 ID token—these are
 * added via Auth0 action
 */
interface CustomUser extends User {
  "https://hasura.io/jwt/claims"?: {
    "x-hasura-allowed-roles"?: HasuraUserRoleName[];
  };
}

const EDITOR_ROLE: HasuraUserRoleName = "editor";
export const ADMIN_ROLE: HasuraUserRoleName = "vz-admin";

export const ADMIN_EDIT_ROLES: HasuraUserRoleName[] = [EDITOR_ROLE, ADMIN_ROLE];

/**
 * Get the allowed roles array from a user object
 * */
export const getRolesArray = (
  user: Partial<CustomUser>
): HasuraUserRoleName[] => {
  const role =
    user?.["https://hasura.io/jwt/claims"]?.["x-hasura-allowed-roles"];

  if (!role) {
    console.warn(
      "User has malformed/missing Hasura JWT claims. No allowed role found."
    );
    return ["readonly"];
  }
  return role;
};

/**
 * Get a user's hasura role name from their allowed roles
 */
export const getHasuraRoleName = (
  roles: HasuraUserRoleName[]
): HasuraUserRoleName => {
  return roles[0];
};

/**
 * Check if a user has any of the provided role names
 * @param roles - a role string or an array of roles to check for
 * @param user - the user object
 * @returns True if the user has any of the provided roles
 */
export const hasRole = (
  roles: HasuraUserRoleName[] | HasuraUserRoleName,
  user?: CustomUser
): boolean => {
  if (!user) return false;
  const userRole = getHasuraRoleName(getRolesArray(user));

  if (typeof roles === "string") {
    return userRole === roles;
  } else {
    return roles.includes(userRole);
  }
};

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
  const pathname = usePathname();
  const { isAuthenticated, getAccessTokenSilently, loginWithRedirect } =
    useAuth0();
  return useCallback(async (): Promise<string | undefined> => {
    if (!isAuthenticated) {
      return;
    }
    try {
      const accessToken = await getAccessTokenSilently();
      return accessToken;
    } catch (err) {
      console.warn(
        "Redirecting to login page due to error getting access token:",
        err
      );
      loginWithRedirect({
        appState: { returnTo: pathname },
      });
    }
    // we can ignore getAccessTokenSilently and loginWithRedirect in our dep array -
    // Auth0 didn't bother to memoize it for us and `isAuthenticated`
    // has us covered.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, pathname]);
};

/**
 * Hook that redirects the user away from a page if they don't have one of
 * the allowed roles.
 *
 * @example
 * const allowedEmsRoles = ["editor", "vz-admin"];
 * const isAuthorized = useRequiredPageRole(allowedEmsRoles);
 * if (!isAuthorized) return null;
 */
export const useRequiredPageRole = (
  allowedRoles: HasuraUserRoleName[],
  redirectTo: string = "/unauthorized"
): boolean => {
  const { user } = useAuth0();
  const router = useRouter();
  const isAuthorized = hasRole(allowedRoles, user);

  useEffect(() => {
    if (user && !isAuthorized) {
      router.replace(redirectTo);
    }
  }, [user, isAuthorized, redirectTo, router]);

  return isAuthorized;
};
