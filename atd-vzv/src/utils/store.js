import React, { useState } from "react";
import { dataStartDate, dataEndDate } from "../constants/time";

export const StoreContext = React.createContext(null);

export default ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mapFilters, setMapFilters] = useState([]);
  const [isMapTypeSet, setIsMapTypeSet] = useState({
    fatal: true,
    injury: true,
  });
  const [mapDateRange, setMapDateRange] = useState({
    start: dataStartDate,
    end: dataEndDate,
  });
  const [mapTimeWindow, setMapTimeWindow] = useState("");
  const [mapOverlay, setMapOverlay] = useState({
    name: "",
    options: [],
  });
  const [mapPolygon, setMapPolygon] = useState(null);

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
