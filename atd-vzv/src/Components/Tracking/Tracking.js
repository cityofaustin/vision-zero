import { useEffect } from "react";
import ReactGA from "react-ga";
import { useRoutes, usePath } from "hookrouter";

export const Tracker = ReactGA.initialize("UA-85076727-3");

export function useTrackedRoutes(routes) {
  const routeResult = useRoutes(routes);
  const currentPath = usePath();

  useEffect(() => {
    trackPageView(currentPath);
  }, [routeResult, currentPath]);

  return routeResult;
}

export const trackPageView = (path) => {
  console.log(path);
  ReactGA.pageview(path);
};

const events = {
  fatal: "Select Fatal Filter Button",
  injury: "Select Serious Injury Filter Button",
  summaryNavButton: "Select Summary Nav Button",
  mapNavButton: "Select Map Nav Button",
};

export const trackPageEvent = (eventKey) => {
  const eventValue = events[eventKey];
  console.log(`User: ${eventValue}`);
  ReactGA.event({
    category: "User",
    action: eventValue,
  });
};
