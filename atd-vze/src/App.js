import React, { useContext, useEffect, useRef } from "react";
import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";
import { StoreContext } from "./auth/authContextStore";

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
    authenticated: [authenticated],
    accessToken: [accessToken],
    login,
  } = useContext(StoreContext);

  const getToken = () => {
    return localStorage.getItem("id_token") || null;
  };

  // Apollo client settings.
  let client = useRef(new ApolloClient(new ApolloClient()));

  useEffect(() => {
    // Hasura Endpoint
    const HASURA_ENDPOINT = process.env.REACT_APP_HASURA_ENDPOINT;

    if (authenticated && accessToken) {
      const clientData = {
        uri: HASURA_ENDPOINT,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "x-hasura-role": "editor",
        },
      };

      client.current = new ApolloClient(clientData);
    }
  }, [authenticated, client, accessToken]);

  const loading = () => (
    <div className="animated fadeIn pt-3 text-center">Loading...</div>
  );

  return (
    <ApolloProvider client={client.current}>
      <BrowserRouter>
        <React.Suspense fallback={loading()}>
          <Switch>
            {/* Uncomment these whenever we find a way to implement the
              /callback route. */}
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
              render={props =>
                !authenticated ? (
                  <Login login={login} {...props} />
                ) : (
                  <Redirect to="/" />
                )
              }
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
              // If authenticated, render, if not log in.
              render={props =>
                authenticated ? (
                  <DefaultLayout {...props} />
                ) : (
                  <Redirect to="/login" />
                )
              }
            />
          </Switch>
        </React.Suspense>
      </BrowserRouter>
    </ApolloProvider>
  );
};

export default App;
