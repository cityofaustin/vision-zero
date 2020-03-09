import React, { Component } from "react";
import auth0 from "auth0-js";

import { AuthProvider } from "../store/AuthContext";

export default class Auth extends Component {
  constructor(history) {
    this.history = history;
    this.userProfile = null;
    this.urlPath =
      process.env.NODE_ENV === "development"
        ? window.location.origin
        : `${window.location.origin}/editor`;
    this.auth0 = new auth0.WebAuth({
      domain: process.env.REACT_APP_AUTH0_DOMAIN,
      clientID: process.env.REACT_APP_AUTH0_CLIENT_ID,
      redirectUri: `${this.urlPath}/callback`,
      responseType: "token id_token",
      scope: "openid profile email",
    });
    this.state = {
      authenticated: false,
      user: {
        roles: "",
      },
      accessToken: "",
    };
  }

  login = () => {
    this.auth0.authorize();
  };

  handleAuthentication = () => {
    this.auth0.parseHash((err, authResult) => {
      if (authResult && authResult.accessToken && authResult.idToken) {
        this.setSession(authResult);
        this.history.push("/");
      } else if (err) {
        this.history.push("/");
        alert(`Error: ${err.error}. Check the console for further details.`);
      }
    });
  };

  setSession = authResult => {
    const user = {
      id: authResult.sub,
      email: authResult.email,
      roles: authResult.app_metadata.roles,
    };

    this.setState({
      authenticated: true,
      accessToken: authResult.accessToken,
      user,
    });
  };

  // TODO: Refactor to use store
  //   isAuthenticated() {
  //     const expiresAt = JSON.parse(localStorage.getItem("expires_at"));
  //     const currentTime = new Date().getTime();
  //     let isAuth = currentTime < expiresAt;
  //     return isAuth;
  //   }

  logout = () => {
    this.setState(
      {
        authenticated: false,
        user: {
          role: "visitor",
        },
        accessToken: "",
      },
      () => {
        this.history.push(this.urlPath);
      }
    );
    // this.userProfile = null;
    // this.auth0.logout({
    //   clientID: process.env.REACT_APP_AUTH0_CLIENT_ID,
    //   returnTo: this.urlPath,
    // });
  };

  // TODO: Update state or store with this value
  getAccessToken = () => {
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
      throw new Error("No access token found.");
    }
    return accessToken;
  };

  // TODO: Update state or store with this value
  getProfile = cb => {
    if (this.userProfile) return cb(this.userProfile);
    this.auth0.client.userInfo(this.getAccessToken(), (err, profile) => {
      if (profile) this.userProfile = profile;
      cb(profile, err);
    });
  };

  render() {
    const authProviderValue = {
      ...this.state,
      login: this.login,
      handleAuthentication: this.handleAuthentication,
      logout: this.logout,
    };
    return (
      <AuthProvider value={authProviderValue}>
        {this.props.children}
      </AuthProvider>
    );
  }
}
