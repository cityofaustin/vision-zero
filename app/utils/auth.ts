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
 * Get a user's hasura role name from their allowed roles
 */
export const getHasuraRoleName = (user: CustomUser | undefined): string => {
  const roles =
    user?.["https://hasura.io/jwt/claims"]?.["x-hasura-allowed-roles"];

  if (!roles) {
    return "";
  } else if (roles.includes("vz-admin")) {
    // todo
    // If user has more than one role, it is because they have `itSupervisor` and `vz-admin`
    // `vz-admin` is the Hasura rolename, `itSupervisor` is some legacy name from back when
    // we used the hasura `admin` role instead of a named role for admins. John is pretty sure
    // sure we stop using `itSupervisor`
    return "vz-admin";
  } else {
    return roles[0] || "";
  }
};
