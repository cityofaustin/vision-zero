import React from "react";
import Summary from "../views/summary/Summary";
import SummaryView from "../views/summary/SummaryView";
import Map from "../views/map/Map";

// Set basepath for VZV url
export const basepath = "/viewer";

export const routeConfig = [
  {
    path: "/",
    element: <Summary />,
  },
  {
    path: "/map",
    element: <Map />,
  },
  {
    path: "/measures",
    element: <SummaryView />,
  },
];
