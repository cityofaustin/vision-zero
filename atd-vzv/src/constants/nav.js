import { useEffect } from "react";
import ReactGA from "react-ga";
import { useRoutes, usePath } from "hookrouter";
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartBar, faMap } from "@fortawesome/free-solid-svg-icons";

// Detect the environment
export const isDevelopment =
  !process.env.NODE_ENV || process.env.NODE_ENV === "development";

export const isPreview = process.env.REACT_APP_VZV_ENVIRONMENT === "PREVIEW";

export const navConfig = [
  {
    title: "Go to Summary",
    url: "/",
    eventKey: "summaryNavButton",
    icon: <FontAwesomeIcon icon={faChartBar} />,
  },
  {
    title: "Go to Map",
    url: "/map",
    eventKey: "mapNavButton",
    icon: <FontAwesomeIcon icon={faMap} />,
  },
];

// Initialize analytics
export const Tracker = ReactGA.initialize("UA-85076727-3");

// Custom hook that returns hookrouter route and tracks route change with GA
export function useTrackedRoutes(routes) {
  const routeResult = useRoutes(routes);
  const currentPath = usePath();

  useEffect(() => {
    ReactGA.pageview(currentPath);
  }, [routeResult, currentPath]);

  return routeResult;
}

// Events to track with GA
const events = {
  fatal: "Select Fatal Filter Button",
  injury: "Select Serious Injury Filter Button",
  summaryNavButton: "Select Summary Nav Button",
  mapNavButton: "Select Map Nav Button",
};

export const trackPageEvent = (eventKey) => {
  const eventValue = events[eventKey];
  ReactGA.event({
    category: "User",
    action: eventValue,
  });
};
