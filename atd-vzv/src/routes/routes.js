import React from "react";
import Summary from "../views/summary/Summary";
import Map from "../views/map/Map";

export const routes = {
  "/": () => <Summary />,
  "/map": () => <Map />
};
