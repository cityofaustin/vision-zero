import React, { useContext, useEffect, useRef } from "react";
import { HashRouter, Route, Switch, Redirect } from "react-router-dom";
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
const Callback = React.lazy(() => import("./auth/Callback"));
const Register = React.lazy(() => import("./views/Pages/Register"));
const Page404 = React.lazy(() => import("./views/Pages/Page404"));
const Page500 = React.lazy(() => import("./views/Pages/Page500"));

const App = () => {
  const {
    loading,
    user,
    loginWithPopup,
    isAuthenticated,
    getIdTokenClaims,
  } = useAuth0();

  // Apollo client settings.
  let client = useRef(new ApolloClient());

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
      });
    }
  }, [isAuthenticated, client, getIdTokenClaims]);

  const renderLoading = () => (
    <div className="animated fadeIn pt-3 text-center">Loading...</div>
  );

  return (
    // TODO: Need to update the ref assignment here

    <ApolloProvider client={client.current}>
      <HashRouter>
        <React.Suspense fallback={renderLoading()}>
          <Switch>
            <Route
              exact
              path="/callback"
              name="Callback Page"
              render={props => <Callback {...props} />}
            />
            <Route
              exact
              path="/login"
              name="Login Page"
              render={props => (
                // If not authenticated, otherwise render.
                <Login login={loginWithPopup} loading={loading} {...props} />
              )}
            />
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
            <Route
              path="/"
              name="Home"
              exact
              // If authenticated, render, if not log in.
              render={props =>
                isAuthenticated && user ? (
                  <DefaultLayout {...props} />
                ) : (
                  <Redirect to="/login" />
                )
              }
            />
          </Switch>
        </React.Suspense>
      </HashRouter>
    </ApolloProvider>
  );
};

export default App;
