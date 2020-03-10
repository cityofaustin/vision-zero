import React, { useContext } from "react";
import { Redirect, useLocation } from "react-router-dom";
import { StoreContext } from "../auth/authContextStore";

const Callback = () => {
  const location = useLocation();
  const { handleAuthentication } = useContext(StoreContext);

  if (/access_token|id_token|error/.test(location.hash)) {
    handleAuthentication();
  }
  return <Redirect to="/" />;
};

export default Callback;
