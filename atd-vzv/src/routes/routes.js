import React from "react";
import Summary from "../views/summary/Summary";
import Map from "../views/map/Map";

export const routes = {
  "/": () => mapFilters => <Summary />,
  "/map": () => mapFilters => <Map mapFilters={mapFilters} />
};
