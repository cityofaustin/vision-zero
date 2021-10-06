import React from "react";
import Summary from "../views/summary/Summary";
import SummaryView from "../views/summary/SummaryView";
import Map from "../views/map/Map";

// Set basepath for VZV url
export const basepath = "/viewer";

export const routes = {
  "/": () => <Summary />,
  "/map": () => <Map />,
  "/measures": () => <SummaryView />,
  "/measures/fatalities": () => <SummaryView measure="Fatalities" />,
  "/measures/yearsoflifelost": () => (
    <SummaryView measure="Years of Life Lost" />
  ),
  "/measures/seriousinjuries": () => <SummaryView measure="Serious Injuries" />,
  "/measures/totalcrashes": () => <SummaryView measure="Total Crashes" />,
};
