import React, { useState, useEffect, useReducer } from "react";
import { mapStartDate, mapEndDate } from "../constants/time";
import { useIsTablet } from "../constants/responsive";
import { mapFilterReducer } from "../views/nav/SideMapControl";

export const StoreContext = React.createContext(null);

export default ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mapFilters, mapFilterDispatch] = useReducer(mapFilterReducer, []);
  const [isMapTypeSet, setIsMapTypeSet] = useState({
    fatal: true,
    injury: true,
  });
  const [mapDateRange, setMapDateRange] = useState({
    start: mapStartDate,
    end: mapEndDate,
  });
  const [mapTimeWindow, setMapTimeWindow] = useState("");
  const [mapOverlay, setMapOverlay] = useState({
    name: "",
    options: [],
  });
  const [mapPolygon, setMapPolygon] = useState(null);

  // SideDrawer should never be open when not mobile
  const isTablet = useIsTablet();
  useEffect(() => {
    !isTablet && setIsOpen(false);
  }, [isTablet, setIsOpen]);

  const store = {
    mapFilters: [mapFilters, mapFilterDispatch],
    mapFilterType: [isMapTypeSet, setIsMapTypeSet],
    mapDateRange,
    setMapDateRange,
    mapTimeWindow: [mapTimeWindow, setMapTimeWindow],
    sidebarToggle: [isOpen, setIsOpen],
    mapOverlay: [mapOverlay, setMapOverlay],
    mapPolygon: [mapPolygon, setMapPolygon],
  };

  return (
    <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
  );
};
