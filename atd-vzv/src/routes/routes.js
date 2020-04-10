import React from "react";
import Summary from "../views/summary/Summary";
import Map from "../views/map/Map";

// Set basepath for VZV url
export const basepath = "/viewer";

export const routes = {
  "/": () => <Summary />,
  "/map": () => <Map />,
};
