import React, { useState } from "react";

export const StoreContext = React.createContext(null);

export default ({ children }) => {
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState({
    roles: "",
  });
  const [accessToken, setAccessToken] = useState(false);

  const store = {
    authenticated: [authenticated, setAuthenticated],
    mapDateRange: [user, setUser],
    mapTimeWindow: [accessToken, setAccessToken],
  };

  return (
    <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
  );
};
