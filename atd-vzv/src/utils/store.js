import React, { useState } from "react";

export const StoreContext = React.createContext(null);

export default ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const store = {
    sidebarToggle: [isOpen, setIsOpen]
  };

  return (
    <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
  );
};
