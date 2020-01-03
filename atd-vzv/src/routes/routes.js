import React from "react";
import Dashboard from "../views/dashboard/Dashboard";
import Map from "../views/map/Map";

export const routes = {
  "/charts": () => <Dashboard />,
  "/map": () => <Map />
};
