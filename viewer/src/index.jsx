import "./utils/chartjs-setup.js";

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { basepath } from "./routes/routes";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";
import App from "./App";
import StoreProvider from "./utils/store";
import * as serviceWorker from "./serviceWorker";

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
