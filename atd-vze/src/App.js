import React, { useEffect, useRef, useState } from "react";
import { Route, Switch } from "react-router-dom";

import { useAuth0 } from "./auth/authContextStore";

// Apollo GraphQL Client
import ApolloClient from "apollo-boost";
import { ApolloProvider } from "@apollo/react-hooks";

// Style
import "./App.scss";

// Containers
const DefaultLayout = React.lazy(() => import("./containers/DefaultLayout"));

// Pages
const Login = React.lazy(() => import("./views/Pages/Login"));
const Register = React.lazy(() => import("./views/Pages/Register"));
const Page404 = React.lazy(() => import("./views/Pages/Page404"));
const Page500 = React.lazy(() => import("./views/Pages/Page500"));

const App = () => {
  const {
    loading,
    loginWithRedirect,
    isAuthenticated,
    getIdTokenClaims,
  } = useAuth0();

  // Apollo client settings.
  let client = useRef(new ApolloClient());

  const [isApolloLoaded, setIsApolloLoaded] = useState(false);

  useEffect(() => {
    // Hasura Endpoint
    const HASURA_ENDPOINT = process.env.REACT_APP_HASURA_ENDPOINT;

    if (isAuthenticated) {
      getIdTokenClaims().then(claims => {
        const clientData = {
          uri: HASURA_ENDPOINT,
          headers: {
            Authorization: `Bearer ${claims.__raw}`,
            "x-hasura-role": "editor",
          },
        };
        client.current = new ApolloClient(clientData);
        setIsApolloLoaded(true);
      });
    }
  }, [isAuthenticated, client, getIdTokenClaims, setIsApolloLoaded]);

  const renderLoading = () => (
    <div className="animated fadeIn pt-3 text-center">Loading...</div>
  );

  return (
    <ApolloProvider client={client.current}>
      <React.Suspense fallback={renderLoading()}>
        <Switch>
          {!isAuthenticated && (
            <Route
              path="/"
              name="Home"
              render={props => (
                <Login login={loginWithRedirect} loading={loading} {...props} />
              )}
            />
          )}
          {isAuthenticated && isApolloLoaded && (
            <Route
              path="/"
              name="Home"
              render={props => <DefaultLayout {...props} />}
            />
          )}
          <Route
            exact
            path="/register"
            name="Register Page"
            render={props => <Register {...props} />}
          />
          <Route
            exact
            path="/404"
            name="Page 404"
            render={props => <Page404 {...props} />}
          />
          <Route
            exact
            path="/500"
            name="Page 500"
            render={props => <Page500 {...props} />}
          />
        </Switch>
      </React.Suspense>
    </ApolloProvider>
  );
};

export default App;
