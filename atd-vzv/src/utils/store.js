import React, { useState } from "react";
import { dataStartDate, dataEndDate } from "../constants/time";

export const StoreContext = React.createContext(null);

export default ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mapFilters, setMapFilters] = useState([]);
  const [mapDateRange, setMapDateRange] = useState({
    start: dataStartDate,
    end: dataEndDate
  });
  const [mapTimeWindow, setMapTimeWindow] = useState("");
  const [mapOverlay, setMapOverlay] = useState({
    name: "",
    options: []
  });

  const store = {
    mapFilters: [mapFilters, setMapFilters],
    mapDateRange: [mapDateRange, setMapDateRange],
    mapTimeWindow: [mapTimeWindow, setMapTimeWindow],
    sidebarToggle: [isOpen, setIsOpen],
    mapOverlay: [mapOverlay, setMapOverlay]
  };

  return (
    <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
  );
};
