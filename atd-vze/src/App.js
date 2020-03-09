import React, { useContext } from "react";
import { HashRouter, Route, Switch, Redirect } from "react-router-dom";
import { StoreContext } from "./utils/authContextStore";
import Callback from "./auth/Callback";

// Authentication

// import Callback from "./auth/Callback";

// Apollo GraphQL Client
import ApolloClient from "apollo-boost";
import { ApolloProvider } from "@apollo/react-hooks";

// Style
import "./App.scss";

// Apollo client settings.
let client = new ApolloClient();

const loading = () => (
  <div className="animated fadeIn pt-3 text-center">Loading...</div>
);

// Containers
const DefaultLayout = React.lazy(() => import("./containers/DefaultLayout"));

// Pages
const Login = React.lazy(() => import("./views/Pages/Login"));
const Register = React.lazy(() => import("./views/Pages/Register"));
const Page404 = React.lazy(() => import("./views/Pages/Page404"));
const Page500 = React.lazy(() => import("./views/Pages/Page500"));

// Hasura Endpoint
const HASURA_ENDPOINT = process.env.REACT_APP_HASURA_ENDPOINT;

const App = () => {
  const {
    authenticated: [authenticated],
    login,
    handleAuthentication,
  } = useContext(StoreContext);
  // constructor(props) {
  //   super(props);

  //   this.state = {
  //     token: this.getToken(),
  //     role: this.getRole(),
  //   };

  //   // We first instantiate our auth helper class
  //   // this.auth = new Auth(this.props.history);

  //   // Now we handle callbacks (if any)
  //   this.callbackHandler();
  //   this.initializeProfile();
  //   this.initializeClient();
  // }

  // Helper function that hasura_user_role from localstorage, or any value we need to get for defaults. Null for the time being.
  // TODO: Get this data from Context store
  // TODO: Change this to roles (permissions will be determined by .includes)
  // getRole() {
  //   return localStorage.getItem("hasura_user_role") || null;
  // }

  // getToken() {
  //   return localStorage.getItem("id_token") || null;
  // }

  const initializeProfile = () => {
    // If we already have a role, then let's not worry about it...
    if (this.getRole() !== null) return;

    // Else, we need to initialize it if we are authenticated
    if (this.auth.isAuthenticated()) {
      this.auth.getProfile((profile, error) => {
        try {
          const role =
            profile["https://hasura.io/jwt/claims"][
              "x-hasura-allowed-roles"
            ][0];
          localStorage.setItem("hasura_user_email", profile["email"]);
          localStorage.setItem("hasura_user_role", role);
          this.setState({ role: role });
          this.initializeClient();
        } catch (error) {
          alert("Error: " + error);
        }
        this.setState({ profile, error });
      });
    }
  };

  const initializeClient = () => {
    // TODO: Start Apollo if auth in Context store
    if (authenticated) {
      //   if (this.state.role !== null) {
      client = new ApolloClient({
        uri: HASURA_ENDPOINT,
        headers: {
          Authorization: `Bearer ${this.state.token}`,
          "x-hasura-role": this.state.role,
        },
      });
      //   }
    }
  };

  // callbackHandler() {
  //   /*
  //     This seems to work for now, let's see if we can make the router take care
  //     of this at some point.
  //   */
  //   if (
  //     window.location.pathname.startsWith("/callback") ||
  //     window.location.pathname.startsWith("/editor/callback")
  //   ) {
  //     // Handle authentication if expected values are in the URL.
  //     if (/access_token|id_token|error/.test(window.location.hash)) {
  //       this.handleAuthentication();
  //     } else {
  //       const prefix = window.location.pathname.startsWith("/editor")
  //         ? "/editor"
  //         : "";
  //       window.location = prefix + "/#/login";
  //     }
  //   }
  // }

  return (
    <ApolloProvider client={client}>
      <HashRouter>
        <React.Suspense fallback={loading()}>
          <Switch>
            {/* Uncomment these whenever we find a way to implement the
              /callback route. */}
            <Route
              exact
              path="/callback"
              name="Callback Page"
              render={props => (
                <Callback
                  handleAuthentication={handleAuthentication}
                  {...props}
                />
              )}
            />
            <Route
              exact
              path="/login"
              name="Login Page"
              render={props => <Login login={login} {...props} />}
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
                  <DefaultLayout auth={this.auth} {...props} />
                ) : (
                  <Redirect to="/login" />
                )
              }
            />
            } />
          </Switch>
        </React.Suspense>
      </HashRouter>
    </ApolloProvider>
  );
};

export default App;
