import React, { useState } from "react";
import auth0 from "auth0-js";

import { AuthProvider } from "../utils/AuthContext";

const Auth = ({ children }) => {
  const urlPath =
    process.env.NODE_ENV === "development"
      ? window.location.origin
      : `${window.location.origin}/editor`;

  const auth = new auth0.WebAuth({
    domain: process.env.REACT_APP_AUTH0_DOMAIN,
    clientID: process.env.REACT_APP_AUTH0_CLIENT_ID,
    redirectUri: `${urlPath}/callback`,
    responseType: "token id_token",
    scope: "openid profile email",
  });

  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState({
    roles: "",
  });
  const [accessToken, setAccessToken] = useState(false);

  const login = () => {
    auth.authorize();
  };

  const handleAuthentication = () => {
    auth.parseHash((err, authResult) => {
      if (authResult && authResult.accessToken && authResult.idToken) {
        setSession(authResult);
        // TODO: Redirect to "/"
        // this.history.push("/");
      } else if (err) {
        // TODO: Redirect to "/"
        // this.history.push("/");
        alert(`Error: ${err.error}. Check the console for further details.`);
      }
    });
  };

  const setSession = authResult => {
    const user = {
      id: authResult.sub,
      email: authResult.email,
      roles: authResult.app_metadata.roles,
    };

    setAuthenticated(true);
    setAccessToken(authResult.accessToken);
    setUser(user);
  };

  const logout = () => {
    setAuthenticated(false);
    setAccessToken("");
    setUser({
      roles: "",
    });

  const authProviderValue = {
    login: login,
    handleAuthentication: handleAuthentication,
    logout: logout,
  };

  return <AuthProvider value={authProviderValue}>{children}</AuthProvider>;
};

export default Auth;
