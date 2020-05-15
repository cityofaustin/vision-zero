import ReactGA from "react-ga";

export const Tracker = ReactGA.initialize("UA-85076727-3");

export const trackPageView = (path) => {
  console.log(path);
  //   ReactGA.pageview(window.location.pathname + window.location.search);
};
