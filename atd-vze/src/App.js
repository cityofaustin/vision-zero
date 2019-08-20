import React, { Component } from "react";
import { HashRouter, Route, Switch, Redirect } from "react-router-dom";

// Authentication
import Auth from "./auth/Auth";
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

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      token: this.getToken(),
      role: this.getRole(),
    };

    // We first instantiate our auth helper class
    this.auth = new Auth(this.props.history);

    // Now we handle callbacks (if any)
    this.callbackHandler();
    this.initializeProfile();
    this.initializeClient();
  }

  // Helper function that hasura_user_role from localstorage, or any value we need to get for defaults. Null for the time being.
  getRole() {
    return localStorage.getItem("hasura_user_role") || null;
  }

  getToken() {
    return localStorage.getItem("id_token") || null;
  }

  initializeProfile() {
    // If we already have a role, then let's not worry about it...
    if (this.getRole() !== null) return;

    // Else, we need to initialize it if we are authenticated
    if (this.auth.isAuthenticated()) {
      this.auth.getProfile((profile, error) => {
        try {
          const role =
            profile["https://hasura.io/jwt/claims"]["x-hasura-role"][0];
          localStorage.setItem("hasura_user_role", role);
          console.log("Role initialized: " + role);
          this.setState({ role: role });
          this.initializeClient();
        } catch (error) {
          console.log(error);
        }
        this.setState({ profile, error });
      });
    }
  }

  initializeClient() {
    if (this.auth.isAuthenticated()) {
      if (this.state.role !== null) {
        client = new ApolloClient({
          uri: "https://vzd.austintexas.io/v1/graphql",
          headers: {
            Authorization: `Bearer ${this.state.token}`,
            "x-hasura-role": this.state.role,
          },
        });
        console.log("Client Initialized");
      } else {
        console.log("Client not yet initialized, no role available.");
      }
    } else {
      console.log("Client not initialized, not authenticated.");
    }
  }

  callbackHandler() {
    /*
      This seems to work for now, let's see if we can make the router take care
      of this at some point.
    */
    if (window.location.pathname.startsWith("/callback")) {
      // Handle authentication if expected values are in the URL.
      if (/access_token|id_token|error/.test(window.location.hash)) {
        this.handleAuthentication();
      } else {
        window.location = "/#/login";
      }
    }
  }

  setSession = authResult => {
    console.log("Auth Result:");
    console.log(authResult);
    // set the time that the access token will expire
    const expiresAt = JSON.stringify(
      authResult.expiresIn * 1000 + new Date().getTime()
    );

    localStorage.setItem("access_token", authResult.accessToken);
    localStorage.setItem("id_token", authResult.idToken);
    localStorage.setItem("expires_at", expiresAt);

    this.setState({ token: authResult.idToken });
  };

  handleAuthentication() {
    this.auth.auth0.parseHash((err, authResult) => {
      if (authResult && authResult.accessToken && authResult.idToken) {
        this.setSession(authResult);
        window.location = "/#/dashboard";
      } else if (err) {
        alert(`Error: ${err.error}. Check the console for further details.`);
        console.log(err);
      }
    });
  }

  render() {
    return (
      <ApolloProvider client={client}>
        <HashRouter>
          <React.Suspense fallback={loading()}>
            <Switch>
              {/* Uncomment these whenever we find a way to implement the
              /callback route. */}
              {/*<Route*/}
              {/*  exact*/}
              {/*  path="/callback"*/}
              {/*  name="Callback Page"*/}
              {/*  render={props => <Callback auth={this.auth} {...props} />}*/}
              {/*/>*/}
              <Route
                exact
                path="/login"
                name="Login Page"
                render={props => <Login auth={this.auth} {...props} />}
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
                  this.auth.isAuthenticated() ? (
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
  }
}

export default App;
