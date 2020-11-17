import React, { useState, useEffect, useContext } from "react";
import createAuth0Client from "@auth0/auth0-spa-js";

export const Auth0Context = React.createContext();

// Custom hook to make accessing the context a bit easier
export const useAuth0 = () => useContext(Auth0Context);

// Set app url based on environment
export const urlPath =
  process.env.NODE_ENV === "development"
    ? window.location.origin
    : `${window.location.origin}/editor`;

// Roles helpers for rules-based access
export const isReadOnly = rolesArray =>
  rolesArray.includes("readonly") && rolesArray.length === 1;

export const isEditor = rolesArray => rolesArray.includes("editor");

export const isAdmin = rolesArray => rolesArray.includes("admin");

export const isItSupervisor = rolesArray => rolesArray.includes("itSupervisor");

// Fires after Auth0 handles auth so we can redirect to where user started
export const onRedirectCallback = appState => {
  window.location.href = appState.targetUrl;
};

export const Auth0Provider = ({
  children,
  onRedirectCallback,
  ...initOptions
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState();
  const [user, setUser] = useState();
  const [userClaims, setUserClaims] = useState();
  const [auth0Client, setAuth0] = useState();
  const [loading, setLoading] = useState(true);

  // Instantiate Auth0, handle auth callback, and set loading and user params
  useEffect(() => {
    const initAuth0 = async () => {
      const auth0FromHook = await createAuth0Client({
        ...initOptions,
        useRefreshTokens: true,
        cacheLocation: "localstorage",
      });
      setAuth0(auth0FromHook);

      // If callback URL, handle it
      if (
        window.location.search.includes("code=") &&
        window.location.search.includes("state=")
      ) {
        const { appState } = await auth0FromHook.handleRedirectCallback();
        onRedirectCallback(appState);
      }

      const isAuthenticated = await auth0FromHook.isAuthenticated();
      setIsAuthenticated(isAuthenticated);

      if (isAuthenticated) {
        const user = await auth0FromHook.getUser();
        setUser(user);

        const claims = await auth0FromHook.getIdTokenClaims();
        setUserClaims(claims);

        localStorage.setItem("hasura_user_email", user["email"]);
        localStorage.setItem(
          "hasura_user_role",
          user["https://hasura.io/jwt/claims"]["x-hasura-allowed-roles"]
        );
        localStorage.setItem("id_token", claims.__raw);
      }

      setLoading(false);
    };
    initAuth0();
    // eslint-disable-next-line
  }, []);

  const handleRedirectCallback = async () => {
    setLoading(true);
    await auth0Client.handleRedirectCallback();
    const user = await auth0Client.getUser();
    setLoading(false);
    setIsAuthenticated(true);
    setUser(user);
  };

  const logout = () => {
    auth0Client.logout({ returnTo: urlPath });
  };

  const getRoles = () => {
    return user["https://hasura.io/jwt/claims"]["x-hasura-allowed-roles"];
  };

  // Get Hasura role needed for Hasura role permissions
  const getHasuraRole = () => {
    const role = user["https://hasura.io/jwt/claims"]["x-hasura-allowed-roles"];
    // If user has more than one role, they are itSupervisor and need admin role for Hasura to return data
    return role.length > 1 ? "admin" : role[0];
  };

  // Context provider supplies value below at index.js level
  return (
    <Auth0Context.Provider
      value={{
        isAuthenticated,
        user,
        loading,
        handleRedirectCallback,
        userClaims,
        getRoles,
        getHasuraRole,
        getIdTokenClaims: (...p) => auth0Client.getIdTokenClaims(...p),
        loginWithRedirect: (...p) =>
          auth0Client.loginWithRedirect({
            // Auth0 will cache our starting url so we can redirect user after login
            appState: { targetUrl: window.location.href },
          }),
        logout,
      }}
    >
      {children}
    </Auth0Context.Provider>
  );
};
