import React from "react";
import ReactDOM from "react-dom";
import { setBasepath } from "hookrouter";
import { basepath } from "./routes/routes";
import "./index.css";
import App from "./App";
import StoreProvider from "./utils/store";
import * as serviceWorker from "./serviceWorker";
import "bootstrap/dist/css/bootstrap.css";
import ThemedStyleSheet from "react-with-styles/lib/ThemedStyleSheet";
import aphroditeInterface from "react-with-styles-interface-aphrodite";
import DefaultTheme from "react-dates/lib/theme/DefaultTheme";
import { colors } from "./constants/colors";

// TODO: Move to SideMapControlDateRange component
export const vzTheme = {
  reactDates: {
    ...DefaultTheme.reactDates,
    zIndex: 1301,
    border: {
      ...DefaultTheme.reactDates.border,
      input: {
        ...DefaultTheme.reactDates.border.input,
        borderBottomFocused: `2px solid ${colors.infoDark}`
      }
    },
    color: {
      ...DefaultTheme.reactDates.color,
      selected: {
        backgroundColor: `${colors.infoDark}`,
        backgroundColor_active: `${colors.infoDark}`,
        backgroundColor_hover: `${colors.infoDark}`,
        borderColor: `${colors.light}`,
        borderColor_active: `${colors.light}`,
        borderColor_hover: `${colors.light}`,
        color: `${colors.light}`,
        color_active: `${colors.light}`,
        color_hover: `${colors.light}`
      },
      selectedSpan: {
        backgroundColor: `${colors.info}`,
        backgroundColor_active: `${colors.info}`,
        backgroundColor_hover: `${colors.infoDark}`,
        borderColor: `${colors.light}`,
        borderColor_active: `${colors.light}`,
        borderColor_hover: `${colors.light}`,
        color: `${colors.light}`,
        color_active: `${colors.light}`,
        color_hover: `${colors.light}`
      },
      hoveredSpan: {
        backgroundColor: `${colors.secondary}`,
        backgroundColor_active: `${colors.infoDark}`,
        backgroundColor_hover: `${colors.infoDark}`,
        borderColor: `${colors.light}`,
        borderColor_active: `${colors.light}`,
        borderColor_hover: `${colors.light}`,
        color: `${colors.dark}`,
        color_active: `${colors.light}`,
        color_hover: `${colors.light}`
      }
    }
  }
};

ThemedStyleSheet.registerTheme(vzTheme);
ThemedStyleSheet.registerInterface(aphroditeInterface);

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
