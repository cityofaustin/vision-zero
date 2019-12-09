import React, { useState } from "react";

export const StoreContext = React.createContext(null);

export default ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mapFilters, setMapFilters] = useState([]);

  const store = {
    mapFilters: [mapFilters, setMapFilters],
    sidebarToggle: [isOpen, setIsOpen]
  };

  return (
    <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
  );
};
