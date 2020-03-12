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
      const auth0FromHook = await createAuth0Client(initOptions);
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

  // Context provider supplies value below at index.js level
  return (
    <Auth0Context.Provider
      value={{
        isAuthenticated,
        user,
        loading,
        handleRedirectCallback,
        userClaims,
        getIdTokenClaims: (...p) => auth0Client.getIdTokenClaims(...p),
        loginWithRedirect: (...p) => auth0Client.loginWithRedirect(...p),
        logout,
      }}
    >
      {children}
    </Auth0Context.Provider>
  );
};
