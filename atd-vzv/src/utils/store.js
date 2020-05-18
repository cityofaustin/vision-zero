import React, { useState, useEffect } from "react";
import { mapStartDate, mapEndDate } from "../constants/time";
import { useIsMobile } from "../constants/responsive";

export const StoreContext = React.createContext(null);

export default ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mapFilters, setMapFilters] = useState([]);
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
  const isMobile = useIsMobile();
  useEffect(() => {
    !isMobile && setIsOpen(false);
  }, [isMobile, setIsOpen]);

  const store = {
    mapFilters: [mapFilters, setMapFilters],
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
