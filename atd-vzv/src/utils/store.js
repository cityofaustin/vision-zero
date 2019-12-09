import React from "react";

export const StoreContext = React.createContext(null);

export default ({ children }) => {
  const [mapFilters, setMapFilters] = React.useState([]);

  const store = {
    mapFilters: [mapFilters, setMapFilters]
  };

  return (
    <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
  );
};
