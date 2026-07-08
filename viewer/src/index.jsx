import "./utils/chartjs-setup.js";
import "events-polyfill";

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
// import "./utils/chartjs-setup";
import { basepath } from "./routes/routes";
import "./index.css";
import App from "./App";
import StoreProvider from "./utils/store";
import * as serviceWorker from "./serviceWorker";
import "bootstrap/dist/css/bootstrap.css";

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

const root = ReactDOM.createRoot(document.getElementById("root"));

if (import.meta.env.MODE !== "production") {
  import("react-axe").then((axe) => {
    axe.default(React, ReactDOM, 1000);
    root.render(
      <StoreProvider>
        <BrowserRouter basename={basepath}>
          <App />
        </BrowserRouter>
      </StoreProvider>,
    );
  });
} else {
  root.render(
    <StoreProvider>
      <BrowserRouter basename={basepath}>
        <App />
      </BrowserRouter>
    </StoreProvider>,
  );
}

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
