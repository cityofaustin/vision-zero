import React, { useState } from "react";

export const StoreContext = React.createContext(null);

export default ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mapFilters, setMapFilters] = useState([]);
  const [mapDateRange, setMapDateRange] = useState({
    start: `2019-01-12T00:00:00`,
    end: `2019-12-07T23:59:59`
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
