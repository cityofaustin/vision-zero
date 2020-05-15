import React from "react";
import ReactGA from "react-ga";

export const ReactGA = ReactGA.initialize("UA-85076727-3");

export const PageView = () => {
  ReactGA.pageview(window.location.pathname + window.location.search);
};
