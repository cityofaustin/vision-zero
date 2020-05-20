import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartBar, faMap } from "@fortawesome/free-solid-svg-icons";

// Detect the environment
export const isDevelopment =
  !process.env.NODE_ENV || process.env.NODE_ENV === "development";

export const navConfig = [
  {
    title: "Summary",
    url: "/",
    icon: <FontAwesomeIcon icon={faChartBar} />,
  },
  { title: "Map", url: "/map", icon: <FontAwesomeIcon icon={faMap} /> },
];
