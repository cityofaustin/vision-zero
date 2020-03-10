import React, { useState } from "react";
import auth0 from "auth0-js";

export const StoreContext = React.createContext(null);

export default ({ children }) => {
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

  const login = () => {
    auth.authorize();
  };

  const handleAuthentication = () => {
    debugger;
    const urlPrefix = window.location.origin;
    auth.parseHash((err, authResult) => {
      if (authResult && authResult.accessToken && authResult.idToken) {
        setSession(authResult);
        // TODO: Redirect to "/"
        window.location = urlPrefix + "/";
        // this.history.push("/");
      } else if (err) {
        // TODO: Redirect to "/"
        window.location = urlPrefix + "/";
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

    // set the time that the access token will expire
    const expiresAt = JSON.stringify(
      authResult.expiresIn * 1000 + new Date().getTime()
    );
    localStorage.setItem("access_token", authResult.accessToken);
    localStorage.setItem("id_token", authResult.idToken);
    localStorage.setItem("expires_at", expiresAt);

    setAuthenticated(true);
    setAccessToken(authResult.accessToken);
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("id_token");
    localStorage.removeItem("expires_at");

    auth.logout({
      clientID: process.env.REACT_APP_AUTH0_CLIENT_ID,
      returnTo: this.urlPath,
    });

    const urlPrefix = window.location.origin;
    setAuthenticated(false);
    setAccessToken("");
    setUser({
      roles: "",
    });
    window.location = urlPrefix + "/";
  };

  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState({
    roles: "",
  });
  const [accessToken, setAccessToken] = useState(false);

  const store = {
    authenticated: [authenticated, setAuthenticated],
    user: [user, setUser],
    accessToken: [accessToken, setAccessToken],
    login: login,
    logout: logout,
    handleAuthentication: handleAuthentication,
  };

  return (
    <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
  );
};

// Helper function that hasura_user_role from localstorage, or any value we need to get for defaults. Null for the time being.
// TODO: Get this data from Context store
// TODO: Change this to roles (permissions will be determined by .includes)
// getRole() {
//   return localStorage.getItem("hasura_user_role") || null;
// }

// getToken() {
//   return localStorage.getItem("id_token") || null;
// }

// const initializeProfile = () => {
//   // If we already have a role, then let's not worry about it...
//   if (this.getRole() !== null) return;

//   // Else, we need to initialize it if we are authenticated
//   if (this.auth.isAuthenticated()) {
//     this.auth.getProfile((profile, error) => {
//       try {
//         const role =
//           profile["https://hasura.io/jwt/claims"][
//             "x-hasura-allowed-roles"
//           ][0];
//         localStorage.setItem("hasura_user_email", profile["email"]);
//         localStorage.setItem("hasura_user_role", role);
//         this.setState({ role: role });
//         this.initializeClient();
//       } catch (error) {
//         alert("Error: " + error);
//       }
//       this.setState({ profile, error });
//     });
//   }
// };
