import React, { useState, useRef } from "react";

import auth0 from "auth0-js";

export const StoreContext = React.createContext(null);

export default ({ children }) => {
  const urlPath =
    process.env.NODE_ENV === "development"
      ? window.location.origin
      : `${window.location.origin}/editor`;

  const authInstance = new auth0.WebAuth({
    domain: process.env.REACT_APP_AUTH0_DOMAIN,
    clientID: process.env.REACT_APP_AUTH0_CLIENT_ID,
    redirectUri: `${urlPath}/callback`,
    responseType: "token id_token",
    scope: "openid profile email",
  });

  let auth = useRef(authInstance);

  const login = () => {
    auth.current.authorize();
  };

  const handleAuthentication = () => {
    auth.current.parseHash((err, authResult) => {
      if (authResult && authResult.accessToken && authResult.idToken) {
        setSession(authResult);
      } else if (err) {
        alert(`Error: ${err.error}. Check the console for further details.`);
      }
    });
  };

  const setSession = authResult => {
    const result = authResult.idTokenPayload;

    // set the time that the access token will expire
    const expiresAt = JSON.stringify(
      authResult.expiresIn * 1000 + new Date().getTime()
    );
    localStorage.setItem("access_token", authResult.accessToken);
    localStorage.setItem("id_token", authResult.idToken);
    localStorage.setItem("expires_at", expiresAt);
    localStorage.setItem("hasura_user_email", result.email);
    localStorage.setItem(
      "hasura_user_roles",
      result["https://hasura.io/jwt/claims"]["x-hasura-allowed-roles"]
    );

    setAuthenticated(true);
    setAccessToken(authResult.idToken);
    setUser(result);
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("id_token");
    localStorage.removeItem("expires_at");

    auth.logout({
      clientID: process.env.REACT_APP_AUTH0_CLIENT_ID,
      returnTo: urlPath,
    });

    const urlPrefix = window.location.origin;
    setAuthenticated(false);
    setAccessToken("");
    setUser({
      roles: "",
    });
    window.location = urlPrefix + "/";
  };

  const getRole = () => {
    return localStorage.getItem("hasura_user_roles") || null;
  };

  const getToken = () => {
    return !!localStorage.getItem("id_token") || null;
  };

  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState({
    roles: "",
  });
  const [accessToken, setAccessToken] = useState(false);
  console.log("Context initialized", authenticated);

  const store = {
    authenticated: [authenticated, setAuthenticated],
    user: [user, setUser],
    accessToken: [accessToken, setAccessToken],
    auth: auth,
    login: login,
    logout: logout,
    handleAuthentication: handleAuthentication,
    getToken: getToken,
    getRole: getRole,
  };

  return (
    <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
  );
};
