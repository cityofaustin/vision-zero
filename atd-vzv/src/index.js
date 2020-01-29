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

ReactDOM.render(
  <StoreProvider>
    <App />
  </StoreProvider>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
