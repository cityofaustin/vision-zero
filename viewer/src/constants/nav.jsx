import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartBar, faMap } from "@fortawesome/free-solid-svg-icons";
import { trackUmamiEvent } from "../utils/umami";

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

// Events to track with Umami
const events = {
  fatal: "Select Fatal Filter Button",
  injury: "Select Serious Injury Filter Button",
  summaryNavButton: "Select Summary Nav Button",
  mapNavButton: "Select Map Nav Button",
};

export const trackPageEvent = (eventKey) => {
  const eventValue = events[eventKey];
  if (eventValue) {
    trackUmamiEvent(eventValue);
  }
};
