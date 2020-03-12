// import React, { useState, useRef } from "react";

// export const StoreContext = React.createContext(null);

// export default ({ children, auth, urlPath }) => {
//   const login = () => {
//     debugger;
//     auth.loginWithRedirect();
//   };

//   const handleAuthentication = () => {
//     auth.handleRedirectCallback().then(result => {
//       auth.getUser().then(user => {
//         debugger;
//         setSession(result);
//       });
//     });
//   };

//   const setSession = authResult => {
//     const result = authResult.idTokenPayload;

//     // set the time that the access token will expire
//     const expiresAt = JSON.stringify(
//       authResult.expiresIn * 1000 + new Date().getTime()
//     );
//     localStorage.setItem("access_token", authResult.accessToken);
//     localStorage.setItem("id_token", authResult.idToken);
//     localStorage.setItem("expires_at", expiresAt);
//     localStorage.setItem("hasura_user_email", result.email);
//     localStorage.setItem(
//       "hasura_user_roles",
//       result["https://hasura.io/jwt/claims"]["x-hasura-allowed-roles"]
//     );

//     setAuthenticated(true);
//     setAccessToken(authResult.idToken);
//     setUser(result);
//   };

//   const logout = () => {
//     localStorage.removeItem("access_token");
//     localStorage.removeItem("id_token");
//     localStorage.removeItem("expires_at");

//     auth.logout({
//       clientID: process.env.REACT_APP_AUTH0_CLIENT_ID,
//       returnTo: urlPath,
//     });

//     const urlPrefix = window.location.origin;
//     setAuthenticated(false);
//     setAccessToken("");
//     setUser({
//       roles: "",
//     });
//     window.location = urlPrefix + "/";
//   };

//   const getRole = () => {
//     return localStorage.getItem("hasura_user_roles") || null;
//   };

//   const getToken = () => {
//     return !!localStorage.getItem("id_token") || null;
//   };

//   const [authenticated, setAuthenticated] = useState(false);
//   const [user, setUser] = useState({
//     roles: "",
//   });
//   const [accessToken, setAccessToken] = useState(false);
//   console.log("Context initialized", authenticated);

//   const store = {
//     authenticated: [authenticated, setAuthenticated],
//     user: [user, setUser],
//     accessToken: [accessToken, setAccessToken],
//     auth: auth,
//     login: login,
//     logout: logout,
//     handleAuthentication: handleAuthentication,
//     getToken: getToken,
//     getRole: getRole,
//   };

//   return (
//     <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
//   );
// };

// import React, { Component, createContext } from "react";
// import createAuth0Client from "@auth0/auth0-spa-js";
// import history from "./history";

// // create the context
// export const Auth0Context = createContext();

// const urlPath =
//   process.env.NODE_ENV === "development"
//     ? window.location.origin
//     : `${window.location.origin}/editor`;

// // create a provider
// export class Auth0Provider extends Component {
//   state = {
//     auth0Client: null,
//     isLoading: true,
//     isAuthenticated: false,
//     user: null,
//   };
//   config = {
//     domain: process.env.REACT_APP_AUTH0_DOMAIN,
//     client_id: process.env.REACT_APP_AUTH0_CLIENT_ID,
//     redirect_uri: `${urlPath}/callback`,
//     response_type: "token id_token",
//     scope: "openid profile email",
//   };

//   componentDidMount() {
//     this.initializeAuth0();
//   }

//   // initialize the auth0 library
//   initializeAuth0 = async () => {
//     const auth0Client = await createAuth0Client(this.config);

//     if (window.location.search.includes("code=")) {
//       return this.handleRedirectCallback();
//     }

//     const isAuthenticated = await auth0Client.isAuthenticated();
//     const user = isAuthenticated ? await auth0Client.getUser() : null;

//     this.setState({ auth0Client, isLoading: false, isAuthenticated, user });
//   };

//   handleRedirectCallback = async () => {
//     this.setState({ isLoading: true });

//     await this.state.auth0Client.handleRedirectCallback();
//     const user = await this.state.auth0Client.getUser();

//     this.setState({ user, isAuthenticated: true, isLoading: false }, () => {
//       window.history.replaceState({}, document.title, window.location.pathname);
//       // history.push("/");
//     });
//   };

//   render() {
//     const { auth0Client, isLoading, isAuthenticated, user } = this.state;
//     const { children } = this.props;

//     const configObject = {
//       isLoading,
//       isAuthenticated,
//       user,
//       loginWithRedirect: (...p) => auth0Client.loginWithRedirect(...p),
//       handleRedirectCallback: (...p) =>
//         auth0Client.handleRedirectCallback(...p),
//       getTokenSilently: (...p) => auth0Client.getTokenSilently(...p),
//       getIdTokenClaims: (...p) => auth0Client.getIdTokenClaims(...p),
//       logout: (...p) => auth0Client.logout(...p),
//     };

//     return (
//       <Auth0Context.Provider value={configObject}>
//         {children}
//       </Auth0Context.Provider>
//     );
//   }
// }

import React, { useState, useEffect, useContext } from "react";
import createAuth0Client from "@auth0/auth0-spa-js";

const DEFAULT_REDIRECT_CALLBACK = () =>
  window.history.replaceState({}, document.title, window.location.pathname);

export const Auth0Context = React.createContext();
export const useAuth0 = () => useContext(Auth0Context);
export const Auth0Provider = ({
  children,
  onRedirectCallback = DEFAULT_REDIRECT_CALLBACK,
  ...initOptions
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState();
  const [user, setUser] = useState();
  const [auth0Client, setAuth0] = useState();
  const [loading, setLoading] = useState(true);
  const [popupOpen, setPopupOpen] = useState(false);

  useEffect(() => {
    const initAuth0 = async () => {
      const auth0FromHook = await createAuth0Client(initOptions);
      setAuth0(auth0FromHook);
      if (
        window.location.search.includes("code=") &&
        window.location.search.includes("state=")
      ) {
        // const { appState } =
        await auth0FromHook.handleRedirectCallback();
        onRedirectCallback();
      }

      const isAuthenticated = await auth0FromHook.isAuthenticated();

      setIsAuthenticated(isAuthenticated);

      if (isAuthenticated) {
        const user = await auth0FromHook.getUser();
        setUser(user);
      }

      setLoading(false);
    };
    initAuth0();
  }, []);

  const loginWithPopup = async (params = {}) => {
    setPopupOpen(true);
    try {
      await auth0Client.loginWithPopup(params);
    } catch (error) {
      console.error(error);
    } finally {
      setPopupOpen(false);
    }
    const user = await auth0Client.getUser();
    setUser(user);
    setIsAuthenticated(true);
  };

  const handleRedirectCallback = async () => {
    setLoading(true);
    await auth0Client.handleRedirectCallback();
    const user = await auth0Client.getUser();
    setLoading(false);
    setIsAuthenticated(true);
    setUser(user);
  };
  return (
    <Auth0Context.Provider
      value={{
        isAuthenticated,
        user,
        loading,
        loginWithPopup,
        handleRedirectCallback,
        getIdTokenClaims: (...p) => auth0Client.getIdTokenClaims(...p),
        loginWithRedirect: (...p) => auth0Client.loginWithRedirect(...p),
        getTokenSilently: (...p) => auth0Client.getTokenSilently(...p),
        getTokenWithPopup: (...p) => auth0Client.getTokenWithPopup(...p),
        logout: (...p) => auth0Client.logout(...p),
      }}
    >
      {children}
    </Auth0Context.Provider>
  );
};
