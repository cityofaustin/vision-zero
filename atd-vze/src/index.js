import "react-app-polyfill/ie9"; // For IE 9-11 support
import "react-app-polyfill/stable";
// import 'react-app-polyfill/ie11'; // For IE 11 support
import "./polyfill";
import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import { history } from "./auth/history";
import { Auth0Provider, urlPath, onRedirectCallback } from "./auth/authContext";
import { HashRouter } from "react-router-dom";
import * as serviceWorker from "./serviceWorker";

console.log("🤖 Release Drafter Test");
// Setup Auth0 config for Auth0Provider component
ReactDOM.render(
  <HashRouter history={history}>
    <Auth0Provider
      domain={process.env.REACT_APP_AUTH0_DOMAIN}
      client_id={process.env.REACT_APP_AUTH0_CLIENT_ID}
      redirect_uri={`${urlPath}/callback`}
      onRedirectCallback={onRedirectCallback}
      response_type={"token id_token"}
      scope={"openid profile email"}
    >
      <App />
    </Auth0Provider>
  </HashRouter>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
