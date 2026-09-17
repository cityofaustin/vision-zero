import React from "react";
import Summary from "../views/summary/Summary";
import SummaryView from "../views/summary/SummaryView";
import MapComponent from "src/views/map/MapComponent";

// Set basepath for VZV url
export const basepath = "/viewer";

export const routeConfig = [
  {
    path: "/",
    element: <Summary />,
  },
  {
    path: "/map",
    element: <MapComponent />,
  },
  {
    path: "/measures",
    element: <SummaryView />,
  },
];
