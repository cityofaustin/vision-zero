import { useEffect } from "react";
import ReactGA from "react-ga";
import { useLocation } from "react-router-dom";
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartBar, faMap } from "@fortawesome/free-solid-svg-icons";

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

// Custom hook that tracks route changes with GA
export function useTrackedRoutes() {
  const location = useLocation();
  const currentPath = location.pathname;

  useEffect(() => {
    ReactGA.pageview(currentPath);
  }, [currentPath]);

  // This hook just tracks pageviews
  return null;
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
