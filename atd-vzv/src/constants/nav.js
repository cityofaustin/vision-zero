import { useEffect } from "react";
import ReactGA from "react-ga";
import { useRoutes, usePath } from "hookrouter";

// Detect the environment
export const isDevelopment =
  !process.env.NODE_ENV || process.env.NODE_ENV === "development";

export const navConfig = [
  {
    title: "Summary",
    url: "/",
    eventKey: "summaryNavButton",
  },
  { title: "Map", url: "/map", eventKey: "mapNavButton" },
];

// Initialze analytics
export const Tracker = ReactGA.initialize("UA-85076727-3");

// Custom hook that returns hookrouter route and tracks route change with GA
export function useTrackedRoutes(routes) {
  const routeResult = useRoutes(routes);
  const currentPath = usePath();

  useEffect(() => {
    trackPageView(currentPath);
  }, [routeResult, currentPath]);

  return routeResult;
}

export const trackPageView = (path) => {
  ReactGA.pageview(path);
};

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
