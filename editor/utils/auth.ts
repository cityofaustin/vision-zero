import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuth0, User } from "@auth0/auth0-react";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

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
    return "";
  } else if (roles.includes("vz-admin")) {
    // todo
    // If user has more than one role, it is because they have `itSupervisor` and `vz-admin`
    // `vz-admin` is the Hasura role name, `itSupervisor` is a legacy role that was previously
    // used to enable a user to create and edit other admins. this app will do away with
    // that behavior: any admin can create and modify other admins. A follow-up task is
    // to clean up the Auth0 user database that references `itSupervisor`
    return "vz-admin";
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
    case "itSupervisor":
      return "IT Supervisor";
    default:
      return role;
  }
};

/**
 * Hook which retrieves the user's access token and redirects to the
 * login page if the user's refresh token has expired
 */
export const useToken = (): string | null => {
  const pathName = usePathname();
  const { getAccessTokenSilently, loginWithRedirect, isAuthenticated } =
    useAuth0();
  const [token, setToken] = useState<string | null>(null);
  useEffect(() => {
    const getToken = async () => {
      if (!isAuthenticated) {
        return;
      }
      try {
        const accessToken = await getAccessTokenSilently();
        setToken(accessToken);
      } catch (err) {
        await loginWithRedirect({
          appState: {
            returnTo: BASE_PATH + pathName,
          },
        });
      }
    };
    getToken();
  }, [getAccessTokenSilently, isAuthenticated, loginWithRedirect]);

  return token;
};
