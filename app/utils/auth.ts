import { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { User } from "@auth0/auth0-react";

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
    // `vz-admin` is the Hasura rolename, `itSupervisor` is a legacy role that was previously
    // used to enable a user to create and edit other admins. this app will do away with
    // that behavior: any admin can create and modify other admins. A follow-up task is
    // to clean up the Auth0 user database that references `itSupervisor`
    return "vz-admin";
  } else {
    return roles[0] || "";
  }
};

/**
 * Hook which retrieves the user's bearer token from the logged-in
 * user's IdToken claims.
 *
 * Todo: our Auth0 app is configured to return idTokens, which are
 * "opaque" proprietary Auth0 tokens, seemingly because this enables us
 * to interact with the User Management API. as a result, we must
 * use idToken.__raw to grab the actual JWT. it seems like our setup
 * may be misconfigured, because accessing .__raw seems like a hack :/
 *
 * the typical setup would enable use to use the getAccessTokenSilently()
 * method, but that doesn't work with the opaque tokens.
 *
 * dicussion here: https://community.auth0.com/t/getting-the-jwt-id-token-from-auth0-spa-js/28281/3
 */
export const useToken = () => {
  const [token, setToken] = useState<string>("");
  const { getIdTokenClaims } = useAuth0();
  /**
   * Get the user token - just one time
   */
  useEffect(() => {
    if (!token) {
      getIdTokenClaims().then((idToken) => {
        setToken(idToken?.__raw || "");
      });
    }
  }, [token, getIdTokenClaims]);
  return token;
};
