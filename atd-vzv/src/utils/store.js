import React, { useState } from "react";
import { mapStartDate, mapEndDate } from "../views/summary/helpers/time";

export const StoreContext = React.createContext(null);

export default ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mapFilters, setMapFilters] = useState([]);
  const [mapDateRange, setMapDateRange] = useState({
    start: mapStartDate,
    end: mapEndDate
  });

  const store = {
    mapFilters: [mapFilters, setMapFilters],
    mapDateRange: [mapDateRange, setMapDateRange],
    sidebarToggle: [isOpen, setIsOpen]
  };

  return (
    <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
  );
};
