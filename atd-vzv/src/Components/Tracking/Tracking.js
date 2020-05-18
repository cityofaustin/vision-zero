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

export const trackPageEvent = (category, action) => {
  console.log(`${category}: ${action}`);
  ReactGA.event({
    category,
    action,
  });
};
