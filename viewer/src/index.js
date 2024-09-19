import "react-app-polyfill/ie11";
import "react-app-polyfill/stable";
import "events-polyfill";

import React from "react";
import ReactDOM from "react-dom";
import { setBasepath } from "hookrouter";
import { basepath } from "./routes/routes";
import "./index.css";
import App from "./App";
import StoreProvider from "./utils/store";
import * as serviceWorker from "./serviceWorker";
import "bootstrap/dist/css/bootstrap.css";

// Account for /viewer/ basepath in all routing
setBasepath(basepath);

// IE11 SVG Polyfill
SVGElement.prototype.contains = function contains(node) {
  if (!(0 in arguments)) {
    throw new TypeError("1 argument is required");
  }

  do {
    if (this === node) {
      return true;
    }
  } while ((node = node && node.parentNode));

  return false;
};

if (process.env.NODE_ENV !== "production") {
  import("react-axe").then((axe) => {
    axe.default(React, ReactDOM, 1000);
    ReactDOM.render(
      <StoreProvider>
        <App />
      </StoreProvider>,
      document.getElementById("root")
    );
  });
} else {
  ReactDOM.render(
    <StoreProvider>
      <App />
    </StoreProvider>,
    document.getElementById("root")
  );
}

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
